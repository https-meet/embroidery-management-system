# ==============================================================================
# EBMS Enterprise Database Backup Engine (Windows PowerShell)
# Milestone 4.1 - Sprint 3 (Refined Operational Polish)
# ==============================================================================

[CmdletBinding()]
param (
    [string]$BackupDir = $env:BACKUP_DIR,
    [string]$DatabaseUrl = $env:DATABASE_URL,
    [string]$DestinationDir,
    [string]$Prefix = "ebms",
    [switch]$SingleAttempt
)

$ErrorActionPreference = "Stop"

# Exit Code Constants
$EXIT_SUCCESS = 0
$EXIT_ERR_GENERAL = 1
$EXIT_ERR_MISSING_TOOLS = 2
$EXIT_ERR_DB_UNREACHABLE = 3
$EXIT_ERR_PERMISSIONS = 4

# Set default backup root directory if omitted
if ([string]::IsNullOrWhiteSpace($BackupDir)) {
    $BackupDir = Join-Path (Get-Location) "backups"
}

# Resolve directory paths
if ([string]::IsNullOrWhiteSpace($DestinationDir)) {
    $VerifiedDir = Join-Path $BackupDir "verified"
} else {
    $VerifiedDir = $DestinationDir
}
$QuarantineDir = Join-Path $BackupDir "quarantine"
$TempDir = Join-Path $BackupDir "temp"

# Ensure target directories exist
try {
    New-Item -ItemType Directory -Force -Path $VerifiedDir | Out-Null
    New-Item -ItemType Directory -Force -Path $QuarantineDir | Out-Null
    New-Item -ItemType Directory -Force -Path $TempDir | Out-Null
} catch {
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [ERROR] Permission failure creating backup directories: $_"
    exit $EXIT_ERR_PERMISSIONS
}

# Helper to locate PostgreSQL CLI binaries (pg_dump, pg_restore)
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

$pgDumpExe = Find-PgBinary "pg_dump"
$pgRestoreExe = Find-PgBinary "pg_restore"

# Check tool availability
if (-not (Get-Command $pgDumpExe -ErrorAction SilentlyContinue) -and -not (Test-Path $pgDumpExe)) {
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [ERROR] CRITICAL: pg_dump command-line tool is not installed or not found in PATH."
    exit $EXIT_ERR_MISSING_TOOLS
}

# Resolve Database Connection String
if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
    $pgHost = if ($env:PGHOST) { $env:PGHOST } else { "localhost" }
    $pgPort = if ($env:PGPORT) { $env:PGPORT } else { "5432" }
    $pgUser = if ($env:PGUSER) { $env:PGUSER } else { "postgres" }
    $pgPass = if ($env:PGPASSWORD) { $env:PGPASSWORD } else { "postgres" }
    $pgDb   = if ($env:PGDATABASE) { $env:PGDATABASE } else { "ebms" }
    $DatabaseUrl = "postgresql://${pgUser}:${pgPass}@${pgHost}:${pgPort}/${pgDb}"
}

function Log-Message {
    param ([string]$Level, [string]$Message)
    $ts = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    Write-Host "[$ts] [$Level] $Message"
}

$MaxAttempts = if ($SingleAttempt) { 1 } else { 3 }
$Success = $false

Log-Message "INFO" "Starting EBMS PostgreSQL Backup Engine (Max attempts: $MaxAttempts)..."

for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
    $startTime = Get-Date
    $timestampStr = $startTime.ToString("yyyy-MM-dd_HH-mm-ss")
    $baseName = "${Prefix}_${timestampStr}"
    
    $tempDumpFile = Join-Path $TempDir "${baseName}.dump"
    $verifiedDumpFile = Join-Path $VerifiedDir "${baseName}.dump"
    $verifiedShaFile = Join-Path $VerifiedDir "${baseName}.dump.sha256"
    $verifiedJsonFile = Join-Path $VerifiedDir "${baseName}.json"
    $quarantineDumpFile = Join-Path $QuarantineDir "${baseName}_attempt${attempt}.dump.corrupt"

    Log-Message "INFO" "Backup Attempt ${attempt}/${MaxAttempts} starting for target ${baseName}..."

    # Execute pg_dump with Custom Format (-Fc)
    try {
        & $pgDumpExe -d "$DatabaseUrl" -Fc -f "$tempDumpFile" 2>&1 | Out-Null
    } catch {
        Log-Message "WARN" "pg_dump command execution encountered an error: $_"
    }

    $durationSeconds = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 2)
    $verificationPassed = $false
    $failureReason = ""

    # Step 1: File Existence Check
    if (-not (Test-Path $tempDumpFile)) {
        $failureReason = "Backup dump file was not created by pg_dump."
    } else {
        # Step 2: Minimum Size Validation (> 1024 bytes)
        $fileSize = (Get-Item $tempDumpFile).Length
        if ($fileSize -le 1024) {
            $failureReason = "Dump file size is invalid or empty ($fileSize bytes)."
        } else {
            # Step 3: pg_restore --list Header & TOC Integrity Check
            try {
                $restoreOutput = & $pgRestoreExe --list "$tempDumpFile" 2>&1
                if ($LASTEXITCODE -eq 0 -and $restoreOutput.Count -gt 0) {
                    $verificationPassed = $true
                } else {
                    $failureReason = "pg_restore --list failed to read valid archive Table of Contents (TOC)."
                }
            } catch {
                $failureReason = "pg_restore execution error: $_"
            }
        }
    }

    if ($verificationPassed) {
        Log-Message "INFO" "Verification PASSED for attempt $attempt. Finalizing dump storage..."
        
        # Step 4: Generate SHA256 Checksum
        $sha256Hash = (Get-FileHash -Path $tempDumpFile -Algorithm SHA256).Hash.ToLower()
        Set-Content -Path $verifiedShaFile -Value "$sha256Hash  ${baseName}.dump"

        # Move dump to target verified directory
        Move-Item -Path $tempDumpFile -Destination $verifiedDumpFile -Force

        # Retrieve PostgreSQL Server Version
        $pgVersion = "Unknown"
        try {
            $verOutput = & $pgDumpExe --version 2>&1
            if ($verOutput) { $pgVersion = $verOutput[0] }
        } catch {}

        # Step 5: Write Metadata JSON
        $metadata = @{
            createdAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
            filename = "${baseName}.dump"
            sizeBytes = $fileSize
            durationSeconds = $durationSeconds
            sha256 = $sha256Hash
            postgresVersion = $pgVersion
            backupFormat = "custom (-Fc)"
            verificationPassed = $true
        }

        $metadata | ConvertTo-Json -Depth 4 | Set-Content -Path $verifiedJsonFile

        Log-Message "INFO" "Backup completed SUCCESSFULLY in $durationSeconds seconds."
        Log-Message "INFO" "Verified Dump: $verifiedDumpFile"
        Log-Message "INFO" "SHA256 Checksum: $sha256Hash"
        
        $Success = $true
        break
    } else {
        Log-Message "ERROR" "Verification FAILED for attempt ${attempt} - ${failureReason}"
        
        # Quarantine invalid dump file if it exists
        if (Test-Path $tempDumpFile) {
            Move-Item -Path $tempDumpFile -Destination $quarantineDumpFile -Force
            Log-Message "WARN" "Corrupt dump quarantined to $quarantineDumpFile"
        }

        # Apply Retry Delays (only if SingleAttempt is false)
        if (-not $SingleAttempt -and $attempt -lt $MaxAttempts) {
            $delaySeconds = if ($attempt -eq 1) { 30 } else { 60 }
            Log-Message "WARN" "Waiting $delaySeconds seconds before retry attempt $($attempt + 1)..."
            Start-Sleep -Seconds $delaySeconds
        }
    }
}

# Clean up temp directory
if (Test-Path $TempDir) {
    Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
}

if (-not $Success) {
    Log-Message "ERROR" "CRITICAL: Backup process failed all attempt(s). Exiting with code $EXIT_ERR_DB_UNREACHABLE."
    exit $EXIT_ERR_DB_UNREACHABLE
}

exit $EXIT_SUCCESS
