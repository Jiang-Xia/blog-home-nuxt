---
description: blog-home-nuxt 请求封装、token 与错误处理规范
globs: api/**/*.ts
alwaysApply: false
---

# API 请求契约

## 入口

- 统一从 `api/request.ts` 暴露 `get` / `post` / `put` / `del` / `http`
- 业务模块（`article.ts`、`rpg.ts` 等）只封装 URL 与参数，不重复处理 token
- 聚合导出维护在 `api/index.ts`

## 响应协议

```typescript
// 后端标准：{ code, data, message }
// request 层已解包，业务层直接拿 data
const data = await request.get('/article/info', { id });
```

- 禁止在页面/组件层自定义二次协议解析
- 类型参考 `api/ApiResponse.ts`

## Token 与 401

- Header：`Authorization: Bearer <token>`
- Cookie 读写集中在 `utils/cookie.ts`（`TokenKey` / `RefreshTokenKey`）
- 401 走无感 refresh + 请求队列（`queue`），禁止静默吞错
- WebSocket 鉴权同样用 Bearer，见 `use-realtime-socket.ts`（namespace `/realtime`）

## 其他机制

- 防重复请求：`requestMap` 默认开启；`/rpg/` 在白名单（允许并发 GET，不误杀）
- RPG GET in-flight：`api/rpg-inflight.ts` + `api/rpg.ts` 合并同 key 进行中的请求；mutation 成功后 `afterRpgMutation` 清 key 再 refresh
- 加密：`VITE_NUXT_OPEN_ENCRYPT=true` 时对称 `aesEncrypt/aesDecrypt`，仅对约定路径
- 错误提示用 `messageDanger`，文案走 `getErrorMessage`，不暴露原始异常
- 可选工具：`awaitWrap(promise)` 返回 `[err, data]` 元组
