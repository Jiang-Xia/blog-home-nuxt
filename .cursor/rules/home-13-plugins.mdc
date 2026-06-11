---
description: blog-home-nuxt Nuxt 插件注册规范
globs: plugins/**/*.{ts,js}
alwaysApply: false
---

# Nuxt Plugins

## 文件命名

- 仅客户端执行 → `.client.ts` / `.client.js`（如 `ga.client.ts`、`vconsole.client.ts`）
- 双端均可 → 无后缀（如 `directive.ts`、`pinia.ts`）

## 写法

```typescript
export default defineNuxtPlugin((nuxtApp) => {
  // 注册指令、provide、router 钩子
  return { provide: { /* ... */ } };
});
```

## 职责

- 全局注册：指令、第三方 SDK 初始化、Pinia provide
- 路由级副作用：如百度统计 `router.afterEach`（见 `ga.client.ts`）
- **不放**业务数据请求与页面逻辑

## Pinia 注入

`plugins/pinia.ts` 通过 `$pinia` 注入 store，页面/composable 仍优先 `useState`；store 使用见 `home-11-stores-pinia.mdc`。

## 禁止

- 在 plugin 中读写 token / userInfo（归 `composables/use-common.ts` + `api/request.ts`）
- 无 `.client` 后缀却访问 `window` / `document`
- 重复注册已在 `nuxt.config` modules 中提供的功能
