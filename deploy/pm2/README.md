# blog-home-nuxt PM2 部署（生产）

## 一条命令

```powershell
npm run deploy
```

线上目录：`/opt/jxapp/server/blog-home-nuxt` → Nginx 反代 `:5050`，静态资源走 `output/public/`

## 环境变量

| 文件 | Git | 用途 |
|------|-----|------|
| `.env.production`（根目录） | ✅ 可提交 | **本地 build 直接读这个** |
| `deploy/pm2/deploy.local.env` | ❌ gitignore | SSH 凭据 |

与 blog-admin 相同：env 在 build 时打进产物，**不打进 tar**。

## SSH 配置

```bash
cp deploy/pm2/deploy.local.env.example deploy/pm2/deploy.local.env
```

可选：`DEPLOY_BACKUP_KEEP=5`、`DEPLOY_RELEASE_KEEP=5`

## 目录结构（方案 B，零停机）

```text
/opt/jxapp/server/blog-home-nuxt/
  current -> releases/20260622-143000/
  output -> current/output              # 兼容已有 Nginx alias
  releases/
    20260622-143000/                    # output/、node_modules、ecosystem…
    backups/
  logs/                                 # 共享，release 外
```

## 流程

1. 读根目录 `.env.production` → `npm run build` → 本地 `.output/` 打包为 `output/`
2. 备份 active release → 上传 tar
3. 解压到新 release → `npm ci` → 切 `current` → **`pm2 reload`**（不停服）

## PM2

进程名 `BlogHomeNuxt`，端口 `5050`。服务器用 `deploy/pm2/ecosystem.config.cjs`（`output/server/index.mjs`）。

## 回滚

```powershell
npm run rollback:list
npm run rollback
npm run rollback -- -BackupName backup-20250621-143022.tar.gz
```

FinalShell：`/opt/jxapp/server/blog-home-nuxt/releases/`
