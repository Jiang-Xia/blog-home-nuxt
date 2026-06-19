# Home 端功能说明（2026-06 三批优化）

> 读者/作者体验增强；后端见 `blog-server/docs/home-api-2026-06.md`。

## 新增路由

| 路径 | 说明 |
|------|------|
| `/search?q=` | 统一搜索页 |
| `/tag/[id]` | 标签文章列表 |
| `/category/[id]` | 分类文章列表 |
| `/feed.xml` | RSS 订阅（Nitro） |
| `/user/profile?tab=inbox` | 评论收件箱 |
| `/user/profile?tab=dashboard` | 创作数据看板 |

## 详情页增强

- 相关推荐 `ArticleRelated`（`/article/related`）
- 分享条 `ArticleShareBar`
- 移动端目录 `ArticleTocDrawer`
- 同作者上一篇/下一篇 `ArticleAdjacentNav`（随 `/article/info` 的 prev/next）
- 评论分页加载更多
- JSON-LD + canonical

## 作者工作流

- 登录回跳：`composables/use-login-redirect.ts`
- 编辑器草稿 localStorage autosave + 离开页 CyberModal 确认
- 发布成功 Cyber 结果面板
- 个人中心文章列表：状态/标题筛选

## 通知

- 导航栏 `NavNotificationBell`（60s 轮询未读）
- 评论创建时后端写 `site_notification`

## 关键 API 封装

- `api/author.ts` — related、author-stats、on-my-articles
- `api/notification.ts` — list、unread-count、read
