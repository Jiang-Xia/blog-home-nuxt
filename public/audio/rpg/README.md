# RPG 音频素材（混合方案）

> 开发接入、WS 防重复、新增音效步骤 → **[docs/rpg-audio-guide.md](../../docs/rpg-audio-guide.md)**  
> Cursor 规则 → **`.cursor/rules/home-17-rpg-audio.mdc`**

## 架构

| 类型 | 实现 | 是否需要文件 |
|------|------|----------------|
| **BGM** | howler.js | ✅ `bgm-adventure.wav` |
| **传说揭晓 fanfare** | howler.js | ✅ `sfx-lottery-reveal-legendary.wav` |
| **其余短音效** | Web Audio 实时合成 | ❌ 无需文件 |

合成逻辑：`utils/rpg-audio-synth.ts`  
路由与音量：`composables/use-rpg-audio.ts`

## 必需文件（仅 2 个）

| 文件 | 说明 |
|------|------|
| `bgm-adventure.wav` | 冒险页循环 BGM |
| `sfx-lottery-reveal-legendary.wav` | 金色传说品质揭晓 |

其余 `sfx-*.wav` 已移除；短音效由 Web Audio 合成，无需本地文件。

重新生成占位 BGM / 传说音：`node scripts/generate-rpg-audio.mjs`（仅覆盖对应 wav）

## 替换正式素材

1. 保持上述 **2 个文件名** 不变，直接覆盖
2. BGM 建议额外提供 `.webm` + `.mp3`，并改 `constants/rpg-audio.ts` 中 `RPG_BGM.adventure.src`
3. 传说 fanfare 可换更史诗的 wav/mp3，改 `RPG_FILE_SFX.lotteryRevealLegendary.src`

### 搜素关键词

| 文件 | 关键词 |
|------|--------|
| `bgm-adventure` | `rpg town loop`, `fantasy village ambient`, `adventure calm loop` |
| `sfx-lottery-reveal-legendary` | `legendary drop`, `jackpot fanfare`, `golden treasure fanfare` |

许可优先 **CC0** / **CC BY**。详见此前 Freesound 筛选技巧。

## 合成音效列表（无需文件）

点击、宝箱、滚轮、揭晓、升级、成就、神作、社交、签到、任务奖励，以及 Tab 切换、穿戴/卸下、Buff 开关、宠物、公会等页面操作。

调整合成音色：改 `utils/rpg-audio-synth.ts`；调整响度：改 `constants/rpg-audio.ts` 中 `RPG_SYNTH_SFX`。
