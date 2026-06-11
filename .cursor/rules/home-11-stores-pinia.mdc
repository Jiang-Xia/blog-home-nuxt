---
description: blog-home-nuxt Pinia store 使用边界与写法
globs: stores/**/*.ts
alwaysApply: false
---

# Pinia Store

## 何时使用

**默认不用 Pinia。** 跨组件共享态优先 `composables/` + `useState`（`useUserInfo`、`useRpg` 等）。

仅在以下情况新增 store：

- 需要 Pinia devtools 调试的复杂全局状态机
- 多处 unrelated 模块读写同一持久化业务态，且 composable 已无法清晰收敛

登录态、RPG、主题等**已有 composable 的域，禁止再建平行 Pinia store**。

## 文件与命名

- 集中维护在 `stores/index.ts`（当前项目惯例）
- 导出：`useXxxStore = defineStore('storeId', { ... })`
- store id 全局唯一，与 composable 的 `useState` key 不重复

## 写法

```typescript
export const useWebsiteStore = defineStore('websiteStore', {
  state: () => ({ name: '', description: '' }),
  getters: { /* 派生态 */ },
  actions: {
    async fetch() {
      // 异步 + loading/error 在此处理，不泄漏到页面
    },
  },
});
```

## 禁止

- 在 store 内直接 `fetch` blog-server 业务接口（应走 `api/request.ts` 封装后在 action 中调用）
- 复制 `useUserInfo` / `useToken` 已有字段
- 为单页面局部状态新建 store
