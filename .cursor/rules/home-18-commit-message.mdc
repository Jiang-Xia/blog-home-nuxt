---
description: Git 提交信息格式（Conventional Commits + 中文 subject）
alwaysApply: true
---

# Git 提交信息

生成或建议 commit message 时遵循 **Conventional Commits**，且 **subject 用简体中文**（与 commitlint 一致）。

## 格式

```
<type>(<scope>): <中文简述>
```

- **type**：英文小写，仅限 `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`
- **scope**：可选，英文或模块名（如 `rpg`、`deploy`）
- **subject**：简体中文，说明「做了什么 / 为什么」，不用句号结尾，50 字内

## 示例

```
feat(rpg): 优化抽奖页音效播放时机
fix(deploy): 移除仅 Linux 本地用的 deploy.sh
docs: 更新 PM2 部署说明
chore: 清理 deploy 目录下的 .pack 缓存
```

## 避免

```
feat: optimize homepage loading          # subject 不要用英文
Fix: 修复首页问题                         # type 不要大写
feat: 修复 bug。                          # 不要句号结尾
update homepage                          # 缺少 type，不符合 commitlint
```

Agent 代写 commit message 或用户请求生成提交说明时，一律按上述格式输出。
