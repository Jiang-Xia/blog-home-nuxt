#!/bin/bash
# =============================================================================
# blog-home-nuxt 远程回滚（方案 B：解压到新 release → 切 current → pm2 reload）
# =============================================================================

set -euo pipefail

: "${DEPLOY_REMOTE_DIR:?}"
: "${DEPLOY_PM2_APP:?}"

DEPLOY_ECOSYSTEM_FILE="${DEPLOY_ECOSYSTEM_FILE:-ecosystem.config.cjs}"
source /tmp/release-lib.sh

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

link_output_compat() {
  ln -sfn "${DEPLOY_REMOTE_DIR}/current/output" "${DEPLOY_REMOTE_DIR}/output"
}

if [[ "${DEPLOY_ROLLBACK_LIST:-}" == "1" ]]; then
  echo "Available backups in ${BACKUP_DIR}:"
  ls -1t "${BACKUP_DIR}"/backup-*.tar.gz 2>/dev/null || echo "(none)"
  echo ""
  echo "Available releases in ${RELEASES_ROOT}:"
  ls -1dt "${RELEASES_ROOT}"/*/ 2>/dev/null | grep -E '/[0-9]{8}-[0-9]{6}/$' || echo "(none)"
  echo "Current -> $(readlink -f "$CURRENT_LINK" 2>/dev/null || echo '(not set)')"
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

mkdir -p "${DEPLOY_REMOTE_DIR}/logs"

echo "==> rollback from: ${BACKUP_FILE}"

local_ts="$(release_new_id)"
release_path="$(release_dir_for "$local_ts")"
mkdir -p "$release_path"

echo "==> extract backup -> ${release_path}"
tar -xzf "${BACKUP_FILE}" -C "$release_path"

cd "$release_path"
echo "==> npm ci --omit=dev"
npm ci --omit=dev --ignore-scripts

echo "==> activate rollback release (zero-downtime reload)"
release_switch "$release_path"
link_output_compat
release_pm2_reload "${DEPLOY_PM2_APP}" "${DEPLOY_ECOSYSTEM_FILE}"

echo "==> rollback done"
release_pm2_verify "${DEPLOY_PM2_APP}"
