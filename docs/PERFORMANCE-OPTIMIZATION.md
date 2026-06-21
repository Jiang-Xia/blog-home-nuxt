# 首屏性能优化 — 部署与验收

对应计划：线上首屏性能优化（四批次）。

## 发布顺序

1. **Nginx 静态直出** — 同步 [blog-server/deploy/nginx](../../blog-server/deploy/nginx/) 后 `nginx -t && reload`
2. **Nuxt 前端** — `yarn build` + PM2 restart（含字体子集、API 去重、SSR 瘦身）

## 部署前检查

```bash
# 路径必须与 jiang-xia.top.conf 中 alias 一致
ls /opt/jxapp/server/blog-home-nuxt/current/output/public/_nuxt/
ls /opt/jxapp/server/blog-home-nuxt/current/output/public/fonts/HarmonyOS_Sans_SC_Subset.woff2
ls /opt/jxapp/server/blog-server/public/uploads/

sudo nginx -t && sudo systemctl reload nginx
```

## 验收清单

### 批次 1 — Nginx

- [ ] `curl -I https://jiang-xia.top/_nuxt/<chunk>.js` → 200，`Cache-Control: public, immutable`
- [ ] `curl -I https://jiang-xia.top/x-api/blog-server/static/uploads/.../pm2.png` → 200，`expires` 约 30d
- [ ] 首页 HTML 仍正常 SSR（非 404）
- [ ] 纯静态刷新时 Nest/Nuxt PM2 日志请求量下降

### 批次 2 — 字体

- [ ] `curl -I https://jiang-xia.top/fonts/HarmonyOS_Sans_SC_Subset.woff2?v=1` → 200，`max-age=86400`（非 immutable）
- [ ] 体积 < 500KB（当前子集约 156KB）
- [ ] 中文标题/正文/RPG 文案无 tofu（缺字时运行 `npm run font:subset` 扩大字符集）

### 批次 3 — API 去重

- [ ] 登录后刷新首页：`/user/info` ≤ 1 次，`/rpg/status` ≤ 1 次
- [ ] 首页首屏：`POST /article/list` 仅 1 次（Hero 统计与 `ArticleList` 共用 `useAsyncData('index_GetList')`，见 [页面开发规范 §2.4](./page-development-guide.md#24-useasyncdata-与请求去重)）
- [ ] RPG 签到、升级弹窗、`/realtime` WebSocket 推送与刷新正常

### 批次 4 — SSR 瘦身

- [ ] 查看网页源代码：文章列表仍在 HTML 中
- [ ] 评论侧栏客户端加载（「加载评论中…」→ 列表）
- [ ] 分类/标签仅在打开筛选下拉时请求 API

## 缓存策略（Nginx）

| 路径 | 策略 | 频繁发版 |
|------|------|----------|
| `/_nuxt/*` | 1y + `immutable` | 安全（文件名带 hash） |
| `/fonts/*` | 1d + `must-revalidate` | 改子集后递增 `app.less` / `nuxt.config` 的 `?v=` |
| `/js/*` | 7d + `must-revalidate` | 常改脚本可缩短 nginx expires |
| uploads | 30d | 同 URL 换图需注意 |
| HTML（`@nuxt`） | `no-cache` | 每次 SSR 拿新 HTML |

## 字体子集重建

源字体需放在 `scripts/font/HarmonyOS_Sans_SC_Regular.source.woff2`（不提交 git），然后：

```bash
npm run font:subset
```

若字符集有增删，同步递增：

- `styles/base/app.less` → `?v=1` 改为 `?v=2`
- `nuxt.config.ts` → `FONT_SUBSET_VERSION`

## 回滚

| 批次 | 操作 |
|------|------|
| Nginx | 恢复 `location /` 全量 `proxy_pass :5050`，去掉静态 alias |
| 字体 | `app.less` 改回旧 URL 或移除 `@font-face` |
| 前端 | `git revert` 对应 commit + rebuild |

## 指标记录（优化前后对比）

| 指标 | 优化前 | 优化后 | 备注 |
|------|--------|--------|------|
| 首页 HTML TTFB | | | DevTools → Document |
| LCP | | | Lighthouse 移动端 |
| 首屏请求数 | | | Network 禁用缓存 |
| 字体下载体积 | ~4MB | ~156KB | |
| 登录态 `/rpg/status` 次数 | | | 应 ≤ 1 |
