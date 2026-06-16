---
description: blog-home-nuxt pages 路由嵌套与 layout 约定
globs: pages/**/*.vue
alwaysApply: false
---

# Pages Layout & Routing

全局路由过渡：`nuxt.config` → `pageTransition: { name: 'scale', mode: 'out-in' }`。

## Layout

全站仅保留 `layouts/default.vue`（Nav + Footer + `CyberBackground`）。新页面**无需**写 `definePageMeta({ layout })`，除非将来新增其他 Layout。

页面内容区统一 `<CyberPageContainer>` + `<CyberCard>`，见 `home-14-page-development.mdc`。

## 嵌套路由父级壳

`tool.vue` 等含共享 UI 的父级页面，用 `CyberPageContainer` + `<NuxtPage />` 包裹子路由，**保留**。

- `tool.vue` → 工具箱标题 + `ToolSubNav` + 子页 `<NuxtPage />`
- 子工具页只写业务内容，不再重复包外层容器

## 保留：default 包装层

`index.vue`、`about.vue`、`msgboard.vue` 等仅用 `<div><NuxtPage /></div>` 包根元素，供过渡动画使用，**不要删除**。

## 新增页面检查

- 父级是否只是空 `<NuxtPage />` 透传？是则不要建父级
- 跳出嵌套路由后整页空白？优先查 layout / 过渡冲突
- 内容页是否已用 `CyberPageContainer`？
