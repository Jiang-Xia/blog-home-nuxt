#!/bin/bash
# =============================================================================
# blog-home-nuxt 远程部署脚本（Nuxt SSR + PM2）
# 由本地 deploy.ps1 通过 SSH 调用
#
# 流程：备份 → 停 PM2 → 清 output → 解压 → npm ci → 启动 PM2
# 线上产物目录为 output/（无点号），与 Nginx 静态 alias 一致
# =============================================================================

set -euo pipefail

: "${DEPLOY_REMOTE_DIR:?}"
: "${DEPLOY_PM2_APP:?}"
: "${DEPLOY_ECOSYSTEM_FILE:?}"
: "${DEPLOY_TAR_PATH:?}"

BACKUP_DIR="${DEPLOY_REMOTE_DIR}/releases/backups"
BACKUP_KEEP="${DEPLOY_BACKUP_KEEP:-5}"

backup_before_deploy() {
  local items=()
  [[ -d "${DEPLOY_REMOTE_DIR}/output" ]] && items+=(output)
  [[ -f "${DEPLOY_REMOTE_DIR}/package.json" ]] && items+=(package.json)
  [[ -f "${DEPLOY_REMOTE_DIR}/package-lock.json" ]] && items+=(package-lock.json)
  [[ -f "${DEPLOY_REMOTE_DIR}/${DEPLOY_ECOSYSTEM_FILE}" ]] && items+=("${DEPLOY_ECOSYSTEM_FILE}")

  if ((${#items[@]} == 0)); then
    echo "==> skip backup (no existing release)"
    return 0
  fi

  mkdir -p "$BACKUP_DIR"
  local ts backup_file
  ts=$(date +%Y%m%d-%H%M%S)
  backup_file="${BACKUP_DIR}/backup-${ts}.tar.gz"
  echo "==> backup: ${backup_file}"
  tar -czf "$backup_file" -C "${DEPLOY_REMOTE_DIR}" "${items[@]}"

  ls -1t "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null | tail -n +$((BACKUP_KEEP + 1)) | while IFS= read -r f; do
    [[ -n "$f" ]] && rm -f "$f"
  done
  echo "==> backup kept: latest ${BACKUP_KEEP}"
}

source "$HOME/.nvm/nvm.sh"
nvm use default

mkdir -p "${DEPLOY_REMOTE_DIR}/logs"

backup_before_deploy

echo "==> stop pm2: ${DEPLOY_PM2_APP}"
pm2 stop "${DEPLOY_PM2_APP}" 2>/dev/null || true

# output/public 供 Nginx 直出 _nuxt/；output/server 供 PM2 跑 SSR
echo "==> clean stale output (tar only overwrites, never deletes removed files)"
rm -rf "${DEPLOY_REMOTE_DIR}/output"

echo "==> extract: ${DEPLOY_TAR_PATH} -> ${DEPLOY_REMOTE_DIR}"
tar -xzf "${DEPLOY_TAR_PATH}" -C "${DEPLOY_REMOTE_DIR}"

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
rm -f "${DEPLOY_TAR_PATH}"

echo "==> done"
pm2 list | grep -E "name|${DEPLOY_PM2_APP}" || pm2 list
