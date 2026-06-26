---
description: sitemap 模块代码风格（按约定直取）
globs: server/api/__sitemap__/**/*.ts
alwaysApply: false
---

# sitemap 模块约定

参考 `server/api/__sitemap__/urls.ts`：

- 文章 ID 直取 `res.data.list`，再 `map(v => v.id)` 生成 `/detail/${id}`
- 不写 `pickList` / `pickArticleId` 等兼容分支
- 避免深层可选链与多重判空（`payload?.data?.list`、`Array.isArray ? ... : []`），除非接口确实不稳定
- 保持轻量：直观 `map/concat`，避免大对象拼装与多余中间函数
- 静态页由 `@nuxtjs/sitemap` 的 `nuxt:pages` 源自动收录；动态文章走 `sources: ['/api/__sitemap__/urls']`
