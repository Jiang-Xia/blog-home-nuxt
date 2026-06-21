#!/bin/bash
# =============================================================================
# 方案 B：releases/ 版本目录 + current 软链（三项目 remote 脚本共用）
# =============================================================================

: "${DEPLOY_REMOTE_DIR:?}"

RELEASES_ROOT="${DEPLOY_REMOTE_DIR}/releases"
BACKUP_DIR="${RELEASES_ROOT}/backups"
CURRENT_LINK="${DEPLOY_REMOTE_DIR}/current"
RELEASE_ID_PATTERN='^[0-9]{8}-[0-9]{6}$'

release_new_id() {
  date +%Y%m%d-%H%M%S
}

release_dir_for() {
  echo "${RELEASES_ROOT}/$1"
}

release_get_active() {
  if [[ -L "$CURRENT_LINK" ]]; then
    readlink -f "$CURRENT_LINK"
    return 0
  fi
  return 1
}

release_switch() {
  local release_path="$1"
  ln -sfn "$release_path" "$CURRENT_LINK"
  echo "==> switch current -> ${release_path}"
}

release_cleanup() {
  local keep="${DEPLOY_RELEASE_KEEP:-5}"
  local count=0 name
  for name in $(ls -1t "$RELEASES_ROOT" 2>/dev/null); do
    [[ "$name" == "backups" ]] && continue
    [[ "$name" =~ $RELEASE_ID_PATTERN ]] || continue
    count=$((count + 1))
    if (( count > keep )); then
      echo "==> remove old release: ${RELEASES_ROOT}/${name}"
      rm -rf "${RELEASES_ROOT}/${name}"
    fi
  done
}

release_prune_backups() {
  local keep="${DEPLOY_BACKUP_KEEP:-5}"
  ls -1t "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null | tail -n +$((keep + 1)) | while IFS= read -r f; do
    [[ -n "$f" ]] && rm -f "$f"
  done
}

release_pm2() {
  PM2_SILENT=true pm2 "$@"
}

# jlist 解析：取某 app 全部实例
release_pm2_jlist_node() {
  local app="$1"
  export PM2_JLIST_APP="$app"
  release_pm2 jlist | node -e "
    const chunks = [];
    process.stdin.on('data', (d) => chunks.push(d));
    process.stdin.on('end', () => {
      const app = process.env.PM2_JLIST_APP;
      let list = [];
      try { list = JSON.parse(Buffer.concat(chunks).toString('utf8') || '[]'); }
      catch (e) { process.exit(2); }
      const hit = list.filter((p) => p.name === app);
      if (!hit.length) process.exit(3);
      for (const p of hit) {
        const e = p.pm2_env || {};
        console.log([e.status, e.pm_exec_path, e.pm_cwd].join('\t'));
      }
      process.exit(0);
    });
  "
}

# PM2 cwd 是否指向 current 对应 release（旧扁平目录会导致 cluster 一个 online 一个 waiting restart）
release_pm2_cwd_matches_current() {
  local app="$1"
  local expected
  expected="$(readlink -f "$CURRENT_LINK")"
  export PM2_VERIFY_APP="$app"
  export PM2_EXPECTED_CWD="$expected"
  release_pm2 jlist | node -e "
    const chunks = [];
    process.stdin.on('data', (d) => chunks.push(d));
    process.stdin.on('end', () => {
      const app = process.env.PM2_VERIFY_APP;
      const expected = process.env.PM2_EXPECTED_CWD;
      let list = [];
      try { list = JSON.parse(Buffer.concat(chunks).toString('utf8') || '[]'); }
      catch (e) { process.exit(1); }
      const hit = list.filter((p) => p.name === app);
      if (!hit.length) process.exit(1);
      const ok = hit.every((p) => {
        const cwd = (p.pm2_env && p.pm2_env.pm_cwd) || '';
        const script = (p.pm2_env && p.pm2_env.pm_exec_path) || '';
        return cwd === expected || script.startsWith(expected + '/');
      });
      process.exit(ok ? 0 : 1);
    });
  " >/dev/null 2>&1
}

release_pm2_all_online() {
  local app="$1"
  export PM2_VERIFY_APP="$app"
  release_pm2 jlist | node -e "
    const chunks = [];
    process.stdin.on('data', (d) => chunks.push(d));
    process.stdin.on('end', () => {
      const app = process.env.PM2_VERIFY_APP;
      let list = [];
      try { list = JSON.parse(Buffer.concat(chunks).toString('utf8') || '[]'); }
      catch (e) { process.exit(1); }
      const hit = list.filter((p) => p.name === app);
      if (!hit.length) process.exit(1);
      process.exit(hit.every((p) => (p.pm2_env || {}).status === 'online') ? 0 : 1);
    });
  " >/dev/null 2>&1
}

release_pm2_wait_online() {
  local app="$1"
  local max="${2:-60}"
  local waited=0
  while (( waited < max )); do
    if release_pm2_all_online "$app"; then
      echo "==> pm2 all instances online (${waited}s)"
      return 0
    fi
    sleep 2
    waited=$((waited + 2))
  done
  echo "==> pm2 wait online timeout (${max}s)" >&2
  return 1
}

release_pm2_reload() {
  local app="$1"
  local eco="$2"

  cd "$CURRENT_LINK"

  if release_pm2 describe "$app" >/dev/null 2>&1; then
    if release_pm2_cwd_matches_current "$app"; then
      echo "==> pm2 reload: ${eco}"
      release_pm2 reload "$eco" --env production --update-env
      release_pm2 save
      if release_pm2_wait_online "$app" 90; then
        return 0
      fi
      echo "==> pm2 reload incomplete, recreate from current"
    else
      echo "==> pm2 cwd stale (not under current release), recreate from current"
    fi
    release_pm2 delete "$app"
  fi

  echo "==> pm2 start: ${eco}"
  release_pm2 start "$eco" --env production
  release_pm2 save
  release_pm2_wait_online "$app" 90
}

release_pm2_summary() {
  local app="$1"
  echo "==> pm2 status summary:"
  release_pm2_verify "$app" || true
}

release_pm2_verify() {
  local app="$1"
  export PM2_VERIFY_APP="$app"
  release_pm2 jlist | node -e "
    const chunks = [];
    process.stdin.on('data', (d) => chunks.push(d));
    process.stdin.on('end', () => {
      const app = process.env.PM2_VERIFY_APP;
      let list = [];
      try { list = JSON.parse(Buffer.concat(chunks).toString('utf8') || '[]'); }
      catch (e) { console.error('ERROR: pm2 jlist parse failed'); process.exit(1); }
      const hit = list.filter((p) => p.name === app);
      if (!hit.length) { console.error('ERROR: pm2 app not found:', app); process.exit(1); }
      for (const p of hit) {
        const e = p.pm2_env || {};
        console.log('status', e.status);
        console.log('script path', e.pm_exec_path);
        console.log('exec cwd', e.pm_cwd);
      }
      if (!hit.every((p) => (p.pm2_env || {}).status === 'online')) {
        console.error('ERROR:', app, 'not all instances online');
        process.exit(1);
      }
    });
  "
}

# 方案 B 启用后，删除部署根下残留扁平产物，避免 PM2 误读旧 dist
release_prune_legacy_root() {
  [[ -L "$CURRENT_LINK" ]] || return 0
  local item
  for item in dist package.json package-lock.json ecosystem.config.js ecosystem.config.cjs .env.production node_modules output; do
    if [[ -e "${DEPLOY_REMOTE_DIR}/${item}" && ! -L "${DEPLOY_REMOTE_DIR}/${item}" ]]; then
      echo "==> remove legacy root item: ${item}"
      rm -rf "${DEPLOY_REMOTE_DIR}/${item}"
    fi
  done
}
