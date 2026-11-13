# blog-home-nuxt — Agent 入口

Nuxt 博客**用户前台**（MIT）。API 来自 `blog-server`。工作区根打开时须同时遵守 `myGithub/.cursor/rules/`。

## 技术栈与端口

| 项 | 值 |
|----|-----|
| 栈 | Nuxt · Vue 3 · TypeScript · Pinia · Tailwind / DaisyUI / Nuxt UI |
| 本地 | `http://localhost:5050` |
| 启动 | `yarn dev`（本机 Nest `5000`） |
| 后端 | `blog-server`；响应 `{ code, data, message }` |
| 联调账号 | `18888888888` / `super` |

SSR 安全：浏览器 API 放在 `import.meta.client` 或 `.client.vue`。验证用 Nuxt 结束后必须关进程，勿占 5050。勿停 MySQL/Redis。

## 目录速查

| 路径 | 用途 |
|------|------|
| `pages/` | 路由页；私有组件放同目录 `components/` |
| `api/` | 按业务拆分；统一 `request.ts` |
| `components/`、`composables/`、`stores/` | UI / 逻辑 / Pinia |
| `server/api/` | Nitro（RSS、天气、AI 代理等） |
| `docs/page-development-guide.md` | 新页面开发 |
| `docs/rpg-audio-guide.md` | RPG 音效（改 SFX 必更） |
| `docs/specs/` | C 端消费侧薄规格 |

常用页面表见 `README.md`「常用页面」。

## 必读规则

- 总览：`home-00-core.mdc`（always）
- 结构 / 风格 / API 契约：`home-01` ~ `home-03`
- 页面开发 / 布局 / 注释：`home-14`、`home-10`、`home-09`
- RPG 音效 / 物品展示：`home-17`、`home-15`
- Cyber 组件：`home-19-cyber-component-encapsulation.mdc`
- 提交：`home-18-commit-message.mdc`（中文 subject）
- 跨仓：`.cursor/rules/cross-repo-change-checklist.mdc` + `feature-doc-sync.mdc`

## 新页面 / 改 C 端能力时

1. 对照 `docs/specs/` 与 server 规格；跨端大改用 `blog-server/docs/changes/`。
2. API 封装写在 `api/`，文件头 JSDoc 标明数据来源字段（禁止前端 dict 回显展示文案）。
3. 更新 `README.md` 常用页面表；复杂流程补 `docs/page-development-guide.md`。
4. RPG 音效：更新 `docs/rpg-audio-guide.md`，避免 WS 与页面重复播音。
5. Nitro 新路由：遵守 `home-12-server-nitro.mdc` 并更新 README。
6. 涉及新公开/登录接口时，确认 server 已做 privilege patch（`isPublic` 等）。

## 提交

```
<type>(<scope>): <中文简述>
```

示例：`feat(rpg): 优化抽奖页音效播放时机`。细则见 `home-18-commit-message.mdc`。
