---
description: blog-home-nuxt Vue3 + TS 编码风格规范
globs: **/*.vue
alwaysApply: false
---

# Vue + TS 风格

## Script

- 统一 `<script setup lang="ts">` + Composition API
- 页面必备：`useHead({ title: '...' })`；一般无需 `definePageMeta({ layout })`
- SSR 数据用 `useAsyncData` / `await useAsyncData(...)`，key 保持唯一语义
- 复杂模板逻辑下沉到 `computed` 或具名函数

## 格式化（ESLint + Prettier）

2 空格 · 分号 · 单引号 · 100 列 · `htmlWhitespaceSensitivity: strict` · `vueIndentScriptAndStyle: true`

## 页面模式示例

```vue
<script setup lang="ts">
/**
 * 模块说明（保留文件头注释）
 */
useHead({ title: '页面标题' });

const route = useRoute();
const userInfo = useUserInfo();
// 业务逻辑 ...
</script>
```

## SSR / Hydration

- DOM 副作用放 `onMounted` 或 `import.meta.client` 分支
- 主题切换等客户端逻辑参考 `useThemeActions`（含 `localStorage` 读写）
- Tab 路由同步用 `watch(() => route.query.tab, ...)` + `router.replace`

## 组件引用

- 全局注册：`xia-*`（自定义）、`U*`（Nuxt UI）、`In*`（Inspira）
- 局部引入：`import { getMyArticleList } from '@/api/article'`
