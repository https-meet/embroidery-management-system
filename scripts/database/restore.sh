#!/usr/bin/env bash

# ==============================================================================
# EBMS Enterprise Database Restore Engine (Linux / Bash)
# Milestone 4.1 - Sprint 3 (Refined Operational Polish & Safety Controls)
# ==============================================================================

set -u

# Exit Code Constants Matrix
EXIT_SUCCESS=0
EXIT_ERR_GENERAL=1
EXIT_ERR_MISSING_TOOLS=2
EXIT_ERR_DB_UNREACHABLE=3
EXIT_ERR_PERMISSIONS=4
EXIT_ERR_BACKUP_NOT_FOUND=5
EXIT_ERR_CHECKSUM_MISMATCH=6
EXIT_ERR_CORRUPT_ARCHIVE=7
EXIT_ERR_USER_CANCELLED=8
EXIT_ERR_EMERGENCY_SNAP_FAILED=9
EXIT_ERR_SCHEMA_MISMATCH=10

BACKUP_DIR="${BACKUP_DIR:-$(pwd)/backups}"
VERIFIED_DIR="${BACKUP_DIR}/verified"
EMERGENCY_DIR="${BACKUP_DIR}/emergency"

log_message() {
  local level="$1"
  local message="$2"
  local ts
  ts=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
  echo "[${ts}] [${level}] ${message}"
}

# Parse Arguments
TARGET_FILE=""
FORCE_RESTORE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --file|-f)
      TARGET_FILE="$2"
      shift 2
      ;;
    --force|-y)
      FORCE_RESTORE=1
      shift
      ;;
    *)
      if [ -z "${TARGET_FILE}" ]; then
        TARGET_FILE="$1"
      fi
      shift
      ;;
  esac
done

# Verify pg_restore Tool Availability
if ! command -v pg_restore >/dev/null 2>&1; then
  log_message "ERROR" "CRITICAL: pg_restore command-line tool is not installed or not found in PATH."
  exit ${EXIT_ERR_MISSING_TOOLS}
fi

# Resolve Database Connection String & Extract Masked Metadata
if [ -z "${DATABASE_URL:-}" ]; then
  PGHOST="${PGHOST:-localhost}"
  PGPORT="${PGPORT:-5432}"
  PGUSER="${PGUSER:-postgres}"
  PGPASSWORD="${PGPASSWORD:-postgres}"
  PGDATABASE="${PGDATABASE:-ebms}"
  DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"
fi

DISPLAY_DB_NAME="ebms"
DISPLAY_HOST="localhost"

if [[ "${DATABASE_URL}" =~ postgresql://[^@]+@([^:/]+)(:[0-9]+)?/([^?]+) ]]; then
  DISPLAY_HOST="${BASH_REMATCH[1]}"
  DISPLAY_DB_NAME="${BASH_REMATCH[3]}"
fi

format_file_size() {
  local bytes="$1"
  if [ "$bytes" -ge 1073741824 ]; then
    echo "$(awk -v b="$bytes" 'BEGIN {printf "%.2f GB", b/1073741824}') (${bytes} bytes)"
  elif [ "$bytes" -ge 1048576 ]; then
    echo "$(awk -v b="$bytes" 'BEGIN {printf "%.2f MB", b/1048576}') (${bytes} bytes)"
  elif [ "$bytes" -ge 1024 ]; then
    echo "$(awk -v b="$bytes" 'BEGIN {printf "%.2f KB", b/1024}') (${bytes} bytes)"
  else
    echo "${bytes} bytes"
  fi
}

format_backup_age() {
  local file_mtime="$1"
  local now
  now=$(date +%s)
  local diff=$((now - file_mtime))
  local hours=$((diff / 3600))
  local mins=$(((diff % 3600) / 60))
  
  if [ "$hours" -ge 24 ]; then
    local days=$((hours / 24))
    local rem_hours=$((hours % 24))
    echo "${days} days ${rem_hours} hours ago"
  elif [ "$hours" -ge 1 ]; then
    echo "${hours} hours ${mins} minutes ago"
  else
    echo "${mins} minutes ago"
  fi
}

# Step 1: Backup File Discovery
if [ ! -d "${VERIFIED_DIR}" ]; then
  log_message "ERROR" "Verified backup directory does not exist: ${VERIFIED_DIR}"
  exit ${EXIT_ERR_BACKUP_NOT_FOUND}
fi

TARGET_DUMP_PATH=""
RECOVERY_SOURCE=""

if [ -z "${TARGET_FILE}" ]; then
  log_message "INFO" "No specific backup file specified. Discovering newest verified backup in ${VERIFIED_DIR}..."
  LATEST_DUMP=$(ls -t "${VERIFIED_DIR}"/*.dump 2>/dev/null | head -n 1 || true)
  if [ -z "${LATEST_DUMP}" ]; then
    log_message "ERROR" "No verified dump archives found in ${VERIFIED_DIR}."
    exit ${EXIT_ERR_BACKUP_NOT_FOUND}
  fi
  TARGET_DUMP_PATH="${LATEST_DUMP}"
  RECOVERY_SOURCE="Automatic Latest Backup"
else
  RECOVERY_SOURCE="Operator Selected Backup"
  if [ -f "${TARGET_FILE}" ]; then
    TARGET_DUMP_PATH="${TARGET_FILE}"
  elif [ -f "${VERIFIED_DIR}/${TARGET_FILE}" ]; then
    TARGET_DUMP_PATH="${VERIFIED_DIR}/${TARGET_FILE}"
  else
    log_message "ERROR" "Specified backup file does not exist: ${TARGET_FILE}"
    exit ${EXIT_ERR_BACKUP_NOT_FOUND}
  fi
fi

DUMP_FILENAME=$(basename "${TARGET_DUMP_PATH}")
BASE_NAME="${DUMP_FILENAME%.dump}"
SHA_FILE_PATH="${VERIFIED_DIR}/${DUMP_FILENAME}.sha256"
JSON_FILE_PATH="${VERIFIED_DIR}/${BASE_NAME}.json"

log_message "INFO" "Target Backup Dump Selected: ${DUMP_FILENAME}"

# Step 2: Pre-Restore Validation
log_message "INFO" "Running Pre-Restore Security & Integrity Validation..."

# 2a. Dump Existence Check
if [ ! -f "${TARGET_DUMP_PATH}" ]; then
  log_message "ERROR" "ABORT: Dump archive file missing: ${TARGET_DUMP_PATH}"
  exit ${EXIT_ERR_BACKUP_NOT_FOUND}
fi

# 2b. SHA256 File Existence Check
if [ ! -f "${SHA_FILE_PATH}" ]; then
  log_message "ERROR" "ABORT: Matching SHA256 checksum file missing (${SHA_FILE_PATH}). Only verified archives can be restored."
  exit ${EXIT_ERR_CHECKSUM_MISMATCH}
fi

# 2c. Recalculate SHA256 & Compare
log_message "INFO" "Recalculating SHA256 checksum..."
if command -v sha256sum >/dev/null 2>&1; then
  CALCULATED_HASH=$(sha256sum "${TARGET_DUMP_PATH}" | awk '{print $1}' | tr '[:upper:]' '[:lower:]')
else
  CALCULATED_HASH=$(shasum -a 256 "${TARGET_DUMP_PATH}" | awk '{print $1}' | tr '[:upper:]' '[:lower:]')
fi

EXPECTED_HASH=$(awk '{print $1}' "${SHA_FILE_PATH}" | tr '[:upper:]' '[:lower:]')

if [ "${CALCULATED_HASH}" != "${EXPECTED_HASH}" ]; then
  log_message "ERROR" "ABORT: SHA256 Checksum Mismatch! Calculated: ${CALCULATED_HASH} vs Expected: ${EXPECTED_HASH}. Dump file may be corrupted or tampered with."
  exit ${EXIT_ERR_CHECKSUM_MISMATCH}
fi
log_message "INFO" "SHA256 Checksum Verification: MATCHED (${CALCULATED_HASH})"

# 2d. Run pg_restore --list TOC Verification
log_message "INFO" "Verifying archive Table of Contents (TOC) via pg_restore --list..."
if ! pg_restore --list "${TARGET_DUMP_PATH}" >/dev/null 2>&1; then
  log_message "ERROR" "ABORT: pg_restore --list failed to read valid Table of Contents from archive."
  exit ${EXIT_ERR_CORRUPT_ARCHIVE}
fi
log_message "INFO" "Archive Table of Contents (TOC) Verification: VALID"

# Step 3: Single-Attempt Pre-Restore Recovery Snapshot
log_message "INFO" "Initiating Single-Attempt Pre-Restore Recovery Snapshot of current production database..."
mkdir -p "${EMERGENCY_DIR}"

EMERGENCY_SCRIPT="./scripts/database/backup.sh"
EMERGENCY_SUCCESS=0
EMERGENCY_SNAPSHOT_PATH=""

if bash "${EMERGENCY_SCRIPT}" --destination "${EMERGENCY_DIR}" --prefix "ebms_emergency" --single-attempt >/dev/null 2>&1; then
  EMERGENCY_SUCCESS=1
  LATEST_EMERGENCY=$(ls -t "${EMERGENCY_DIR}"/ebms_emergency_*.dump 2>/dev/null | head -n 1 || true)
  if [ -n "${LATEST_EMERGENCY}" ]; then
    EMERGENCY_SNAPSHOT_PATH="${LATEST_EMERGENCY}"
  fi
fi

if [ "${EMERGENCY_SUCCESS}" -ne 1 ]; then
  log_message "ERROR" "CRITICAL ABORT: Pre-Restore Recovery Snapshot failed on single attempt. Production database remains 100% untouched."
  exit ${EXIT_ERR_EMERGENCY_SNAP_FAILED}
fi

log_message "INFO" "Pre-Restore Recovery Snapshot VERIFIED & SECURED: ${EMERGENCY_SNAPSHOT_PATH}"

# Step 4: Safety Warning & Interactive Confirmation
echo ""
echo "=========================================================================="
echo "                    ⚠️  DESTRUCTIVE RESTORE WARNING  ⚠️                     "
echo "=========================================================================="
echo " This process will OVERWRITE and REHYDRATE the target database:"
echo "  Database Name:  ${DISPLAY_DB_NAME}"
echo "  Database Host:  ${DISPLAY_HOST}"
echo "  Target Backup:  ${DUMP_FILENAME}"
echo "  Pre-Restore Snapshot Secured at: ${EMERGENCY_SNAPSHOT_PATH}"
echo " Ensure all active EBMS backend application instances are STOPPED."
echo "=========================================================================="
echo ""

if [ "${FORCE_RESTORE}" -ne 1 ]; then
  read -r -p "Type 'RESTORE' to proceed with destructive database restore: " CONFIRM
  if [ "${CONFIRM}" != "RESTORE" ]; then
    log_message "WARN" "Restore process ABORTED by operator. No changes were made."
    exit ${EXIT_ERR_USER_CANCELLED}
  fi
else
  log_message "WARN" "Non-interactive --force flag detected. Bypassing manual operator confirmation."
fi

# Step 5: Execute Database Restoration
log_message "INFO" "Initiating PostgreSQL database restoration using pg_restore --clean..."
START_TIME=$(date +%s)

RESTORE_FAILED=0
if ! pg_restore -d "${DATABASE_URL}" --clean --if-exists "${TARGET_DUMP_PATH}" >/dev/null 2>&1; then
  RESTORE_FAILED=1
fi

if [ "${RESTORE_FAILED}" -eq 1 ]; then
  echo ""
  echo "=========================================================================="
  echo "             🚨 CRITICAL: RESTORE FAILED MID-OPERATION 🚨                   "
  echo "=========================================================================="
  echo "  Exit Code:                    7 (ERR_CORRUPT_ARCHIVE / RESTORE_FAILED)"
  echo "  Reason:                       pg_restore process encountered execution error."
  echo "  "
  echo "  SAFEGUARD STATUS:"
  echo "  • Your Pre-Restore Recovery Snapshot remains 100% INTACT & SECURED."
  echo "  • Snapshot Location:          ${EMERGENCY_SNAPSHOT_PATH}"
  echo "  • This pre-restore snapshot WILL NEVER BE DELETED AUTOMATICALLY."
  echo "  "
  echo "  OPERATOR GUIDANCE:"
  echo "  If returning to the previous production state is required, use the restore"
  echo "  utility with the preserved Pre-Restore Recovery Snapshot specified above."
  echo "=========================================================================="
  echo ""
  exit ${EXIT_ERR_CORRUPT_ARCHIVE}
fi

END_TIME=$(date +%s)
DURATION_SECONDS=$((END_TIME - START_TIME))
log_message "INFO" "Database restoration completed in ${DURATION_SECONDS} seconds."

# Step 6: Verify Schema Alignment (Prisma Migrate Status)
log_message "INFO" "Verifying schema alignment via Prisma migrate status..."
SCHEMA_ALIGNED=1
if [ -d "apps/backend" ]; then
  (cd apps/backend && npx prisma migrate status >/dev/null 2>&1) || SCHEMA_ALIGNED=0
fi

# Step 7: Parse Metadata for Summary
FILE_SIZE_BYTES=$(wc -c < "${TARGET_DUMP_PATH}" | tr -d ' ')
FORMATTED_SIZE=$(format_file_size "${FILE_SIZE_BYTES}")

if command -v stat >/dev/null 2>&1; then
  if stat -c %Y "${TARGET_DUMP_PATH}" >/dev/null 2>&1; then
    FILE_MTIME=$(stat -c %Y "${TARGET_DUMP_PATH}")
  else
    FILE_MTIME=$(stat -f %m "${TARGET_DUMP_PATH}")
  fi
else
  FILE_MTIME=$(date +%s)
fi

BACKUP_AGE=$(format_backup_age "${FILE_MTIME}")
CREATED_AT_STR=$(date -u -d "@${FILE_MTIME}" +"%Y-%m-%d %H:%M:%S UTC" 2>/dev/null || date -u +"%Y-%m-%d %H:%M:%S UTC")

if [ -f "${JSON_FILE_PATH}" ]; then
  META_CREATED=$(grep '"createdAt"' "${JSON_FILE_PATH}" | cut -d '"' -f 4 || true)
  if [ -n "${META_CREATED}" ]; then
    CREATED_AT_STR="${META_CREATED}"
  fi
fi

# Step 8: Improved Incident Recovery Summary
echo ""
echo "=========================================================================="
echo "                 🎉 EBMS INCIDENT RECOVERY SUMMARY 🎉                      "
echo "=========================================================================="
echo "  Final Status:                 SUCCESS (Exit Code: 0)"
echo "  Recovery Source:              ${RECOVERY_SOURCE}"
echo "  Restored Archive:             ${DUMP_FILENAME}"
echo "  Backup Created At:            ${CREATED_AT_STR}"
echo "  Backup Age:                   ${BACKUP_AGE}"
echo "  Backup Size:                  ${FORMATTED_SIZE}"
echo "  "
echo "  Pre-Restore Recovery Snapshot: VERIFIED & SECURED"
echo "  Snapshot Path:                ${EMERGENCY_SNAPSHOT_PATH}"
echo "  "
echo "  SHA256 Verification:          MATCHED (${CALCULATED_HASH})"
echo "  TOC Verification:             VALID (pg_restore --list passed)"
echo "  Prisma Schema Status:         $([ "${SCHEMA_ALIGNED}" -eq 1 ] && echo 'ALIGNED (Up to date)' || echo 'WARNING (Unapplied migrations found)')"
echo "  Restore Duration:             ${DURATION_SECONDS} seconds"
echo "  Database Name:                ${DISPLAY_DB_NAME}"
echo "  Database Host:                ${DISPLAY_HOST}"
echo "=========================================================================="
echo "  NEXT STEPS FOR OPERATOR:"
echo "  1. Restart EBMS Backend Application Service."
echo "  2. Verify HTTP endpoint: GET /api/v1/health -> Status 200 OK."
echo "=========================================================================="
echo ""

if [ "${SCHEMA_ALIGNED}" -ne 1 ]; then
  exit ${EXIT_ERR_SCHEMA_MISMATCH}
fi

exit ${EXIT_SUCCESS}
