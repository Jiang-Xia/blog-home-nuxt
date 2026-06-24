---
description: blog-home-nuxt 新页面开发与样式规范（Layout、主题令牌、Cyber 组件）
globs: pages/**/*.vue
alwaysApply: false
---

# 页面开发规范

完整说明见 `docs/page-development-guide.md`。Layout 冲突见 `home-10-pages-layout-routing.mdc`，样式体系见 `home-05-tailwind-ui.mdc`。

## 新建页面

1. 在 `pages/` 创建 `.vue`；页面私有组件放 `pages/<模块>/components/`
2. 设置 `useHead({ title, titleTemplate })`；需要时 `definePageMeta({ layout })`
3. 内容页优先 `<CyberPageContainer>` + `<CyberSectionHeader>` + `<CyberCard>`
4. 参考：`pages/features/index.vue`、`pages/login.vue`

## Script / 数据

- SSR：`await useAsyncData(key, handler)`；**同 key 在同一次渲染里只发一次请求**（父/子可复用），详见 `docs/page-development-guide.md` §2.4
- 浏览器 API 放 `onMounted` / `import.meta.client`

## Layout

| 场景 | 说明 |
|------|------|
| 普通内容页 | 默认 `default`（不写 definePageMeta） |
| 登录/注册/404 等 | 同样 `default` + `CyberPageContainer` |
| 工具箱子页 | 继承 `tool.vue` 的 `CyberPageContainer` 壳层 |

Layout 根节点已有 `bg-tech-shell text-tech`，普通页无需再包页面背景。

## 样式统一管理

项目已封装三层，新页面优先复用，禁止写死色值：

| 层级 | 入口 | 用途 |
|------|------|------|
| 设计令牌 | `assets/css/main.css` 中 `--tech-*`、`--color-*` | 深浅色主题切换 |
| 公用 class | `main.css` → `@layer components`（约 155–489 行） | `text-tech-*`、`cyber-*` 等 |
| Cyber 组件 | `components/cyber/` | 页面容器、卡片、按钮 |

旧版 Less 变量（`styles/base/_theme.less` 中 `--main-bgc`、`--text-color`）**已废弃**，勿在新页面使用。

## 样式优先级（从高到低）

1. **主题感知公用类**：`text-tech-*`、`bg-tech-*`、`border-tech`、`cyber-*`
2. **Cyber 组件**：`CyberPageContainer`、`CyberCard`、`CyberButton` 等
3. **Tailwind**：布局、间距、字号（`text-sm`、`text-xl`、`md:` 断点）
4. **DaisyUI**：`btn`、`input`、`form-control`、`badge`、`tabs`
5. **scoped 样式**：仅页面独有布局；颜色用 `var(--tech-*)`，禁止写死 `#fff`/`#000`

## 颜色 / 背景 / 字号 / 布局

```vue
<!-- ✅ 推荐 -->
<h2 class="text-2xl font-bold text-tech md:text-3xl">标题</h2>
<p class="text-sm leading-relaxed text-tech-muted md:text-base">正文</p>
<CyberCard hover class="!p-6">...</CyberCard>

<!-- ❌ 避免 -->
<p style="color: #fff">...</p>
<div class="bg-[#050505]">...</div>
<style>.x { background: var(--main-bgc); }</style>
```

| 需求 | 写法 |
|------|------|
| 主/次/淡文字 | `text-tech` / `text-tech-muted` / `text-tech-subtle` / `text-tech-faint` |
| 强调/渐变/标签 | `text-primary` / `cyber-gradient-text` / `cyber-section-label` |
| 页面/卡片背景 | `bg-tech-shell` / `<CyberCard>`（`cyber-glass-card`） |
| 边框 | `border-tech` |
| 字号 | Tailwind `text-xs`~`text-4xl` + `font-bold` + `md:` 断点（项目未封装字号 class） |
| 布局间距 | Tailwind `flex` / `grid` / `gap-*` / `p-*` / `mx-auto max-w-6xl` |
| 按钮 | `<CyberButton variant="primary\|secondary">` |
| 悬浮入口 | `<CyberFab>`（`cyber-fab`）；抽屉 `cyber-drawer-panel` |
| 表单 | `form-control` + `login-label` + `login-input input` |
| 提示框 | `cyber-alert` / `cyber-alert-warning` / `cyber-alert-info` |

## 扩展样式

| 场景 | 做法 |
|------|------|
| 多页复用 class | 加到 `main.css` → `@layer components`，命名 `text-tech-*` / `cyber-*` |
| 完整 UI 块 | 新建 `components/cyber/Xxx.vue` |
| 单页独有 | `<style scoped lang="less">`，颜色用 `var(--tech-*)` |

## 组件优先级

`xia-*` → `Cyber*` → `U*`（Nuxt UI）→ `In*`（Inspira）→ DaisyUI class。不引入新 UI 库。

## 新增页面 Checklist

- [ ] 内容页是否已用 `CyberPageContainer` + `CyberCard`？
- [ ] 是否复用 `text-tech-*` / `Cyber*` 而非硬编码颜色？
- [ ] 字号是否用 Tailwind `text-sm`/`text-xl` 等（非写死 px）？
- [ ] 是否在 `cyber` + `cyber-light` 下目测正常？
- [ ] 浏览器 API 是否在 `onMounted` / `import.meta.client` 内？
- [ ] 可复用样式是否应加到 `assets/css/main.css` 而非页面 scoped？
