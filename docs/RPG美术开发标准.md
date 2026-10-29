# blog-home-nuxt · RPG 美术开发标准（UI 实现规范）v1

> 日期：2026-10-29 ｜ 状态：**生效中** ｜ 依据：`assets/css/rpg-theme.css` 实际代码（v6 落地后）
> 姊妹文档：[`RPG美术风格提案.md`](./RPG美术风格提案.md)（风格锚点 / 色板理论 / 图片资产生成规范，负责「图怎么画」）
> 本文档负责「**代码怎么写**」：任何 RPG 面板 / 卡片 / 按钮 / 状态的新增或改动，按本文执行，不逐案重新发明。
> 原则：**新代码不写死色值，一律取 `rpg-theme.css` 变量**（`var(--rpg-xxx, fallback)` 写法只允许作为降级兜底）。

---

## 一、设计令牌（`--rpg-art-*`，唯一取色处）

定义于 `rpg-theme.css` L109-125，暗色主题在 L378-381 有覆盖。

| 令牌 | 值 | 语义 |
|---|---|---|
| `--rpg-art-gold` | `#d9a13c` | 金：主 CTA、达成环、传说描边 |
| `--rpg-art-amber` | `#e8b04b` | 金亮部（渐变起点） |
| `--rpg-art-gold-grad` | `135deg #e8b04b → #d9a13c` | 金渐变（按钮/金环底） |
| `--rpg-art-gold-ink` | `#3a2408` | 金底上的墨色文字 |
| `--rpg-art-gold-soft` | 亮 `#fdf6e4` / 暗 `rgb(217 161 60/.14)` | 金柔和底（标签、提示条） |
| `--rpg-art-violet` | `#7c5cf0` | 紫：次级强调、稀有系 |
| `--rpg-art-violet-deep` | `#5b3fd6` | 紫渐变收尾 |
| `--rpg-art-violet-soft` | 亮 `#f1edfb` / 暗 `rgb(124 92 240/.16)` | 紫柔和底 |
| `--rpg-art-shadow-gold` / `-violet` | `0 6px 16px …0.32` | 金/紫弥散投影 |
| `--rpg-art-halo` | 径向金光 | 图标底光晕 |
| `--rpg-art-rare` (+`-glow`) | `#8d7bf5` | Rare 稀有度描边 |
| `--rpg-art-epic` (+`-glow`) | `#b8842c` | Epic+ 稀有度描边 |

**硬规则**：金系只给「达成/奖励/主行动」，紫系只给「稀有/科技/次级」，不得混用语义。

---

## 二、卡片体系（三种，别造第四种）

### 2.1 徽章墙卡 `rpg-loot-card--wall`（默认选择）

所有「可堆叠的物品/成就/任务/增益/兑换」一律用它。竖卡结构自上而下：

```
┌──────────────┐
│   ◉ 圆图标    │  rpg-loot-icon 圆徽章居中（状态环挂它上面，见三）
│  (状态环)     │
│   名称        │  rpg-loot-name 13px/800
│  RARITY 稀有度│  稀有度标注行 8.5px/800 大写字距（对齐成就 medal-rn，rarityColor 着色）
│   说明        │  rpg-loot-desc 10.5px muted（可省）
│  [chips]     │  加成标签行（EXP/金币/声望，见 2.4）
│  ▓▓▓░░ 进度  │  rpg-loot-progress（可省）
│ ┏━━━━━━━┓ │
│ ┗ 按钮 ┛ │  rpg-loot-footer + rpg-loot-claim-btn 通栏（见四）
└──────────────┘
```

- 网格：`rpg-loot-grid` 桌面 `minmax(188px,1fr)`；**密集墙（任务/背包/兑换）覆盖为 `minmax(128px,1fr)`**，移动端自动降 168/140/128。
- **禁止给墙卡设固定 `min-height`**——高度随内容，紧凑窄卡是基准形态（曾因 118-156px 的 min-height 撑成大方块被返工）。
- 状态角标胶囊挂 `.rpg-loot-card-head` 右上（`rpg-loot-status--corner`）。

### 2.2 成就奖章条 `AchievementPanel` 的 medal 卡

横条形（图标左 + 内容右），是「已完成叙事」的展示形态；新列表卡默认用 2.1，只有成就这类「档位感」内容才用横条。

### 2.3 普通卡 `rpg-loot-card`

无 `--wall` 修饰时的兜底形态（等级奖励 reward-card 等异构内容）。可自由布局，但状态环/按钮/胶囊仍按三、四、五节执行。

### 2.4 加成 chips

EXP/金币/声望等加成标签：`999px` 胶囊、10.5px/700、类型色 soft 底 + 同色文字 + 半透明边框。参考 `PetPanel.vue` 兑换卡的 chips 实现。

---

## 三、状态环系统（挂 `.rpg-loot-icon` 上）

定义于 `rpg-theme.css` L1287-1340，注释即规范：

| 状态 | 类名 | 视觉 | 用在哪 |
|---|---|---|---|
| 达成/已拥有/可领取/激活中 | `is-medal-active` | **实线金环** + 径向光底 + conic 流光旋转（`rpgMedalShine`） | 已解锁成就、已拥有兑换、可领取任务、激活中增益 |
| 进行中/待激活/未达成 | `is-medal-progress` | **虚线稀有度环**（`--rc` 变量点色）+ 轻灰化 | 进行中任务、待激活增益、等级奖励未达成 |
| 无状态/普通 | 无 | 普通 tint 底 | 常规物品 |

- locked/claimed 等布尔修饰类**自动**映射到上表（`rpg-loot-card--locked` 默认走 progress 环），组件里一般不用手写。
- 等级奖励（`LevelRewardsPanel`）的异构卡另有同语言实现：未达成=金虚线环印章 + 卡片金虚线框 + 「还差 N 级」琥珀胶囊；图标只轻微去色（grayscale 0.32），**禁止整卡压灰**——未达成要让人看清目标。
- 动效强度纪律：只有 `is-medal-active` 有动效（流光），progress 静止。

---

## 四、按钮语言（两种，别造第三种）

| 按钮 | 类名 | 视觉 | 用途 |
|---|---|---|---|
| 主行动 | `rpg-loot-claim-btn` | 金渐变胶囊（`--rpg-level-badge-gradient`）、999px、白字/700、金弥散投影 | 领取/激活/兑换/签到（`RpgStatusPanel.sign-btn` 已对齐此语言） |
| 变体 | `--owned` / `--pause` | 置灰 / 暂停色 | 已拥有、停用中 |

- 墙卡内的主行动按钮**通栏**（footer 拉满卡宽）。
- 禁止再引入 `--rpg-primary-gradient` 紫方角按钮（旧语言，已淘汰）。

---

## 五、状态胶囊 `rpg-loot-status`

| 类 | 视觉 | 用途 |
|---|---|---|
| `--done` | 绿章 | 已领/已达成/已兑换 |
| `--pending` | 灰章 | 进行中（等级奖励卡内被覆盖为琥珀金，见三） |
| `--corner` | 右上角标定位 | 配合以上两用 |

**原则：有按钮表达的状态就不放胶囊**——「可领取」已有金环 + 领取按钮双重表达，胶囊是冗余（QuestPanel 已删过一次）；「已兑换」同理（PetPanel 已删）。胶囊只留给**按钮无法表达**的状态（已领绿章、进行中灰章）。

---

## 六、图标规则

1. 物品/宠物/徽章一律走 `RpgItemIcon` 组件（回退链：管理端 `iconUrl` → `/rpg/icons/{key}.png` → emoji）。
2. 美术大图放 `/rpg/icons/`（128px 透明底 PNG）或 `/rpg/art/`（大横幅/立绘）；键名登记见 `utils/rpg-item-asset.ts` 与 `public/rpg/icons/README.md`。
3. **新代码禁止 emoji 做图标/装饰**；存量 emoji 在碰到时顺手替换为美术图。
4. 生图提示词、尺寸、禁忌 → 全部复用提案文档「风格锚点 v1」逐字段，不在本标准重复。

---

## 七、主题与可见性（踩坑沉淀）

1. 双主题（亮/暗）下所有文字必须可读：**深色渐变底上的文字写死浅色**，不继承页面文字色（SeasonBanner 倒计时踩过：亮色主题深底深字）。
2. 反之同理：固定深底角标（如背包 `inv-cell__qty` 数量章）不跟 `--rpg-text-heading` 走，写死深底 + 亮字 + 描边。
3. 验收动作：切亮/暗主题各刷一遍，检查每处文字对比度。

---

## 八、新面板/新卡片 Checklist

- [ ] 取色全部来自 `rpg-theme.css` 变量（含 fallback 写法）
- [ ] 卡片用三体系之一，未造新卡型；墙卡无固定 `min-height`，网格 minmax 按密集度选
- [ ] 状态表达：环（三）+ 胶囊（五）+ 按钮（四）各司其职，无冗余胶囊
- [ ] 稀有度：只允许四档（Common/Rare/Epic/Legendary），描边用 `--rpg-art-rare/-epic`
- [ ] 无 emoji 图标；图片键已登记 `utils/rpg-item-asset.ts`
- [ ] 亮/暗双主题各验证一遍文字可读性
- [ ] eslint 通过；改了卡片引用后如涉 MP 端记得跑子集化脚本（见项目笔记）
