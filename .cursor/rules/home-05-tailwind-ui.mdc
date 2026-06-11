---
description: blog-home-nuxt Tailwind / DaisyUI / Nuxt UI 样式规范
globs: **/*.{vue,css,less}
alwaysApply: false
---

# UI 与样式

## 组件体系（按优先级）

1. **`xia-*`** — 项目自定义组件（`components/xia/`）：按钮、评论、分页、主题等
2. **`U*`** — Nuxt UI（prefix `U`，见 `nuxt.config` `ui.prefix`）
3. **`In*`** — Inspira UI（`modules/inspria-ui`，如 `InFlickeringGrid`）
4. **DaisyUI** — 语义 class：`btn`、`badge`、`tabs`、`dropdown`、`data-theme`

不引入第四套 UI 库；新页面优先 DaisyUI + 现有 xia 组件。

## Tailwind

- 入口：`assets/css/main.css`（Tailwind v4 + `@tailwindcss/vite`）
- 过长 class 可拆为 scoped style 或小组件，避免模板单行过长
- 页面容器常用：`padding-top-bar`、`page-container`、`xia-page`

## 主题

- 明/暗切换通过 `document.documentElement` 的 `class` + `data-theme`
- 全局样式改动需验证 light/dark 与移动端断点（`md:`、`lg:`）

## 性能

- 首屏/列表页避免多层 shadow、blur、滤镜叠加
- 动画轻量；路由过渡已配置 `pageTransition: scale out-in`，勿额外冲突
