# 页面开发规范

本文档说明 `blog-home-nuxt` 项目中**新建页面、选择 Layout、编写样式**的统一约定。  
Cursor 规则精简版：`.cursor/rules/home-14-page-development.mdc`。

---

## 1. 技术栈与样式入口

| 层级 | 说明 | 入口 |
|------|------|------|
| 设计令牌 | 颜色、背景随主题切换 | `assets/css/main.css` 中 `--tech-*`、`--color-*` |
| 公用 class | 跨页面复用的语义类 | `main.css` → `@layer components` |
| Cyber 组件 | 页面骨架与 UI 块 | `components/cyber/` |
| Tailwind CSS 4 | 布局、间距、字号 | 模板 class |
| DaisyUI | 表单、按钮、标签页等 | `btn`、`input`、`form-control` 等 |
| Nuxt UI | 前缀 `U` | `nuxt.config` → `ui.prefix: 'U'` |

全局样式入口：`assets/css/main.css`（Tailwind v4 + DaisyUI + 项目主题）。  
旧版 Less 主题变量（`styles/base/_theme.less` 中 `--main-bgc`、`--text-color` 等）**已废弃**，新页面不要使用。

**项目已统一管理样式**：颜色/背景通过 CSS 变量（设计令牌）+ 公用 class（`@layer components`）+ Cyber 组件三层封装；新页面优先复用，不要写死色值或重复造轮子。

| 我要设置… | 首选写法 | 定义位置 |
|-----------|----------|----------|
| 文字颜色 | `text-tech` / `text-tech-muted` / … | `main.css` → `@layer components` |
| 背景颜色 | `bg-tech-shell` / `<CyberCard>` | 同上 + `components/cyber/` |
| 字体大小 | Tailwind `text-sm` / `text-xl` / `md:text-3xl` | Tailwind 内置 |
| 布局间距 | Tailwind `flex` / `grid` / `gap-*` / `p-*` | Tailwind 内置 |
| 表单/按钮 | DaisyUI + `login-input` / `<CyberButton>` | `main.css` + Cyber 组件 |

---

## 2. 新建页面流程

### 2.1 创建文件

```
pages/
  my-page.vue              → 路由 /my-page
  my-module/
    index.vue              → 路由 /my-module
    components/            → 仅该模块使用的私有组件
      MyWidget.vue
```

### 2.2 最小页面模板

```vue
<script setup lang="ts">
import { SiteTitle } from '@/utils/constant';

useHead({
  title: '页面标题',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});

// 可选：特殊场景才 definePageMeta({ layout: '...' });
</script>

<template>
  <CyberPageContainer
    label="SECTION"
    title="页面标题"
    subtitle="副标题说明"
  >
    <CyberCard hover class="!p-6">
      <h3 class="text-xl font-bold text-tech">区块标题</h3>
      <p class="mt-2 text-sm leading-relaxed text-tech-muted">
        正文内容
      </p>
      <CyberButton to="/somewhere" class="mt-4">
        操作
      </CyberButton>
    </CyberCard>
  </CyberPageContainer>
</template>
```

### 2.3 Script 约定

- 统一 `<script setup lang="ts">` + Composition API
- 页面必备：`useHead({ title })`；需要时 `definePageMeta({ layout })`
- SSR 数据：`useAsyncData` / `await useAsyncData(...)`，key 保持语义唯一（**同 key 合并请求**见 [§2.4](#24-useasyncdata-与请求去重)）
- 浏览器 API（`window`、`localStorage`、第三方 DOM 脚本）放在 `onMounted` 或 `import.meta.client` 分支
- 主题切换逻辑参考 `composables/use-home.ts` → `useThemeActions`

### 2.4 useAsyncData 与请求去重

> **`useAsyncData` 的第一个参数是全局缓存 key：同一次页面渲染里，相同 key 只会真正发一次请求，后面的调用直接复用结果。**

Nuxt 会把每个 key 对应的数据放进应用级 payload 缓存（SSR 时写入 HTML，客户端 hydration 时复用）。父组件、子组件、多个 composable 只要使用**相同的字符串 key**，共享的是**同一份响应式数据**，不会重复打 HTTP。

#### 机制简述

```
pages/index/index.vue     useAsyncData('index_GetList', handler)  → 首次：执行 handler，发起请求
ArticleList（子组件）      useAsyncData('index_GetList', handler)  → 命中缓存：不再请求
```

- **执行顺序**：Vue `setup` 父先于子；通常由先 `await useAsyncData` 的一方触发唯一一次请求。
- **多份 `data`**：`const { data: a }` 与 `const { data: b }` 可以各写一次，但底层是同一 key 的同一份结果。
- **筛选 / 分页**：若组件内用 `getXxx()` 直接调 API（而非 `refresh()` / 再次 `useAsyncData`），与首屏缓存 key **无关**，按需另发请求。

#### 项目内示例：首页 Hero 总数 + 文章列表

改前用两个 key（`home_ArticleStats` + `index_GetList`）会打 **两次** `POST /article/list`。现改为共用 `index_GetList`：

| 文件 | 用途 |
|------|------|
| `pages/index/index.vue` | `useAsyncData('index_GetList', …)` → Hero 读 `pagination.total` |
| `components/article-list.vue` | 默认 `asyncDataKey: 'index_GetList'` → 列表读 `list` + `pagination` |

父页请求参数须与 `ArticleList` 默认 `queryPrams` 一致（如 `pageSize: 12`、`sort: 'DESC'`）。若以后改列表默认值，**同步改首页**里的同 key handler。

其他落地页通过不同 key 隔离，避免串数据：

- 分类：`async-data-key="category_${id}"`
- 标签：`async-data-key="tag_${id}"`
- 搜索：`async-data-key="search_${q}"`

#### 何时在父页也写 `useAsyncData`

若父页只读子组件的数据，可以用 `useNuxtData('someKey')`，但 **SSR 首屏**时父 `setup` 先于子，缓存可能仍空。需要父级首屏就有数据（如首页 Hero 统计）时，应在父页也 `await useAsyncData('someKey', handler)`，子组件用**同 key** 复用即可。

#### 注意

- key 相同但**首次 handler 查询条件不一致**时，以先执行的那次为准，后注册的 handler 不会重跑。
- key 应**语义唯一**，避免 unrelated 页面 accidentally 共用（例如不要用过于泛化的 `'list'`）。

相关验收：`docs/PERFORMANCE-OPTIMIZATION.md` → 批次 3 API 去重。

---

## 3. Layout 选择

| 场景 | 说明 |
|------|------|
| 全部内容页 | `default`（默认，无需写 definePageMeta） |
| 工具箱子页 | 继承 `tool.vue` 的 `CyberPageContainer` 壳层 |

Layout 根节点已设置基础样式：

```html
<div class="app-layout tech-shell min-h-screen bg-tech-shell text-tech">
```

页面内容区统一使用 `<CyberPageContainer>` + `<CyberCard>`，登录/注册/404 等同理。

详见：`.cursor/rules/home-10-pages-layout-routing.mdc`。

---

## 4. 样式体系

### 4.1 优先级（从高到低）

1. **主题感知公用类** — `text-tech-*`、`bg-tech-*`、`border-tech`、`cyber-*`
2. **Cyber 组件** — 封装好的页面块
3. **Tailwind 工具类** — 布局、间距、字号
4. **DaisyUI 语义 class** — 表单、按钮
5. **页面 scoped 样式** — 仅该页独有、且无法用上述方式表达时

### 4.2 主题机制

- 主题切换：`document.documentElement` 的 `class` + `data-theme`（`cyber` / `cyber-light`）
- 壳层 class：`html.tech-shell` 挂载设计令牌
- 初始化：`app.vue` → `useThemeActions().initTheme()`

新增或修改全局样式时，必须在 **深色（cyber）** 和 **浅色（cyber-light）** 下各验证一次。

### 4.3 新页面样式如何选择与编写

按下面顺序决策，**能复用就不写 scoped**：

```
需要颜色/背景/边框？
  → 是：用 text-tech-* / bg-tech-* / border-tech / Cyber 组件
  → 否：需要字号？
      → 是：Tailwind text-xs ~ text-4xl（可加 md: 响应式）
      → 否：需要布局/间距？
          → 是：Tailwind flex / grid / gap / p / m
          → 否：页面独有结构或第三方覆盖？
              → 是：<style scoped lang="less">，颜色引用 var(--tech-*)
              → 否：多页复用？→ 加到 main.css @layer components 或新建 Cyber 组件
```

**推荐写法示例：**

```vue
<CyberPageContainer label="SECTION" title="页面标题" subtitle="副标题">
  <CyberCard hover class="!p-6">
    <h2 class="text-2xl font-bold text-tech md:text-3xl">区块标题</h2>
    <p class="mt-2 text-sm leading-relaxed text-tech-muted md:text-base">正文</p>
    <CyberButton variant="primary" class="mt-4">操作</CyberButton>
  </CyberCard>
</CyberPageContainer>
```

**禁止写法：**

```vue
<!-- ❌ 写死颜色，亮色主题会失效 -->
<div style="color: #ffffff; background: #050505">
<div class="bg-[#050505]">

<!-- ❌ 使用已废弃 Less 变量 -->
<style>.card { background: var(--main-bgc); }</style>
```

Layout 根节点已带 `bg-tech-shell text-tech`，普通内容页**无需再包一层页面背景**。

---

## 5. 设计令牌（CSS 变量）

定义位置：`assets/css/main.css`。

### 5.1 文字与背景

| 变量 | 用途 |
|------|------|
| `--tech-fg` | 主文字色 |
| `--tech-fg-muted` | 次要文字 |
| `--tech-fg-subtle` | 更淡文字 |
| `--tech-fg-faint` | 最淡（页脚等） |
| `--tech-shell` | 页面主背景 |
| `--tech-shell-header` | 顶栏背景 |
| `--tech-glass` | 毛玻璃卡片背景 |
| `--tech-border` | 边框色 |
| `--tech-section-label` | 区块标签 / 强调色 |

### 5.2 DaisyUI 主题色

| 变量 | 用途 |
|------|------|
| `--color-primary` | 主色 |
| `--color-base-100` ~ `--color-base-300` | 背景层级 |
| `--color-base-content` | 基础文字色 |

在 scoped 样式中引用变量示例：

```less
.my-block {
  border: 1px solid var(--tech-border);
  color: var(--tech-fg-muted);
  background: var(--tech-glass);
}
```

---

## 6. 公用 class 速查（统一管理）

**唯一定义位置**：`assets/css/main.css` → `@layer components`（约 155–489 行）。  
新增跨页复用 class 也加在此处，命名遵循 `text-tech-*` / `bg-tech-*` / `border-tech` / `cyber-*`。

### 6.1 文字颜色

| Class | 对应变量 | 用途 |
|-------|----------|------|
| `text-tech` | `--tech-fg` | 主文字 |
| `text-tech-muted` | `--tech-fg-muted` | 次要文字、说明 |
| `text-tech-subtle` | `--tech-fg-subtle` | 更淡文字 |
| `text-tech-faint` | `--tech-fg-faint` | 最淡（页脚等） |
| `text-primary` | `--color-primary` | DaisyUI 主色强调 |
| `cyber-gradient-text` | `--tech-gradient-*` | 渐变标题 |
| `cyber-section-label` | `--tech-section-label` | 小标签（大写、字间距） |

### 6.2 背景与边框

| Class | 对应变量 | 用途 |
|-------|----------|------|
| `bg-tech-shell` | `--tech-shell` | 页面主背景 |
| `bg-tech-header` | `--tech-shell-header` | 顶栏背景 |
| `cyber-glass-card` | `--tech-glass` | 毛玻璃卡片（`<CyberCard>` 已封装） |
| `cyber-grid-bg` | `--tech-shell` + 网格线 | 网格背景 |
| `border-tech` | `--tech-border` | 主题感知边框 |
| `tech-glow-purple/cyan/blue` | `--tech-glow-*` | 光效背景块 |

### 6.3 按钮与导航

| Class | 用途 |
|-------|------|
| `cyber-btn-primary` | 主按钮（优先 `<CyberButton variant="primary">`） |
| `cyber-btn-secondary` | 次按钮 |
| `cyber-nav-link` / `cyber-nav-link-active` | 导航链接 |
| `link-item` | 方形链接卡片（工具页等） |

### 6.4 表单与提示

| Class | 用途 |
|-------|------|
| `login-label` + `login-label-text` | 表单标签 |
| `login-input` | 输入框容器（含 focus 边框） |
| DaisyUI `form-control` | 表单字段包装 |
| `cyber-alert` / `cyber-alert-warning` / `cyber-alert-info` | 提示框 |
| `fieldset-legend` / `label-text` | 字段说明文字 |

参考：`pages/login.vue`。

### 6.5 兼容层说明

历史页面大量使用 `text-white/60`、`bg-white/5` 等 Tailwind 类。  
`main.css` 519–609 行将其映射到 `--tech-*`，以支持亮色主题。  
**新页面优先使用 `text-tech-*`**，语义更清晰、与主题机制一致。

---

## 7. 字体大小

项目**未单独封装字号工具类**，统一使用 **Tailwind**（颜色仍用 `text-tech-*`，勿与 Tailwind 默认 `text-gray-*` 混用）：

| Class | 约等于 | 典型用途 |
|-------|--------|----------|
| `text-xs` | 12px | 页脚、辅助信息 |
| `text-sm` | 14px | 正文、说明 |
| `text-base` | 16px | 默认正文 |
| `text-lg` | 18px | 小标题 |
| `text-xl` ~ `text-4xl` | 逐级放大 | 区块标题、页面标题 |
| `font-bold` / `font-medium` | — | 字重 |
| `leading-relaxed` | — | 正文行高 |

响应式：前缀断点 `md:`、`lg:` 放大标题或正文。

```vue
<h1 class="text-2xl font-bold text-tech md:text-3xl">标题</h1>
<p class="text-sm leading-relaxed text-tech-muted md:text-base">正文</p>
<span class="cyber-section-label">SECTION</span> <!-- 标签字号已内置 -->
```

---

## 8. Cyber 组件库

路径：`components/cyber/`。

| 组件 | 作用 |
|------|------|
| `CyberPageContainer` | 页面容器（max-width、padding、返回链接、标题区） |
| `CyberSectionHeader` | 区块标题（label + title + subtitle） |
| `CyberCard` | 毛玻璃卡片（封装 `cyber-glass-card`） |
| `CyberButton` | 主/次按钮（`variant="primary\|secondary"`，支持 `to`） |
| `CyberBackground` | 背景光效（Layout 已包含，页面一般无需重复） |
| `CyberAlert` | 提示框 |
| `CyberNavBar` | 导航条 |
| `CyberFab` | 悬浮操作按钮（霓虹 FAB，全站浮层入口） |

### 参考页面

| 页面 | 特点 |
|------|------|
| `pages/features/index.vue` | 标准内容页：SectionHeader + Card 网格 |
| `pages/login.vue` | 表单页：glass-card + login-input |
| `pages/about/index.vue` | 简单内容页 |

---

## 9. 组件选用优先级

1. **`xia-*`** — 项目通用 UI（评论、分页、图标等）
2. **`Cyber*`** — 科技风页面骨架与卡片
3. **`U*`** — Nuxt UI
4. **`In*`** — Inspira UI（粒子背景等特效）
5. **DaisyUI class** — `btn`、`badge`、`tabs`、`dropdown`

**不引入新的 UI 库。** 新页面优先 DaisyUI + 现有 xia / Cyber 组件。

---

## 10. 何时写 scoped 样式

**应该写 scoped 的情况：**

- 页面独有的布局结构（复杂 grid、特殊动画）
- 第三方组件深度覆盖（如 Markdown 编辑器内部样式）
- 无法通过 Tailwind + 公用 class 表达的样式

**不应该写 scoped 的情况：**

- 颜色、背景、边框 — 用 `text-tech-*` / `CyberCard`
- 可跨页复用的 UI 块 — 提取为 `components/cyber/` 或加到 `main.css`

**禁止：**

```vue
<!-- ❌ 写死颜色，亮色主题会失效 -->
<div style="color: #ffffff; background: #050505">

<!-- ❌ 使用已废弃变量 -->
<style>
.card { background: var(--main-bgc); }
</style>
```

---

## 11. 扩展公用样式

| 场景 | 做法 | 示例 |
|------|------|------|
| 多页复用的 class | 加到 `assets/css/main.css` → `@layer components` | 新的 `text-tech-*`、`cyber-*` |
| 完整 UI 块（含结构） | 新建 `components/cyber/Xxx.vue` | `CyberCard`、`CyberAlert` |
| 单页独有布局/动画 | 页面 `<style scoped lang="less">`，颜色用 `var(--tech-*)` | 复杂 grid、第三方组件覆盖 |
| 主题色调整 | 改 `main.css` 中 `html.tech-shell` / `[data-theme="cyber"]` 变量 | 深浅色均需验证 |

新增全局 class 命名建议：

- 颜色/背景：`text-tech-*`、`bg-tech-*`、`border-tech`
- 组件风格：`cyber-*` 前缀
- 业务无关、可主题化；改完在 **cyber + cyber-light** 下各验一次

---

## 12. 性能与过渡

- 首屏/列表页避免多层 `shadow`、`blur`、滤镜叠加
- 路由过渡已配置：`pageTransition: { name: 'scale', mode: 'out-in' }`，勿添加冲突的全页 opacity 动画
- 大特效组件（粒子、3D）按需加载，避免阻塞首屏

---

## 13. 新增页面 Checklist

- [ ] 文件放在 `pages/` 正确路径，路由符合预期
- [ ] 已设置 `useHead({ title })`
- [ ] 内容页是否已用 `CyberPageContainer`？
- [ ] 使用 `text-tech-*` / `Cyber*` 而非硬编码颜色
- [ ] 在 `cyber` 与 `cyber-light` 下目测正常
- [ ] 移动端断点（`md:`、`lg:`）已检查
- [ ] 浏览器 API 在 `onMounted` / `import.meta.client` 内
- [ ] 可复用样式已提取到 `main.css` 或 Cyber 组件，而非散落在页面
- [ ] **文档**：已更新 `README.md` 常用页面表；新 API/能力见 `docs/home-features-*.md`（规则：`.cursor/rules/feature-doc-sync.mdc`）

---

## 14. 相关规则索引

| 文件 | 内容 |
|------|------|
| `.cursor/rules/feature-doc-sync.mdc` | **新功能必同步文档**（工作区根目录） |
| `.cursor/rules/home-00-core.mdc` | 项目总览与目录职责 |
| `.cursor/rules/home-02-vue-ts-style.mdc` | Vue + TS 编码风格 |
| `.cursor/rules/home-05-tailwind-ui.mdc` | Tailwind / DaisyUI 约定 |
| `.cursor/rules/home-10-pages-layout-routing.mdc` | Layout 与嵌套路由 |
| `.cursor/rules/home-14-page-development.mdc` | 本规范 Cursor 精简版 |
