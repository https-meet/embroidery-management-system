#!/usr/bin/env bash

# ==============================================================================
# EBMS Enterprise Database Backup Engine (Linux / Bash)
# Milestone 4.1 - Sprint 1
# ==============================================================================

set -u

# Resolve Backup Directory
BACKUP_DIR="${BACKUP_DIR:-$(pwd)/backups}"
VERIFIED_DIR="${BACKUP_DIR}/verified"
QUARANTINE_DIR="${BACKUP_DIR}/quarantine"
TEMP_DIR="${BACKUP_DIR}/temp"

# Ensure target directories exist
mkdir -p "${VERIFIED_DIR}" "${QUARANTINE_DIR}" "${TEMP_DIR}"

# Resolve Database Connection String
if [ -z "${DATABASE_URL:-}" ]; then
  PGHOST="${PGHOST:-localhost}"
  PGPORT="${PGPORT:-5432}"
  PGUSER="${PGUSER:-postgres}"
  PGPASSWORD="${PGPASSWORD:-postgres}"
  PGDATABASE="${PGDATABASE:-ebms}"
  DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"
fi

log_message() {
  local level="$1"
  local message="$2"
  local ts
  ts=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
  echo "[${ts}] [${level}] ${message}"
}

MAX_ATTEMPTS=3
SUCCESS=0

log_message "INFO" "Starting EBMS PostgreSQL Backup Engine (Max attempts: ${MAX_ATTEMPTS})..."

for ((attempt=1; attempt<=MAX_ATTEMPTS; attempt++)); do
  START_TIME=$(date +%s)
  TIMESTAMP_STR=$(date -u +"%Y-%m-%d_%H-%M-%S")
  BASE_NAME="ebms_${TIMESTAMP_STR}"

  TEMP_DUMP_FILE="${TEMP_DIR}/${BASE_NAME}.dump"
  VERIFIED_DUMP_FILE="${VERIFIED_DIR}/${BASE_NAME}.dump"
  VERIFIED_SHA_FILE="${VERIFIED_DIR}/${BASE_NAME}.dump.sha256"
  VERIFIED_JSON_FILE="${VERIFIED_DIR}/${BASE_NAME}.json"
  QUARANTINE_DUMP_FILE="${QUARANTINE_DIR}/${BASE_NAME}_attempt${attempt}.dump.corrupt"

  log_message "INFO" "Backup Attempt ${attempt}/${MAX_ATTEMPTS} starting for target ${BASE_NAME}..."

  # Execute pg_dump with Custom Format (-Fc)
  pg_dump -d "${DATABASE_URL}" -Fc -f "${TEMP_DUMP_FILE}" >/dev/null 2>&1 || true

  END_TIME=$(date +%s)
  DURATION_SECONDS=$((END_TIME - START_TIME))
  VERIFICATION_PASSED=0
  FAILURE_REASON=""

  # Step 1: File Existence Check
  if [ ! -f "${TEMP_DUMP_FILE}" ]; then
    FAILURE_REASON="Backup dump file was not created by pg_dump."
  else
    # Step 2: Minimum Size Validation (> 1024 bytes)
    FILE_SIZE=$(wc -c < "${TEMP_DUMP_FILE}" | tr -d ' ')
    if [ "${FILE_SIZE}" -le 1024 ]; then
      FAILURE_REASON="Dump file size is invalid or empty (${FILE_SIZE} bytes)."
    else
      # Step 3: pg_restore --list Header & TOC Integrity Check
      if pg_restore --list "${TEMP_DUMP_FILE}" >/dev/null 2>&1; then
        VERIFICATION_PASSED=1
      else
        FAILURE_REASON="pg_restore --list failed to read valid archive Table of Contents (TOC)."
      fi
    fi
  fi

  if [ "${VERIFICATION_PASSED}" -eq 1 ]; then
    log_message "INFO" "Verification PASSED for attempt ${attempt}. Finalizing dump storage..."

    # Step 4: Generate SHA256 Checksum
    if command -v sha256sum >/dev/null 2>&1; then
      SHA256_HASH=$(sha256sum "${TEMP_DUMP_FILE}" | awk '{print $1}')
    else
      SHA256_HASH=$(shasum -a 256 "${TEMP_DUMP_FILE}" | awk '{print $1}')
    fi

    echo "${SHA256_HASH}  ${BASE_NAME}.dump" > "${VERIFIED_SHA_FILE}"

    # Move dump to verified directory
    mv "${TEMP_DUMP_FILE}" "${VERIFIED_DUMP_FILE}"

    # Retrieve PostgreSQL Server Version
    PG_VERSION=$(pg_dump --version 2>/dev/null || echo "Unknown")

    # Step 5: Write Metadata JSON
    CREATED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    cat <<EOF > "${VERIFIED_JSON_FILE}"
{
  "createdAt": "${CREATED_AT}",
  "filename": "${BASE_NAME}.dump",
  "sizeBytes": ${FILE_SIZE},
  "durationSeconds": ${DURATION_SECONDS},
  "sha256": "${SHA256_HASH}",
  "postgresVersion": "${PG_VERSION}",
  "backupFormat": "custom (-Fc)",
  "verificationPassed": true
}
EOF

    log_message "INFO" "Backup completed SUCCESSFULLY in ${DURATION_SECONDS} seconds."
    log_message "INFO" "Verified Dump: ${VERIFIED_DUMP_FILE}"
    log_message "INFO" "SHA256 Checksum: ${SHA256_HASH}"

    SUCCESS=1
    break
  else
    log_message "ERROR" "Verification FAILED for attempt ${attempt}: ${FAILURE_REASON}"

    # Quarantine invalid dump file if it exists
    if [ -f "${TEMP_DUMP_FILE}" ]; then
      mv "${TEMP_DUMP_FILE}" "${QUARANTINE_DUMP_FILE}"
      log_message "WARN" "Corrupt dump quarantined to ${QUARANTINE_DUMP_FILE}"
    fi

    # Apply Retry Delays
    if [ "${attempt}" -lt "${MAX_ATTEMPTS}" ]; then
      DELAY_SECONDS=30
      if [ "${attempt}" -eq 2 ]; then
        DELAY_SECONDS=60
      fi
      log_message "WARN" "Waiting ${DELAY_SECONDS} seconds before retry attempt $((attempt + 1))..."
      sleep "${DELAY_SECONDS}"
    fi
  fi
done

# Clean up temp directory
rm -rf "${TEMP_DIR}"

if [ "${SUCCESS}" -ne 1 ]; then
  log_message "ERROR" "CRITICAL: All ${MAX_ATTEMPTS} backup attempts failed. Backup process exiting with code 1."
  exit 1
fi

exit 0
