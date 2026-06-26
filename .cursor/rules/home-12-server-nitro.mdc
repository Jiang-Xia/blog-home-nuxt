---
description: blog-home-nuxt Nitro 服务端路由规范
globs: server/**/*.{ts,mjs,js}
alwaysApply: false
---

# Server / Nitro 路由

## 职责边界

`server/api/` 仅用于 **Nuxt 服务端能力**，不替代 `blog-server` 业务 API：

| 适合放 server | 不适合放 server |
|---------------|-----------------|
| 隐藏第三方 API Key | 文章/用户/RPG 等 CRUD |
| SSE / 流式代理 | 带 token 的业务鉴权接口 |
| 构建期/服务端专属逻辑 | 可直接由前端 `api/request.ts` 调用的接口 |

参考：`server/api/ai-summary-stream.post.ts` → 前端 `SSE('/api/ai-summary-stream')`；配置检测 `GET /api/ai-summary-status`。RAG 助手：`server/api/rag-query-stream.post.ts` → 开发环境 AI SDK Chat 透传 `POST /rag/query-stream`（生产直连 blog-server）。

## 文件路由

- 路径映射：`server/api/<name>.<method>.ts` → `/api/<name>`
- 导出：`export default defineEventHandler(async (event) => { ... })`
- 使用 h3 工具：`readBody`、`createError`、`sendStream`、`getQuery`

## 密钥与配置

- 服务端密钥放 `nuxt.config` → `runtimeConfig`（非 `runtimeConfig.public`）
- 在 handler 内：`const config = useRuntimeConfig(event)`
- 示例：`aiSummaryApiKey` ← 环境变量 `AI_SUMMARY_API_KEY`
- **禁止**把密钥写进 `VITE_*` 或前端 bundle

## 错误与流

```typescript
if (!config.aiSummaryApiKey) {
  throw createError({ statusCode: 500, statusMessage: 'AI_SUMMARY_API_KEY is not configured' });
}
// 流式响应
return sendStream(event, upstream.body);
```

- 上游失败用 `createError` 返回明确 `statusCode` / `statusMessage`
- 不向前端泄漏 upstream 原始密钥或完整 stack
