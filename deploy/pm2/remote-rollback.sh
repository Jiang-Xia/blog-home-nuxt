#!/bin/bash
# =============================================================================
# blog-home-nuxt 远程回滚脚本
# =============================================================================

set -euo pipefail

: "${DEPLOY_REMOTE_DIR:?}"
: "${DEPLOY_PM2_APP:?}"

DEPLOY_ECOSYSTEM_FILE="${DEPLOY_ECOSYSTEM_FILE:-ecosystem.config.cjs}"
BACKUP_DIR="${DEPLOY_REMOTE_DIR}/releases/backups"
BACKUP_ARG="${1:-}"
BACKUP_NAME_PATTERN='^backup-[0-9]{8}-[0-9]{6}\.tar\.gz$'

assert_backup_basename() {
  local name="$1"
  if [[ ! "$name" =~ $BACKUP_NAME_PATTERN ]]; then
    echo "Invalid backup name (expected backup-YYYYMMDD-HHMMSS.tar.gz): ${name}" >&2
    return 1
  fi
}

assert_backup_in_dir() {
  local file="$1"
  local dir_real file_real
  dir_real="$(realpath "$BACKUP_DIR")"
  file_real="$(realpath "$file")"
  if [[ "$file_real" != "$dir_real"/* ]]; then
    echo "Backup path escapes backup dir: ${file}" >&2
    return 1
  fi
}

resolve_backup_file() {
  if [[ -n "$BACKUP_ARG" ]]; then
    local base="${BACKUP_ARG##*/}"
    assert_backup_basename "$base" || return 1
    local candidate="${BACKUP_DIR}/${base}"
    if [[ -f "$candidate" ]]; then
      echo "$candidate"
      return 0
    fi
    echo "Backup not found: ${base}" >&2
    return 1
  fi
  ls -1t "${BACKUP_DIR}"/backup-*.tar.gz 2>/dev/null | head -1
}

if [[ "${DEPLOY_ROLLBACK_LIST:-}" == "1" ]]; then
  echo "Available backups in ${BACKUP_DIR}:"
  ls -1t "${BACKUP_DIR}"/backup-*.tar.gz 2>/dev/null || echo "(none)"
  exit 0
fi

BACKUP_FILE="$(resolve_backup_file)"
if [[ -z "$BACKUP_FILE" || ! -f "$BACKUP_FILE" ]]; then
  echo "No backup found in ${BACKUP_DIR}" >&2
  exit 1
fi
assert_backup_in_dir "$BACKUP_FILE"

source "$HOME/.nvm/nvm.sh"
nvm use default

echo "==> rollback from: ${BACKUP_FILE}"

echo "==> stop pm2: ${DEPLOY_PM2_APP}"
pm2 stop "${DEPLOY_PM2_APP}" 2>/dev/null || true

echo "==> clean output before restore"
rm -rf "${DEPLOY_REMOTE_DIR}/output"

echo "==> extract backup -> ${DEPLOY_REMOTE_DIR}"
tar -xzf "${BACKUP_FILE}" -C "${DEPLOY_REMOTE_DIR}"

cd "${DEPLOY_REMOTE_DIR}"

echo "==> npm ci --omit=dev"
npm ci --omit=dev --ignore-scripts

echo "==> start pm2: ${DEPLOY_PM2_APP}"
if pm2 describe "${DEPLOY_PM2_APP}" >/dev/null 2>&1; then
  pm2 start "${DEPLOY_PM2_APP}"
else
  pm2 start "${DEPLOY_ECOSYSTEM_FILE}" --env production
fi

pm2 save

echo "==> rollback done"
pm2 list | grep -E "name|${DEPLOY_PM2_APP}" || pm2 list
