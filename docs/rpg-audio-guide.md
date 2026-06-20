# RPG 音效开发指南

冒险模块采用 **混合音频方案**：长 BGM 与高保真 fanfare 用 **howler.js** 播文件，其余短音效用 **Web Audio API** 实时合成，无需为每个操作准备 wav。

## 文件地图

| 路径 | 职责 |
|------|------|
| `composables/use-rpg-audio.ts` | 全站单例：路由合成/文件、BGM、音量/静音、localStorage |
| `constants/rpg-audio.ts` | 音效键名、音量系数、稀有度映射 helper |
| `utils/rpg-audio-synth.ts` | Web Audio 合成实现与 `lotterySpin` 循环 |
| `components/rpg/RpgAudioControl.vue` | 静音 + BGM/SFX 滑条（冒险页 panel / 导航栏 nav 图标钮） |
| `public/audio/rpg/` | 仅 2 个必需 wav（见 `public/audio/rpg/README.md`） |
| `scripts/generate-rpg-audio.mjs` | 重新生成占位 BGM / 传说 fanfare |

Cursor 规则：`.cursor/rules/home-17-rpg-audio.mdc`

## 快速接入

```vue
<script setup lang="ts">
const { playSfx, initAudio, playBgm, stopBgm } = useRpgAudio();

onMounted(() => {
  void initAudio();
  void playBgm('adventure'); // 仅需要 BGM 的页面
});

/** 用户操作成功后 */
const onConfirm = async () => {
  await doSomething();
  void playSfx('uiClick');
};
</script>
```

- 调用前无需判断静音：`playSfx` / `playBgm` 内部会读 `muted`
- 浏览器策略：首次播放可能需用户交互；howler 已处理 `unlock` 续播
- SSR：音频 API 仅在 `import.meta.client` 执行

## API 一览

| 方法 | 说明 |
|------|------|
| `initAudio()` | 懒加载 Web Audio + howler |
| `playSfx(key)` | 一次性音效（自动路由合成/文件） |
| `playSfxLoop('lotterySpin')` | 滚轮循环底噪 + tick 调度 |
| `stopSfx('lotterySpin', fadeMs?)` | 停止循环 |
| `playBgm('adventure', fadeMs?)` | 播放 BGM（同 key 已在播则跳过） |
| `stopBgm(fadeMs?)` | 淡出停止当前 BGM |
| `toggleMute()` / `muted` / `bgmVolume` / `sfxVolume` | 用户偏好（持久化） |

## 音效键名

### 合成音效（`RpgSynthSfxKey`）

| 键 | 典型场景 |
|----|----------|
| `uiClick` | 通用按钮、充值弹窗、点赞收藏 |
| `tabSwitch` | RPG 子 Tab、背包类型、排行榜维度 |
| `lotteryCharge` / `lotterySpin` / `lotteryTick` | 抽奖蓄力 / 滚轮循环 / 落格 |
| `lotteryRevealCommon` / `Rare` / `Epic` | 抽奖揭晓（合成档） |
| `levelUp` / `achievement` / `masterpiece` | 全屏弹窗 watch `visible` |
| `petHatched` | `RpgPetHatchAnimation` watch reveal 阶段 |
| `itemGranted`（史诗/传说，非 lottery） | `RpgItemRevealAnimation` watch `visible` |
| `rankChange` | `RpgRankChangeAnimation` watch `visible` |
| `socialCheer` / `Flower` / `Egg` / `Tip` | 发送方页面；收方见弹窗 |
| `signIn` | 签到 API 成功（与 WS `levelUp` 独立） |
| `questReward` | WS `questReward`；`RpgQuestRewardAnimation` reveal 阶段 |
| `contentPost` | 评论/留言发表成功 |
| `equip` / `unequip` | 穿戴/卸下 |
| `buffActivate` / `buffDeactivate` | Buff WS 脉冲；冒险页手动开关 Buff |
| `articleLevelUp` | WS `articleLevelUp`；`RpgArticleLevelUpBadge` |
| `petDeploy` / `Rest` / `Hatch` / `Buy` / `Rename` | 宠物操作（孵化音在 WS） |
| `guildCreate` / `Join` / `Leave` | 公会操作 |
| `rankUp` | WS `rankChange`；`RpgRankChangeAnimation` |
| `questComplete` | WS `questComplete`；`RpgQuestCompleteBadge` |
| `shieldBlock` | WS `shieldUsed`；`RpgScreenPulseFx` |
| `lifeDamage` / `lifeRecover` | WS `lifeChange`；`RpgScreenPulseFx` |
| `currencyGain` | WS `currencyChange`（delta ≥ 50）；`RpgCurrencyGainFx` |
| `activityStart` | WS `activityUpdate`（start）；`RpgActivityStartBanner` |
| `banPunish` | WS `banStatus`（banned）；`RpgBanPunishAnimation` |
| `buffActivate` / `buffDeactivate` | WS Buff 脉冲；冒险页手动开关 |
| `articleLevelUp` | WS；`RpgArticleLevelUpBadge` |

### 文件音效（`RpgFileSfxKey`）

| 键 | 文件 |
|----|------|
| `lotteryRevealLegendary` | `sfx-lottery-reveal-legendary.wav` |

### BGM（`RpgBgmKey`）

| 键 | 文件 | 使用页 |
|----|------|--------|
| `adventure` | `bgm-adventure.wav` | `/rpg` |

Helper：

- `lotteryRevealSfxKey(rarity)` — 奖池 `rarity` 英文 code
- `itemGrantedSfxKey(rarityLabel?)` — WS 物品中文稀有度标签

## WS 与页面：避免重复播音

原则：**同一用户感知事件只播一次**。WS 推送 + 全屏动画已覆盖的，页面 API 成功回调不要再 `playSfx`。

| 来源 | 播音位置 |
|------|----------|
| `levelUp` | `LevelUpAnimation.vue` |
| `achievementComplete` | `AchievementAnimation.vue` |
| `masterpiece` | `RpgMasterpieceAnimation.vue` |
| `socialReceived` / `tipReceived`（收方） | `RpgSocialFeedbackAnimation.vue` |
| `petHatched` | `RpgPetHatchAnimation.vue` |
| `itemGranted`（史诗/传说，非 lottery） | `RpgItemRevealAnimation.vue` |
| `rankChange` | `RpgRankChangeAnimation.vue` |
| `questReward` | `RpgQuestRewardAnimation.vue` |
| `questComplete` | `RpgQuestCompleteBadge.vue` |
| `lifeChange` / `shieldUsed` / `buffGranted` / `buffExpired` | `RpgScreenPulseFx.vue` |
| `articleLevelUp` | `RpgArticleLevelUpBadge.vue` |
| `currencyChange`（delta ≥ 50） | `RpgCurrencyGainFx.vue` |
| `activityUpdate`（start） | `RpgActivityStartBanner.vue` |
| `banStatus`（banned） | `RpgBanPunishAnimation.vue` |
| `buffGranted` / `itemGranted`（普通/稀有） | `use-rpg-realtime-handlers.ts` |
| 发送社交、Tab、equip、签到、评论、登录/注册/发文/友链等 | 各页面/组件 handler |

故意无音：`expGain`（Toast 防抖）、`guildEvent`（全员广播）、删除/失败操作。

## 新增合成音效（步骤）

1. **`constants/rpg-audio.ts`**  
   - 扩展 `RpgSynthSfxKey`  
   - 在 `RPG_SYNTH_SFX` 增加 `{ volume: 0.xx }`

2. **`utils/rpg-audio-synth.ts`**  
   - 实现 `function playMyAction(ctx, dest, vol)`  
   - 注册到 `SYNTH_PLAYERS`

3. **接入**  
   - 在操作 **成功** 后：`void playSfx('myAction')`  
   - 组件文件头注明「发送方音 / WS 已有音勿重复」

4. **文档**  
   - 更新本文「音效键名」表  
   - 复杂流程补一行接入说明

5. **注释**  
   - 符合 `home-09-commenting-hard-requirement.mdc`

## 新增文件音效或 BGM

1. 将 wav（建议再备 webm/mp3）放入 `public/audio/rpg/`
2. 更新 `RPG_FILE_SFX` 或 `RPG_BGM` 的 `src` 数组
3. 更新 `public/audio/rpg/README.md`
4. 占位可运行：`node scripts/generate-rpg-audio.mjs`

仅 **2 个** wav 为运行时必需；其余短音一律合成，勿批量加 sfx wav。

## 抽奖音频时序

`DrawOverlay.vue` 按 `phase` 驱动：

| phase | 音频 |
|-------|------|
| `charging` | `lotteryCharge` |
| `spinning` | `playSfxLoop('lotterySpin')`；`Reel` 落格 `lotteryTick` |
| 离开 spinning | `stopSfx('lotterySpin')` |
| `reveal` / `summary` | `lotteryRevealSfxKey(...)` |

关闭 overlay 时立即停止循环/蓄力音。

## 开发调试

| 入口 | 用途 |
|------|------|
| `/rpg` + dev | `RpgDevEventPanel` — 22 种 WS 事件挡板、充值弹窗 |
| `/rpg` + dev | `RpgLotteryDrawMockBar` — 抽奖后延迟注入弹窗测层叠 |
| `/tool/test` | 同上 WS 挡板（需登录） |
| `RpgAudioControl` | 静音/音量 |

挡板实现：`utils/rpg-dev-mock.ts` → `dispatchLocalEvent` 走真 WS 监听链。

## 变更自检

- [ ] 是否与 WS / Animation 重复播音？
- [ ] 新 key 是否在三处注册（constants、synth、SYNTH_PLAYERS）？
- [ ] `home-17-rpg-audio.mdc` 规则是否仍准确？
- [ ] README RPG 特性与本文是否已更新？
