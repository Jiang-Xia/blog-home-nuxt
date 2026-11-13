# 登录与会话（Home 消费）

## 目标

用户在 `/login` 登录后 Cookie 持有 token，后续请求带鉴权；401 引导重登。

## 依赖契约

- Server：`blog-server/docs/specs/auth/spec.md`
- 联调账号：`18888888888` / `super`

## 行为

- 账号密码：进页验证码策略按现网实现（字符图 / 行为弹窗）
- Token 存 Cookie（如 `x-accessToken`）；刷新逻辑保持现有 composable/store
- GitHub OAuth：仅 Web；按 server ticket 流程
- 展示用户信息字段来自 API，禁止本地角色名硬编码字典冒充后端

## 验收

- [ ] 正确凭证可登录并进入需登录页（如个人中心）
- [ ] token 失效后受保护操作触发重登/提示
