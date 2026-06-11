---
description: blog-home-nuxt 目录与模块边界规范
globs: **/*.{vue,ts}
alwaysApply: false
---

# Nuxt 目录与模块边界

## 分层

```
pages/          → 路由入口，组合 components + composables
components/     → 展示组件，按业务域分子目录
composables/    → 业务逻辑与共享状态（useState）
api/            → HTTP 封装，不在页面直接写 $fetch 配置
types/          → 类型定义，避免同一结构多处重复
utils/          → 无 Vue 依赖的纯函数
```

## 组件放置

- 跨页面复用 → `components/<域>/`
- 仅单路由使用 → `pages/<路由>/components/`
- 仅客户端渲染 → 文件名加 `.client.vue`（如 WebRTC 组件）
- 新模块命名跟随同目录既有风格：`user/`、`xia/` 用 kebab-case；`rpg/` 用 PascalCase

## API 与类型

- 业务接口函数放 `api/<模块>.ts`，通过 `api/index.ts` 聚合导出
- 模块专属类型放 `types/<模块>.ts`；全局 interface 放 `types/global.d.ts`
- 消费响应默认 `res.data`，不在页面层再解析 `{ code, data, message }`

## 禁止

- 在 composable/store 之外散落 token 读写逻辑
- 在非客户端安全位置访问 `window`/`document`/`localStorage`
- 引入与 `xia/`、`U*`（Nuxt UI）、`In*`（Inspira）平行的第三套 UI 体系
