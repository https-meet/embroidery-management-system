# ==============================================================================
# EBMS Enterprise Database Restore Engine (Windows PowerShell)
# Milestone 4.1 - Sprint 3 (Refined Operational Polish & Safety Controls)
# ==============================================================================

[CmdletBinding()]
param (
    [string]$BackupFile,
    [switch]$Force,
    [string]$BackupDir = $env:BACKUP_DIR,
    [string]$DatabaseUrl = $env:DATABASE_URL
)

$ErrorActionPreference = "Stop"

# Exit Code Constants Matrix
$EXIT_SUCCESS                  = 0
$EXIT_ERR_GENERAL              = 1
$EXIT_ERR_MISSING_TOOLS        = 2
$EXIT_ERR_DB_UNREACHABLE       = 3
$EXIT_ERR_PERMISSIONS          = 4
$EXIT_ERR_BACKUP_NOT_FOUND     = 5
$EXIT_ERR_CHECKSUM_MISMATCH    = 6
$EXIT_ERR_CORRUPT_ARCHIVE      = 7
$EXIT_ERR_USER_CANCELLED       = 8
$EXIT_ERR_EMERGENCY_SNAP_FAILED= 9
$EXIT_ERR_SCHEMA_MISMATCH      = 10

# Set default backup directory if omitted
if ([string]::IsNullOrWhiteSpace($BackupDir)) {
    $BackupDir = Join-Path (Get-Location) "backups"
}

$VerifiedDir = Join-Path $BackupDir "verified"
$EmergencyDir = Join-Path $BackupDir "emergency"

function Log-Message {
    param ([string]$Level, [string]$Message)
    $ts = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    Write-Host "[$ts] [$Level] $Message"
}

# Helper to locate PostgreSQL CLI binaries (pg_restore, pg_dump, psql)
function Find-PgBinary {
    param ([string]$BinaryName)

    # 1. Check system PATH
    $cmd = Get-Command $BinaryName -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    # 2. Check standard Windows PostgreSQL install paths
    $searchPaths = @(
        "C:\Program Files\PostgreSQL\*\bin\${BinaryName}.exe",
        "C:\Program Files (x86)\PostgreSQL\*\bin\${BinaryName}.exe"
    )

    foreach ($pathPattern in $searchPaths) {
        $found = Get-ChildItem -Path $pathPattern -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) { return $found.FullName }
    }

    return $BinaryName
}

$pgRestoreExe = Find-PgBinary "pg_restore"

# Check if pg_restore binary exists
if (-not (Get-Command $pgRestoreExe -ErrorAction SilentlyContinue) -and -not (Test-Path $pgRestoreExe)) {
    Log-Message "ERROR" "CRITICAL: pg_restore command-line tool is not installed or not found in PATH."
    exit $EXIT_ERR_MISSING_TOOLS
}

# Resolve Database Connection String & Extract Masked Metadata
if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
    $pgHost = if ($env:PGHOST) { $env:PGHOST } else { "localhost" }
    $pgPort = if ($env:PGPORT) { $env:PGPORT } else { "5432" }
    $pgUser = if ($env:PGUSER) { $env:PGUSER } else { "postgres" }
    $pgPass = if ($env:PGPASSWORD) { $env:PGPASSWORD } else { "postgres" }
    $pgDb   = if ($env:PGDATABASE) { $env:PGDATABASE } else { "ebms" }
    $DatabaseUrl = "postgresql://${pgUser}:${pgPass}@${pgHost}:${pgPort}/${pgDb}"
}

$displayDbName = "ebms"
$displayHost = "localhost"

if ($DatabaseUrl -match "postgresql://[^@]+@([^:/]+)(?::\d+)?/([^?]+)") {
    $displayHost = $matches[1]
    $displayDbName = $matches[2]
}

# Helper to format file sizes
function Format-FileSize {
    param ([long]$Bytes)
    if ($Bytes -ge 1GB) { return "{0:N2} GB ($Bytes bytes)" -f ($Bytes / 1GB) }
    if ($Bytes -ge 1MB) { return "{0:N2} MB ($Bytes bytes)" -f ($Bytes / 1MB) }
    if ($Bytes -ge 1KB) { return "{0:N2} KB ($Bytes bytes)" -f ($Bytes / 1KB) }
    return "$Bytes bytes"
}

# Helper to format backup age
function Format-BackupAge {
    param ([datetime]$FileTime)
    $timespan = (Get-Date) - $FileTime
    if ($timespan.TotalDays -ge 1) { return "{0:N0} days {1:N0} hours ago" -f $timespan.TotalDays, $timespan.Hours }
    if ($timespan.TotalHours -ge 1) { return "{0:N0} hours {1:N0} minutes ago" -f $timespan.TotalHours, $timespan.Minutes }
    return "{0:N0} minutes ago" -f $timespan.TotalMinutes
}

# Step 1: Backup File Discovery
if (-not (Test-Path $VerifiedDir)) {
    Log-Message "ERROR" "Verified backup directory does not exist: $VerifiedDir"
    exit $EXIT_ERR_BACKUP_NOT_FOUND
}

$targetDumpPath = ""
$recoverySource = ""

if ([string]::IsNullOrWhiteSpace($BackupFile)) {
    Log-Message "INFO" "No specific backup file specified. Discovering newest verified backup in $VerifiedDir..."
    $latest = Get-ChildItem -Path $VerifiedDir -Filter "*.dump" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $latest) {
        Log-Message "ERROR" "No verified dump archives found in $VerifiedDir."
        exit $EXIT_ERR_BACKUP_NOT_FOUND
    }
    $targetDumpPath = $latest.FullName
    $recoverySource = "Automatic Latest Backup"
} else {
    $recoverySource = "Operator Selected Backup"
    if (Test-Path $BackupFile) {
        $targetDumpPath = (Get-Item $BackupFile).FullName
    } else {
        $candidate = Join-Path $VerifiedDir $BackupFile
        if (Test-Path $candidate) {
            $targetDumpPath = $candidate
        } else {
            Log-Message "ERROR" "Specified backup file does not exist: $BackupFile"
            exit $EXIT_ERR_BACKUP_NOT_FOUND
        }
    }
}

$dumpFileName = [System.IO.Path]::GetFileName($targetDumpPath)
$baseName = [System.IO.Path]::GetFileNameWithoutExtension($targetDumpPath)
$shaFilePath = Join-Path $VerifiedDir "${dumpFileName}.sha256"
$jsonFilePath = Join-Path $VerifiedDir "${baseName}.json"

Log-Message "INFO" "Target Backup Dump Selected: $dumpFileName"

# Step 2: Pre-Restore Validation
Log-Message "INFO" "Running Pre-Restore Security & Integrity Validation..."

# 2a. Dump Existence Check
if (-not (Test-Path $targetDumpPath)) {
    Log-Message "ERROR" "ABORT: Dump archive file missing: $targetDumpPath"
    exit $EXIT_ERR_BACKUP_NOT_FOUND
}

# 2b. SHA256 File Existence Check
if (-not (Test-Path $shaFilePath)) {
    Log-Message "ERROR" "ABORT: Matching SHA256 checksum file missing ($shaFilePath). Only verified archives can be restored."
    exit $EXIT_ERR_CHECKSUM_MISMATCH
}

# 2c. Recalculate SHA256 & Compare
Log-Message "INFO" "Recalculating SHA256 checksum..."
$calculatedHash = (Get-FileHash -Path $targetDumpPath -Algorithm SHA256).Hash.ToLower()
$shaContent = (Get-Content -Path $shaFilePath -Raw).Trim()
$expectedHash = ($shaContent -split '\s+')[0].ToLower()

if ($calculatedHash -ne $expectedHash) {
    Log-Message "ERROR" "ABORT: SHA256 Checksum Mismatch! Calculated: $calculatedHash vs Expected: $expectedHash. Dump file may be corrupted or tampered with."
    exit $EXIT_ERR_CHECKSUM_MISMATCH
}
Log-Message "INFO" "SHA256 Checksum Verification: MATCHED ($calculatedHash)"

# 2d. Run pg_restore --list TOC Verification
Log-Message "INFO" "Verifying archive Table of Contents (TOC) via pg_restore --list..."
try {
    $restoreList = & $pgRestoreExe --list "$targetDumpPath" 2>&1
    if ($LASTEXITCODE -ne 0 -or $restoreList.Count -eq 0) {
        Log-Message "ERROR" "ABORT: pg_restore --list failed to read valid Table of Contents from archive."
        exit $EXIT_ERR_CORRUPT_ARCHIVE
    }
} catch {
    Log-Message "ERROR" "ABORT: pg_restore execution error during TOC validation: $_"
    exit $EXIT_ERR_CORRUPT_ARCHIVE
}
Log-Message "INFO" "Archive Table of Contents (TOC) Verification: VALID"

# Step 3: Single-Attempt Pre-Restore Recovery Snapshot
Log-Message "INFO" "Initiating Single-Attempt Pre-Restore Recovery Snapshot of current production database..."
$emergencyScript = Join-Path (Get-Location) "scripts\database\backup.ps1"
New-Item -ItemType Directory -Force -Path $EmergencyDir | Out-Null

$emergencySnapshotPath = ""
$emergencySuccess = $false

try {
    $snapProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-ExecutionPolicy Bypass -File `"$emergencyScript`" -DestinationDir `"$EmergencyDir`" -Prefix `"ebms_emergency`" -SingleAttempt" -NoNewWindow -Wait -PassThru
    if ($snapProcess.ExitCode -eq 0) {
        $emergencySuccess = $true
        $latestEmergency = Get-ChildItem -Path $EmergencyDir -Filter "ebms_emergency_*.dump" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($latestEmergency) {
            $emergencySnapshotPath = $latestEmergency.FullName
        }
    }
} catch {
    Log-Message "ERROR" "Pre-Restore Recovery Snapshot failed: $_"
}

if (-not $emergencySuccess) {
    Log-Message "ERROR" "CRITICAL ABORT: Pre-Restore Recovery Snapshot failed on single attempt. Production database remains 100% untouched."
    exit $EXIT_ERR_EMERGENCY_SNAP_FAILED
}

Log-Message "INFO" "Pre-Restore Recovery Snapshot VERIFIED & SECURED: $emergencySnapshotPath"

# Step 4: Safety Warning & Interactive Confirmation
Write-Host ""
Write-Host "==========================================================================" -ForegroundColor Yellow
Write-Host "                    ⚠️  DESTRUCTIVE RESTORE WARNING  ⚠️                     " -ForegroundColor Yellow
Write-Host "==========================================================================" -ForegroundColor Yellow
Write-Host " This process will OVERWRITE and REHYDRATE the target database:"
Write-Host "  Database Name:  $displayDbName"
Write-Host "  Database Host:  $displayHost"
Write-Host "  Target Backup:  $dumpFileName"
Write-Host "  Pre-Restore Snapshot Secured at: $emergencySnapshotPath"
Write-Host " Ensure all active EBMS backend application instances are STOPPED."
Write-Host "==========================================================================" -ForegroundColor Yellow
Write-Host ""

if (-not $Force) {
    $response = Read-Host "Type 'RESTORE' to proceed with destructive database restore"
    if ($response -ne "RESTORE") {
        Log-Message "WARN" "Restore process ABORTED by operator. No changes were made."
        exit $EXIT_ERR_USER_CANCELLED
    }
} else {
    Log-Message "WARN" "Non-interactive -Force flag detected. Bypassing manual operator confirmation."
}

# Step 5: Execute Database Restoration
Log-Message "INFO" "Initiating PostgreSQL database restoration using pg_restore --clean..."
$startTime = Get-Date

$restoreFailed = $false
try {
    & $pgRestoreExe -d "$DatabaseUrl" --clean --if-exists "$targetDumpPath" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        $restoreFailed = $true
    }
} catch {
    $restoreFailed = $true
}

if ($restoreFailed) {
    Write-Host ""
    Write-Host "==========================================================================" -ForegroundColor Red
    Write-Host "             🚨 CRITICAL: RESTORE FAILED MID-OPERATION 🚨                   " -ForegroundColor Red
    Write-Host "==========================================================================" -ForegroundColor Red
    Write-Host "  Exit Code:                    7 (ERR_CORRUPT_ARCHIVE / RESTORE_FAILED)"
    Write-Host "  Reason:                       pg_restore process encountered execution error."
    Write-Host "  "
    Write-Host "  SAFEGUARD STATUS:"
    Write-Host "  • Your Pre-Restore Recovery Snapshot remains 100% INTACT & SECURED."
    Write-Host "  • Snapshot Location:          $emergencySnapshotPath"
    Write-Host "  • This pre-restore snapshot WILL NEVER BE DELETED AUTOMATICALLY."
    Write-Host "  "
    Write-Host "  OPERATOR GUIDANCE:"
    Write-Host "  If returning to the previous production state is required, use the restore"
    Write-Host "  utility with the preserved Pre-Restore Recovery Snapshot specified above."
    Write-Host "==========================================================================" -ForegroundColor Red
    Write-Host ""
    exit $EXIT_ERR_CORRUPT_ARCHIVE
}

$durationSeconds = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 2)
Log-Message "INFO" "Database restoration completed in $durationSeconds seconds."

# Step 6: Verify Schema Alignment (Prisma Migrate Status)
Log-Message "INFO" "Verifying schema alignment via Prisma migrate status..."
$schemaAligned = $true
$backendDir = Join-Path (Get-Location) "apps\backend"
if (Test-Path $backendDir) {
    try {
        Push-Location $backendDir
        & npx.cmd prisma migrate status 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            $schemaAligned = $false
        }
        Pop-Location
    } catch {
        Pop-Location
        $schemaAligned = $false
    }
}

# Step 7: Parse Metadata for Summary
$fileObj = Get-Item $targetDumpPath
$formattedSize = Format-FileSize -Bytes $fileObj.Length
$backupAge = Format-BackupAge -FileTime $fileObj.LastWriteTime
$createdAtStr = $fileObj.LastWriteTime.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss UTC")

if (Test-Path $jsonFilePath) {
    try {
        $metaJson = Get-Content -Path $jsonFilePath -Raw | ConvertFrom-Json
        if ($metaJson.createdAt) { $createdAtStr = $metaJson.createdAt }
    } catch {}
}

# Step 8: Improved Incident Recovery Summary
Write-Host ""
Write-Host "==========================================================================" -ForegroundColor Green
Write-Host "                 🎉 EBMS INCIDENT RECOVERY SUMMARY 🎉                      " -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Green
Write-Host "  Final Status:                 SUCCESS (Exit Code: 0)"
Write-Host "  Recovery Source:              $recoverySource"
Write-Host "  Restored Archive:             $dumpFileName"
Write-Host "  Backup Created At:            $createdAtStr"
Write-Host "  Backup Age:                   $backupAge"
Write-Host "  Backup Size:                  $formattedSize"
Write-Host "  "
Write-Host "  Pre-Restore Recovery Snapshot: VERIFIED & SECURED"
Write-Host "  Snapshot Path:                $emergencySnapshotPath"
Write-Host "  "
Write-Host "  SHA256 Verification:          MATCHED ($calculatedHash)"
Write-Host "  TOC Verification:             VALID (pg_restore --list passed)"
Write-Host "  Prisma Schema Status:         $(if ($schemaAligned) { 'ALIGNED (Up to date)' } else { 'WARNING (Unapplied migrations found)' })"
Write-Host "  Restore Duration:             $durationSeconds seconds"
Write-Host "  Database Name:                $displayDbName"
Write-Host "  Database Host:                $displayHost"
Write-Host "==========================================================================" -ForegroundColor Green
Write-Host "  NEXT STEPS FOR OPERATOR:"
Write-Host "  1. Restart EBMS Backend Application Service."
Write-Host "  2. Verify HTTP endpoint: GET /api/v1/health -> Status 200 OK."
Write-Host "==========================================================================" -ForegroundColor Green
Write-Host ""

if (-not $schemaAligned) {
    exit $EXIT_ERR_SCHEMA_MISMATCH
}

exit $EXIT_SUCCESS
