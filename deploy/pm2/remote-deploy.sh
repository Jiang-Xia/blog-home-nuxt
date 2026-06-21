#!/bin/bash
# =============================================================================
# blog-home-nuxt 远程部署（方案 B：releases + current，零停机 pm2 reload）
# =============================================================================

set -euo pipefail

: "${DEPLOY_REMOTE_DIR:?}"
: "${DEPLOY_PM2_APP:?}"
: "${DEPLOY_ECOSYSTEM_FILE:?}"
: "${DEPLOY_TAR_PATH:?}"

source /tmp/release-lib.sh

BACKUP_KEEP="${DEPLOY_BACKUP_KEEP:-5}"

migrate_legacy_layout_if_needed() {
  if [[ -L "$CURRENT_LINK" || -e "$CURRENT_LINK" ]]; then
    return 0
  fi
  if [[ ! -d "${DEPLOY_REMOTE_DIR}/output" && ! -f "${DEPLOY_REMOTE_DIR}/package.json" ]]; then
    return 0
  fi

  local ts rid item
  ts="$(release_new_id)"
  rid="$(release_dir_for "$ts")"
  mkdir -p "$rid"

  for item in output package.json package-lock.json "${DEPLOY_ECOSYSTEM_FILE}" node_modules; do
    [[ -e "${DEPLOY_REMOTE_DIR}/${item}" ]] && mv "${DEPLOY_REMOTE_DIR}/${item}" "$rid/"
  done

  release_switch "$rid"
  link_output_compat
  echo "==> migrated legacy layout -> ${rid}"
  if release_pm2 describe "${DEPLOY_PM2_APP}" >/dev/null 2>&1; then
    echo "==> pm2 reload after legacy migration"
    release_pm2_reload "${DEPLOY_PM2_APP}" "${DEPLOY_ECOSYSTEM_FILE}"
  fi
}

backup_before_deploy() {
  local active items=()
  active="$(release_get_active 2>/dev/null || true)"

  if [[ -z "$active" || ! -d "$active" ]]; then
    echo "==> skip backup (no active release)"
    return 0
  fi

  [[ -d "${active}/output" ]] && items+=(output)
  [[ -f "${active}/package.json" ]] && items+=(package.json)
  [[ -f "${active}/package-lock.json" ]] && items+=(package-lock.json)
  [[ -f "${active}/${DEPLOY_ECOSYSTEM_FILE}" ]] && items+=("${DEPLOY_ECOSYSTEM_FILE}")

  if ((${#items[@]} == 0)); then
    echo "==> skip backup (empty active release)"
    return 0
  fi

  mkdir -p "$BACKUP_DIR"
  local ts backup_file
  ts="$(release_new_id)"
  backup_file="${BACKUP_DIR}/backup-${ts}.tar.gz"
  echo "==> backup: ${backup_file}"
  tar -czf "$backup_file" -C "$active" "${items[@]}"
  release_prune_backups
  echo "==> backup kept: latest ${BACKUP_KEEP}"
}

# 兼容已有 Nginx alias 指向 DEPLOY_REMOTE_DIR/output/
link_output_compat() {
  ln -sfn "${DEPLOY_REMOTE_DIR}/current/output" "${DEPLOY_REMOTE_DIR}/output"
}

source "$HOME/.nvm/nvm.sh"
nvm use default

mkdir -p "$RELEASES_ROOT" "$BACKUP_DIR" "${DEPLOY_REMOTE_DIR}/logs"

migrate_legacy_layout_if_needed
backup_before_deploy

local_ts="$(release_new_id)"
release_path="$(release_dir_for "$local_ts")"
mkdir -p "$release_path"

echo "==> extract: ${DEPLOY_TAR_PATH} -> ${release_path}"
tar -xzf "${DEPLOY_TAR_PATH}" -C "$release_path"

cd "$release_path"
echo "==> npm ci --omit=dev"
npm ci --omit=dev --ignore-scripts

echo "==> activate release (zero-downtime reload)"
release_switch "$release_path"
link_output_compat
release_prune_legacy_root
release_pm2_reload "${DEPLOY_PM2_APP}" "${DEPLOY_ECOSYSTEM_FILE}"
release_cleanup

rm -f "${DEPLOY_TAR_PATH}"

echo "==> done"
release_pm2_verify "${DEPLOY_PM2_APP}"
