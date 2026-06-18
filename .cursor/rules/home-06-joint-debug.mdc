---
description: blog-home-nuxt 与 blog-server 联调约束
globs: **/*.{vue,ts}
alwaysApply: false
---

# 联调约束

## 协议

- 后端响应：`{ code, data, message }` — 前端不在业务层改协议
- 字段变更优先向后兼容，避免页面直接读新字段导致 undefined

## 环境变量（`.env.*`）

| 变量 | 用途 |
|------|------|
| `VITE_NUXT_ORIGIN_URL` | 后端 origin |
| `VITE_NUXT_API_PREFIX` | API 前缀（如 `/x-blog/api/v1`） |
| `VITE_NUXT_PREFIX_PATH` | 本地代理前缀（默认 `/api`） |
| `VITE_NUXT_OPEN_ENCRYPT` | 是否开启请求加密 |
| `VITE_ENV` | 环境标识 |

开发代理：`nuxt.config` → `nitro.devProxy[prefixPath]` → `originUrl + apiPrefix`。

## 排查顺序

1. 代理前缀 rewrite 是否正确（最常见）
2. Swagger 路径、Method、鉴权是否与 `api/*.ts` 一致
3. 401/403/404/500 提示语义与 `request.ts` 的 `getErrorMessage` 一致
4. 加密接口是否请求加密 + 响应解密同时启用

## HTTP 状态提示

401 → 重新登录 · 403 → 无权限 · 404 → 资源不存在 · 500 → 服务器错误（各页面交互保持一致）
