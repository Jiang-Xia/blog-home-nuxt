---
description: blog-home-nuxt 全项目代码注释规范（新功能必注释、复杂逻辑必注释）
alwaysApply: true
---

# 注释规范

注释说明**意图、规则与边界**，禁止翻译代码。修改或新增代码时**禁止删除**已有中文/文件头注释。

## 新功能 / 新模块（必须）

| 位置 | 写什么 |
|------|--------|
| **新文件顶部** | 页面/组件/composable 职责、数据来源（哪个 API） |
| **导出函数 / composable** | 用途、副作用（调 API、改共享 state、WebSocket） |
| **types 新接口** | 字段含义；若来自后端 enrich，注明「勿本地 map 回显」 |
| **组件 script 头** | 纯展示 vs 含业务；父组件传 props 的约定 |

## 必须加注释的场景

1. **所有新增/修改的函数与方法**（含 composable、组件 handler）：至少 1 行中文 JSDoc
2. **函数体超过 5 行**：函数头 JSDoc；核心分支前 1 行注释
3. **复杂逻辑**：多条件、异步并发、缓存/去重、WebSocket、请求队列、跨组件数据流
4. **核心逻辑块**：Tab 懒加载、统一请求、mutation 后 refresh、幂等分支

## 展示类数据（全项目通则）

- **列表/详情/标签/状态文案**：只渲染 **API 返回字段**，禁止为同一业务 code 维护前端 dict/map
- 类型定义与 API 对齐；展示用 `item.config?.xxxLabel`、`reward.xxx?.name` 等
- 若后端尚未下发展示字段，应改后端 enrich，而不是在前端补 map

> RPG 示例见 `home-15-rpg-item-display.mdc`。

## 文件级要求

- `composables/**`、`utils/**`：每个导出函数有中文 JSDoc
- `pages/**`、`components/**`：文件头模块说明；含副作用方法需注释
- 模板中非显然 `v-if`/事件，在 script 侧注释约定即可

## 可不注释

- 命名自解释的单行 getter/简单映射（≤5 行无分支）
- 禁止废话注释

## 示例

```typescript
/** 冒险 Tab 首屏：各接口只请求一次，写入页面 ref 供子组件 props */
const loadStatusTab = async () => {
  if (loadedTabs.value.has('status')) return;
  // 合并并发，避免子组件重复打相同接口
  ...
};
```
