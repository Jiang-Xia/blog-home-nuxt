/**
 * RPG 短音效 — Web Audio API 实时合成（无音频文件）
 * - 与 howler 文件播放（BGM、传说 fanfare）配合，由 useRpgAudio 路由
 * - 音量倍率来自 constants/rpg-audio RPG_SYNTH_SFX，再乘用户 sfxVolume
 */
import type { RpgSynthSfxKey } from '~~/constants/rpg-audio';
import { RPG_SYNTH_SFX } from '~~/constants/rpg-audio';

/** 振荡器波形类型 */
type OscWave = 'sine' | 'square' | 'sawtooth' | 'triangle';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

/** lotterySpin 循环：噪声底 + 定时 tick，由 stopSynthLoop 统一清理 */
let spinActive = false;
let spinStartMs = 0;
let spinTimer: ReturnType<typeof setTimeout> | null = null;
let spinNoise: AudioBufferSourceNode | null = null;
let spinNoiseGain: GainNode | null = null;

/** 将音量限制在 [0, 1] */
function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

/** 懒创建 AudioContext 与 masterGain，并 resume 被挂起的上下文 */
export async function ensureSynthContext(): Promise<AudioContext | null> {
  if (!import.meta.client) return null;
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  return audioCtx;
}

/** 全合成音效共用的主增益节点 */
function master(): GainNode | null {
  return masterGain;
}

/** 调度时间：ctx.currentTime + 偏移秒数 */
function t0(ctx: AudioContext, offset = 0) {
  return ctx.currentTime + offset;
}

/** 单音：指数包络起落，避免硬切 */
function tone(
  ctx: AudioContext,
  dest: GainNode,
  freq: number,
  dur: number,
  amp: number,
  wave: OscWave = 'sine',
  start = ctx.currentTime,
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = wave;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(Math.max(amp, 0.0001), start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

/** 快速琶音：按步进时间依次触发 tone */
function arp(
  ctx: AudioContext,
  dest: GainNode,
  freqs: number[],
  step: number,
  amp: number,
  wave: OscWave,
  start = ctx.currentTime,
) {
  freqs.forEach((f, i) => tone(ctx, dest, f, step * 1.05, amp, wave, start + i * step));
}

/** 白噪声短脉冲，尾部衰减 */
function noiseBurst(
  ctx: AudioContext,
  dest: GainNode,
  dur: number,
  amp: number,
  start = ctx.currentTime,
) {
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    d[i] = (Math.random() * 2 - 1) * amp * (1 - i / len);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(amp, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(g).connect(dest);
  src.start(start);
  src.stop(start + dur + 0.02);
}

/** 硬币/奖励短促高频 ping */
function coinPing(
  ctx: AudioContext,
  dest: GainNode,
  pitch: number,
  amp: number,
  start = ctx.currentTime,
) {
  const dur = 0.12;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(pitch, start);
  g.gain.setValueAtTime(amp, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

/** 随机高频闪烁音，用于庆祝/揭晓点缀 */
function sparkle(
  ctx: AudioContext,
  dest: GainNode,
  start: number,
  span: number,
  count: number,
  amp: number,
) {
  for (let i = 0; i < count; i++) {
    const st = start + (i / count) * span;
    const f = 1200 + Math.random() * 2000;
    tone(ctx, dest, f, 0.04 + Math.random() * 0.03, amp * (0.6 + Math.random() * 0.4), 'sine', st);
  }
}

/** 简易鼓点：kick 为下滑正弦，snare 为噪声 */
function drumHit(
  ctx: AudioContext,
  dest: GainNode,
  kind: 'kick' | 'snare',
  amp: number,
  start = ctx.currentTime,
) {
  if (kind === 'kick') {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, start);
    osc.frequency.exponentialRampToValueAtTime(50, start + 0.15);
    g.gain.setValueAtTime(amp, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
    osc.connect(g).connect(dest);
    osc.start(start);
    osc.stop(start + 0.25);
  }
  else {
    noiseBurst(ctx, dest, 0.12, amp * 0.7, start);
  }
}

/** UI 轻点击 */
function playUiClick(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  tone(ctx, dest, 784, 0.05, vol * 0.22, 'square', t);
  tone(ctx, dest, 523.25, 0.04, vol * 0.12, 'triangle', t);
}

/** 抽奖蓄力：低频爬升 + 星屑 */
function playLotteryCharge(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(55, t);
  osc.frequency.linearRampToValueAtTime(90, t + 1.2);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol * 0.22, t + 0.25);
  g.gain.linearRampToValueAtTime(0.0001, t + 1.35);
  osc.connect(g).connect(dest);
  osc.start(t);
  osc.stop(t + 1.4);
  sparkle(ctx, dest, t + 0.25, 1.0, 16, vol * 0.12);
}

/** 滚轮单格 tick；start 可注入以与循环调度对齐 */
function playLotteryTick(ctx: AudioContext, dest: GainNode, vol: number, start?: number) {
  const t = start ?? t0(ctx);
  tone(ctx, dest, 180, 0.06, vol * 0.35, 'square', t);
  tone(ctx, dest, 880, 0.08, vol * 0.18, 'sine', t);
  noiseBurst(ctx, dest, 0.04, vol * 0.12, t);
}

/** 抽奖揭晓：普通品质 */
function playLotteryRevealCommon(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  tone(ctx, dest, 659.25, 0.1, vol * 0.25, 'triangle', t);
  coinPing(ctx, dest, 1400, vol * 0.3, t + 0.05);
}

/** 抽奖揭晓：稀有品质 */
function playLotteryRevealRare(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  arp(ctx, dest, [523.25, 659.25, 783.99], 0.09, vol * 0.22, 'triangle', t);
  sparkle(ctx, dest, t + 0.15, 0.25, 6, vol * 0.1);
}

/** 抽奖揭晓：史诗品质（传说走 howler 文件） */
function playLotteryRevealEpic(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  [392, 523.25, 659.25, 783.99].forEach((f, i) => {
    tone(ctx, dest, f, 0.22, vol * 0.24, 'sawtooth', t + i * 0.1);
  });
  drumHit(ctx, dest, 'kick', vol * 0.35, t);
  drumHit(ctx, dest, 'snare', vol * 0.25, t + 0.2);
  sparkle(ctx, dest, t + 0.3, 0.4, 10, vol * 0.1);
}

/** 升级：上行音阶 + 鼓点庆祝 */
function playLevelUp(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];
  scale.forEach((f, i) => tone(ctx, dest, f, 0.14, vol * 0.26, 'square', t + i * 0.07));
  sparkle(ctx, dest, t + 0.45, 0.5, 14, vol * 0.1);
  drumHit(ctx, dest, 'kick', vol * 0.3, t + 0.55);
}

/** 成就达成 */
function playAchievement(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  [392, 523.25, 659.25].forEach((f, i) =>
    tone(ctx, dest, f, 0.35, vol * 0.22, 'sawtooth', t + i * 0.15),
  );
  tone(ctx, dest, 1046.5, 0.55, vol * 0.2, 'sine', t + 0.35);
  sparkle(ctx, dest, t + 0.2, 0.6, 10, vol * 0.08);
}

/** 神作认定 / masterpiece 动画 */
function playMasterpiece(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  [523.25, 659.25, 783.99, 987.77].forEach((f) => {
    tone(ctx, dest, f, 1.1, vol * 0.06, 'sine', t);
  });
  arp(ctx, dest, [1046.5, 1318.51, 1567.98, 2093], 0.08, vol * 0.18, 'sine', t + 0.55);
  sparkle(ctx, dest, t + 0.1, 1.0, 22, vol * 0.1);
}

/** 收到喝彩社交反馈 */
function playSocialCheer(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  arp(ctx, dest, [784, 988, 1174.66, 1318.51], 0.07, vol * 0.18, 'sine', t);
  tone(ctx, dest, 523.25, 0.28, vol * 0.12, 'sine', t);
}

/** 收到送花社交反馈 */
function playSocialFlower(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  [659.25, 830.61, 987.77, 1174.66].forEach((f, i) => {
    tone(ctx, dest, f, 0.2, vol * 0.16, 'triangle', t + i * 0.06);
  });
  sparkle(ctx, dest, t + 0.1, 0.45, 8, vol * 0.1);
}

/** 收到砸蛋社交反馈 */
function playSocialEgg(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  noiseBurst(ctx, dest, 0.08, vol * 0.4, t);
  tone(ctx, dest, 110, 0.12, vol * 0.35, 'square', t + 0.02);
  tone(ctx, dest, 80, 0.14, vol * 0.2, 'sawtooth', t + 0.06);
}

/** 收到打赏社交反馈 */
function playSocialTip(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  coinPing(ctx, dest, 1800, vol * 0.35, t);
  coinPing(ctx, dest, 2100, vol * 0.32, t + 0.08);
  coinPing(ctx, dest, 2400, vol * 0.3, t + 0.16);
  tone(ctx, dest, 987.77, 0.22, vol * 0.15, 'triangle', t + 0.1);
}

/** 每日签到成功（与 WS levelUp 独立） */
function playSignIn(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  tone(ctx, dest, 220, 0.08, vol * 0.3, 'square', t);
  arp(ctx, dest, [523.25, 659.25, 783.99, 1046.5], 0.06, vol * 0.22, 'triangle', t + 0.08);
  coinPing(ctx, dest, 1500, vol * 0.28, t + 0.22);
  sparkle(ctx, dest, t + 0.18, 0.2, 5, vol * 0.08);
}

/** 领取任务奖励 */
function playQuestReward(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  noiseBurst(ctx, dest, 0.1, vol * 0.1, t);
  arp(ctx, dest, [659.25, 784, 880, 1046.5], 0.08, vol * 0.24, 'square', t + 0.12);
  coinPing(ctx, dest, 1700, vol * 0.3, t + 0.35);
}

/** 评论 / 留言发表成功 */
function playContentPost(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  noiseBurst(ctx, dest, 0.06, vol * 0.08, t);
  tone(ctx, dest, 587.33, 0.08, vol * 0.2, 'triangle', t + 0.02);
  tone(ctx, dest, 784, 0.1, vol * 0.16, 'sine', t + 0.08);
}

/** RPG 子 Tab 切换 */
function playTabSwitch(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  tone(ctx, dest, 440, 0.04, vol * 0.18, 'triangle', t);
  tone(ctx, dest, 587.33, 0.05, vol * 0.22, 'triangle', t + 0.03);
}

/** 装备穿戴 */
function playEquip(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  tone(ctx, dest, 320, 0.06, vol * 0.28, 'square', t);
  arp(ctx, dest, [523.25, 659.25, 783.99], 0.06, vol * 0.2, 'triangle', t + 0.04);
  coinPing(ctx, dest, 1200, vol * 0.15, t + 0.08);
}

/** 卸下装备 */
function playUnequip(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  tone(ctx, dest, 440, 0.08, vol * 0.22, 'triangle', t);
  tone(ctx, dest, 330, 0.1, vol * 0.18, 'sine', t + 0.06);
}

/** Buff 激活 / 获得 */
function playBuffActivate(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  arp(ctx, dest, [392, 523.25, 659.25, 784], 0.06, vol * 0.2, 'sine', t);
  sparkle(ctx, dest, t + 0.15, 0.25, 6, vol * 0.08);
}

/** Buff 关闭 / 过期 */
function playBuffDeactivate(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  [784, 659.25, 523.25].forEach((f, i) => {
    tone(ctx, dest, f, 0.1, vol * 0.16, 'sine', t + i * 0.05);
  });
}

/** 宠物出战 */
function playPetDeploy(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  [392, 523.25, 659.25].forEach((f, i) => {
    tone(ctx, dest, f, 0.12, vol * 0.24, 'sawtooth', t + i * 0.07);
  });
  drumHit(ctx, dest, 'kick', vol * 0.25, t);
}

/** 宠物休息 */
function playPetRest(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  tone(ctx, dest, 523.25, 0.15, vol * 0.18, 'sine', t);
  tone(ctx, dest, 392, 0.2, vol * 0.14, 'sine', t + 0.1);
}

/** 宠物孵化（WS petHatched） */
function playPetHatch(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  noiseBurst(ctx, dest, 0.1, vol * 0.35, t);
  tone(ctx, dest, 110, 0.1, vol * 0.2, 'square', t + 0.05);
  arp(ctx, dest, [523.25, 659.25, 784, 1046.5], 0.07, vol * 0.22, 'triangle', t + 0.12);
  sparkle(ctx, dest, t + 0.2, 0.35, 10, vol * 0.1);
}

/** 购买宠物 */
function playPetBuy(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  coinPing(ctx, dest, 1600, vol * 0.32, t);
  coinPing(ctx, dest, 2000, vol * 0.28, t + 0.1);
  tone(ctx, dest, 880, 0.2, vol * 0.18, 'triangle', t + 0.08);
}

/** 宠物改名 */
function playPetRename(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  tone(ctx, dest, 660, 0.05, vol * 0.2, 'triangle', t);
  tone(ctx, dest, 880, 0.08, vol * 0.16, 'sine', t + 0.04);
}

/** 创建公会 */
function playGuildCreate(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  [392, 523.25, 659.25, 784].forEach((f, i) => {
    tone(ctx, dest, f, 0.2, vol * 0.22, 'sawtooth', t + i * 0.12);
  });
  drumHit(ctx, dest, 'kick', vol * 0.3, t);
  sparkle(ctx, dest, t + 0.3, 0.4, 8, vol * 0.08);
}

/** 加入公会 */
function playGuildJoin(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  arp(ctx, dest, [440, 554.37, 659.25, 880], 0.08, vol * 0.22, 'triangle', t);
  coinPing(ctx, dest, 1400, vol * 0.2, t + 0.28);
}

/** 离开公会 */
function playGuildLeave(ctx: AudioContext, dest: GainNode, vol: number) {
  const t = t0(ctx);
  tone(ctx, dest, 440, 0.12, vol * 0.2, 'triangle', t);
  tone(ctx, dest, 330, 0.15, vol * 0.16, 'sine', t + 0.1);
  noiseBurst(ctx, dest, 0.06, vol * 0.08, t + 0.05);
}

/** 合成 key → 播放器；lotterySpin 由循环逻辑单独处理 */
const SYNTH_PLAYERS: Record<
  Exclude<RpgSynthSfxKey, 'lotterySpin'>,
  (ctx: AudioContext, dest: GainNode, defVol: number) => void
> = {
  uiClick: playUiClick,
  lotteryCharge: playLotteryCharge,
  lotteryTick: playLotteryTick,
  lotteryRevealCommon: playLotteryRevealCommon,
  lotteryRevealRare: playLotteryRevealRare,
  lotteryRevealEpic: playLotteryRevealEpic,
  levelUp: playLevelUp,
  achievement: playAchievement,
  masterpiece: playMasterpiece,
  socialCheer: playSocialCheer,
  socialFlower: playSocialFlower,
  socialEgg: playSocialEgg,
  socialTip: playSocialTip,
  signIn: playSignIn,
  questReward: playQuestReward,
  tabSwitch: playTabSwitch,
  equip: playEquip,
  unequip: playUnequip,
  buffActivate: playBuffActivate,
  buffDeactivate: playBuffDeactivate,
  petDeploy: playPetDeploy,
  petRest: playPetRest,
  petHatch: playPetHatch,
  petBuy: playPetBuy,
  petRename: playPetRename,
  guildCreate: playGuildCreate,
  guildJoin: playGuildJoin,
  guildLeave: playGuildLeave,
  contentPost: playContentPost,
};

/** 清除滚轮 tick 的 setTimeout */
function clearSpinTimer() {
  if (spinTimer) {
    clearTimeout(spinTimer);
    spinTimer = null;
  }
}

/** 淡出并停止滚轮底噪源 */
function stopSpinNoise(fadeMs = 120) {
  if (!audioCtx || !spinNoise || !spinNoiseGain) return;
  const t = audioCtx.currentTime;
  const g = spinNoiseGain.gain;
  if (fadeMs > 0) {
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.exponentialRampToValueAtTime(0.0001, t + fadeMs / 1000);
    spinNoise.stop(t + fadeMs / 1000 + 0.05);
  }
  else {
    spinNoise.stop();
  }
  spinNoise = null;
  spinNoiseGain = null;
}

/**
 * 滚轮 tick 调度：间隔随时间缩短模拟加速
 * 由 setTimeout 驱动，stopSynthLoop 须清理 timer
 */
function scheduleSpinTick(ctx: AudioContext, dest: GainNode, vol: number) {
  if (!spinActive) return;
  const elapsed = (performance.now() - spinStartMs) / 1000;
  playLotteryTick(ctx, dest, vol * 0.45, t0(ctx));
  const delay = Math.max(45, 200 - elapsed * 45);
  spinTimer = setTimeout(() => scheduleSpinTick(ctx, dest, vol), delay);
}

/** 启动滚轮循环：低通噪声底 + scheduleSpinTick */
function startLotterySpin(ctx: AudioContext, dest: GainNode, vol: number) {
  stopSynthLoop('lotterySpin', 0);
  spinActive = true;
  spinStartMs = performance.now();

  const bufLen = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  const g = ctx.createGain();
  g.gain.value = vol * 0.1;
  src.connect(filter).connect(g).connect(dest);
  src.start();
  spinNoise = src;
  spinNoiseGain = g;

  scheduleSpinTick(ctx, dest, vol);
}

/** 播放一次性合成音效；lotterySpin 请用 startSynthLoop */
export async function playSynthSfx(key: Exclude<RpgSynthSfxKey, 'lotterySpin'>, sfxVolume: number) {
  const ctx = await ensureSynthContext();
  const dest = master();
  if (!ctx || !dest) return;

  const defVol = RPG_SYNTH_SFX[key]?.volume ?? 1;
  dest.gain.setValueAtTime(clamp01(sfxVolume), ctx.currentTime);

  const player = SYNTH_PLAYERS[key];
  if (player) player(ctx, dest, defVol);
}

/** 启动合成循环（目前仅 lotterySpin 滚轮） */
export async function startSynthLoop(key: 'lotterySpin', sfxVolume: number) {
  const ctx = await ensureSynthContext();
  const dest = master();
  if (!ctx || !dest) return;

  const defVol = RPG_SYNTH_SFX.lotterySpin.volume;
  dest.gain.setValueAtTime(clamp01(sfxVolume), ctx.currentTime);
  startLotterySpin(ctx, dest, defVol);
}

/** 停止指定合成循环，默认短淡出 */
export function stopSynthLoop(key: 'lotterySpin', fadeMs = 120) {
  if (key !== 'lotterySpin') return;
  spinActive = false;
  clearSpinTimer();
  stopSpinNoise(fadeMs);
}

/** 停止全部合成循环 */
export function stopAllSynthLoops(fadeMs = 120) {
  stopSynthLoop('lotterySpin', fadeMs);
}

/** 关闭 AudioContext 并释放合成器；页面卸载时由 useRpgAudio.unloadAll 调用 */
export function disposeSynth() {
  stopAllSynthLoops(0);
  if (audioCtx) {
    void audioCtx.close();
    audioCtx = null;
    masterGain = null;
  }
}
