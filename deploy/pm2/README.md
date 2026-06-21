# blog-home-nuxt PM2 部署（生产）

## 一条命令

```powershell
npm run deploy
```

线上目录：`/opt/jxapp/server/blog-home-nuxt` → Nginx 反代 `:5050`，静态资源走 `output/public/`（**无点号**，FinalShell 可直接看到）

## 环境变量

| 文件 | Git | 用途 |
|------|-----|------|
| `.env.production`（根目录） | ✅ 可提交 | **本地 build 直接读这个**（`npm run build --dotenv .env.production`） |
| `deploy/pm2/deploy.local.env` | ❌ gitignore | SSH 凭据 |

与 blog-admin 相同：env 在 build 时打进产物，**不打进 tar**。

## SSH 配置

```bash
cp deploy/pm2/deploy.local.env.example deploy/pm2/deploy.local.env
# 填入真实 DEPLOY_HOST / DEPLOY_PASSWORD / DEPLOY_HOSTKEY
```

可选：`DEPLOY_BACKUP_KEEP=5`（默认保留最近 5 份备份）

## 流程

1. 读根目录 `.env.production` → `npm run build` → 本地生成 `.output/`
2. 打包时 `.output` **改名为 `output/`**（与 Nginx 路径一致，FinalShell 可见）
3. **备份**当前 `output/` 等 → 上传 tar + `remote-deploy.sh`
4. 远程：pm2 stop → 清 `output/` → 解压 → `npm ci --omit=dev` → pm2 start

## PM2

进程名 `BlogHomeNuxt`，端口 `5050`。服务器用 `deploy/pm2/ecosystem.config.cjs`（`output/server/index.mjs`）；本地开发仍用根目录 `ecosystem.config.js`（`.output/`）。

备份目录：`{DEPLOY_REMOTE_DIR}/releases/backups/`（含 `output/`、`package.json`、`ecosystem.config.cjs`）

## 回滚

```powershell
npm run rollback:list
npm run rollback
npm run rollback -- -BackupName backup-20250621-143022.tar.gz
```

FinalShell：`/opt/jxapp/server/blog-home-nuxt/releases/backups/`
