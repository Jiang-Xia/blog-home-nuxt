---
description: blog-home-nuxt Cyber 主题组件封装规范（FAB、抽屉、浮层）
globs: components/**/*.{vue,tsx,css,less}
alwaysApply: false
---

# Cyber 组件封装规范

完整页面规范见 `home-14-page-development.mdc` 与 `docs/page-development-guide.md` §8。

## 原则

- **新 UI 块优先 `components/cyber/`**，复用 `assets/css/main.css` 中 `--tech-*` 令牌与 `cyber-*` class
- **禁止**裸 `btn btn-primary btn-circle` 做全站浮层入口；**禁止**写死 `#00f5ff` / `#050505` 等色值
- 深浅主题（`cyber` / `cyber-light`）须目测一致；动画轻量（pulse / glow），避免多层 blur 叠加

## 已有 Cyber 组件

| 组件 | 用途 |
|------|------|
| `CyberPageContainer` | 页面容器 |
| `CyberCard` | 毛玻璃卡片（`cyber-glass-card`） |
| `CyberButton` | 主/次按钮（`cyber-btn-primary\|secondary`） |
| `CyberSectionHeader` | 区块标题 |
| `CyberAlert` | 提示框 |
| `CyberFab` | 悬浮操作按钮（霓虹 FAB） |
| `CyberNavBar` / `CyberBackground` / … | 布局与背景 |

## 浮层 / FAB 写法

```vue
<!-- ✅ 全站浮层入口 -->
<CyberFab
  aria-label="打开 xxx"
  hint="可选提示"
  placement="bottom-right"
  @click="open"
>
  <xia-icon icon="blog-ai" width="24px" height="24px" />
</CyberFab>

<!-- ✅ 抽屉/面板 -->
<div class="cyber-drawer-panel">
  <div class="cyber-drawer-panel__accent" aria-hidden="true" />
  <div class="cyber-section-label">SECTION</div>
  ...
</div>

<!-- ❌ 避免 -->
<button class="btn btn-circle btn-primary shadow-lg">...</button>
```

## 位置约定

| 场景 | FAB 位置 |
|------|----------|
| 普通页 | `bottom-right`（与 backtop 错开，默认 `cyber-fab` 已抬高） |
| 文章详情 | `bottom-left`（右侧已有 `ArticleRpgFab`） |

面板与 FAB 同侧对齐（`rag-assistant__panel--left\|right` 可参考）。

## 扩展 checklist

- [ ] 样式是否用 `var(--tech-*)` / 现有 `cyber-*` class？
- [ ] 是否应放入 `components/cyber/` 而非页面 scoped？
- [ ] 多页复用的 class 是否加到 `main.css` `@layer components`？
- [ ] `cyber` + `cyber-light` 是否目测正常？
