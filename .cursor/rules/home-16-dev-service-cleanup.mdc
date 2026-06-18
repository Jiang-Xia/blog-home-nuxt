---
description: 启动/测试 blog-home-nuxt 后必须关闭服务，避免端口占用
alwaysApply: true
---

# 开发服务清理（blog-home-nuxt）

Agent 为验证而启动的任何 dev 进程，**测试结束后必须关闭**，不得留给用户占用端口。

## 默认端口

- Nuxt dev：`5050`（`package.json` → `npm run dev`）

## 必须关闭的场景

- `npm run dev` / `npm run dev:ip` / `npm run preview`
- 后台 Shell 中启动的前端 dev server

## 结束方式（Windows）

1. 前台进程：确认已退出
2. 后台 Shell：验证完成后主动结束对应 shell 任务或 `Stop-Process`
3. 端口仍被占用时：

```powershell
netstat -ano | findstr :5050
Stop-Process -Id <PID> -Force
```

## 禁止关闭的基础设施

以下服务**不要停止**：

- **MySQL**（`3306`）
- **Redis**（`6379`）

只关闭本项目 dev 进程（端口 `5050`），勿误杀数据库或缓存。

## 完成前自检

- 不再需要的 dev 服务已全部停止
- 联调时若同时起了 blog-server，两端都要关
