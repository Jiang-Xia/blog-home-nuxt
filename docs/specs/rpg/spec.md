# RPG 冒险中心（Home 消费）

## 目标

登录用户在 `/rpg` 完成签到、任务、抽奖等；音效与 WS 反馈不重复打扰。

## 依赖契约

- Server：`blog-server/docs/specs/rpg-core/spec.md`
- 音效：`docs/rpg-audio-guide.md`、`home-17-rpg-audio.mdc`
- 物品展示：`home-15-rpg-item-display.mdc`

## 行为

- 未登录：引导登录，不静默写玩法
- WS `/realtime` 与页面本地反馈二选一播音，避免双响
- 充值弹窗：建单 → 扫码 → 到账事件关窗（按现有实现）
- 稀有度/名称等展示用接口字段

## 验收

- [ ] 登录用户主路径可用
- [ ] 音效表与指南在新增 SFX 后已更新
- [ ] 无重复全屏特效 / Toast（联调推送时）
