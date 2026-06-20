/**
 * 生成 RPG 文件类音频占位 WAV（混合方案下仅需 2 个）
 * - bgm-adventure.wav
 * - sfx-lottery-reveal-legendary.wav
 * 其余音效由 utils/rpg-audio-synth.ts Web Audio 实时合成
 * 运行：node scripts/generate-rpg-audio.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../public/audio/rpg');
const SR = 44100;

// —— 基础工具 ——

/** 将 Float32 采样写入 16-bit PCM WAV 文件 */
function writeWav(filePath, samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SR, 24);
  buffer.writeUInt32LE(SR * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + i * 2);
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}

/** ADSR 包络：返回当前采样点的增益系数 */
function adsr(i, len, a = 0.005, d = 0.08, s = 0.6, r = 0.1) {
  const A = Math.floor(SR * a);
  const D = Math.floor(SR * d);
  const R = Math.floor(SR * r);
  const sustainStart = A + D;
  const sustainEnd = len - R;
  if (i < A) return i / A;
  if (i < sustainStart) return 1 - (1 - s) * ((i - A) / D);
  if (i < sustainEnd) return s;
  if (i < len) return s * ((len - i) / R);
  return 0;
}

/** 基础振荡器波形采样 */
function osc(freq, t, wave = 'sine') {
  const ph = 2 * Math.PI * freq * t;
  if (wave === 'triangle') return (2 / Math.PI) * Math.asin(Math.sin(ph));
  if (wave === 'square') return Math.sign(Math.sin(ph)) * 0.6;
  if (wave === 'saw') return 2 * (freq * t - Math.floor(freq * t + 0.5));
  return Math.sin(ph);
}

/** 分配指定秒数的空 buffer */
function buf(sec) {
  return new Float32Array(Math.floor(sec * SR));
}

/** 多轨叠加并归一化峰值 */
function mix(...layers) {
  const len = Math.max(...layers.map(l => l.length));
  const out = new Float32Array(len);
  for (const layer of layers) {
    for (let i = 0; i < layer.length; i++) out[i] += layer[i];
  }
  return normalize(out, 0.92);
}

/** 按峰值缩放，避免 WAV 削波 */
function normalize(samples, peak = 0.95) {
  const out = new Float32Array(samples.length);
  let max = 0;
  for (const s of samples) max = Math.max(max, Math.abs(s));
  if (max < 1e-6) return samples;
  const g = peak / max;
  for (let i = 0; i < samples.length; i++) out[i] = samples[i] * g;
  return out;
}

/** 静音段 buffer */
function silence(sec) {
  return buf(sec);
}

/** 单音写入 buffer */
function place(out, startSec, genFn) {
  const start = Math.floor(startSec * SR);
  const part = genFn();
  for (let i = 0; i < part.length && start + i < out.length; i++) {
    out[start + i] += part[i];
  }
}

/** 单音采样块（带 ADSR） */
function note(freq, dur, amp = 0.3, wave = 'sine', env = {}) {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const v = osc(freq, t, wave);
    const harm = wave === 'sine' ? v : v + osc(freq * 2, t, 'sine') * 0.15;
    out[i] = harm * amp * adsr(i, len, env.a, env.d, env.s, env.r);
  }
  return out;
}

/** 琶音：多音按步进叠加 */
function arp(freqs, stepDur, amp = 0.28, wave = 'triangle') {
  return mix(
    ...freqs.map((f, i) => {
      const b = buf(stepDur * freqs.length);
      place(b, i * stepDur, () => note(f, stepDur * 1.1, amp, wave, { a: 0.002, d: 0.05, s: 0.2, r: 0.04 }));
      return b;
    }),
  );
}

/** 有色噪声脉冲 */
function noise(len, amp = 0.2, color = 1) {
  const out = new Float32Array(len);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = last * (1 - color) + white * color;
    out[i] = last * amp * adsr(i, len, 0.001, 0.05, 0.4, 0.08);
  }
  return out;
}

/** 高频 coin ping 采样 */
function coinPing(pitch = 1800, dur = 0.12) {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const ping = Math.sin(2 * Math.PI * pitch * t) * Math.exp(-t * 35);
    const ping2 = Math.sin(2 * Math.PI * pitch * 2.3 * t) * Math.exp(-t * 50) * 0.35;
    out[i] = (ping + ping2) * 0.45 * adsr(i, len, 0.001, 0.02, 0.1, 0.06);
  }
  return out;
}

/** 在 buffer 指定时刻放置 coin ping */
function coinClink(startSec, pitch = 1800) {
  const b = buf(startSec + 0.15);
  place(b, startSec, () => coinPing(pitch));
  return b;
}

/** 随机高频闪烁点缀 */
function sparkle(startSec, dur = 0.5, density = 12) {
  const b = buf(dur + 0.1);
  for (let k = 0; k < density; k++) {
    const t0 = startSec + (k / density) * dur;
    const f = 1200 + Math.random() * 2400;
    place(b, t0, () => note(f, 0.04 + Math.random() * 0.03, 0.08 + Math.random() * 0.06, 'sine', { a: 0.001, d: 0.02, s: 0, r: 0.02 }));
  }
  return b;
}

/** kick / snare 鼓点写入 buffer */
function drumHit(startSec, type = 'kick') {
  const b = buf(0.35);
  place(b, startSec, () => {
    const len = Math.floor(0.25 * SR);
    const out = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      const t = i / SR;
      if (type === 'kick') {
        const f = 120 * Math.exp(-t * 18);
        out[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 10) * 0.55;
      }
      else {
        out[i] = (Math.random() * 2 - 1) * Math.exp(-t * 22) * 0.35;
      }
    }
    return out;
  });
  return b;
}

// —— RPG 场景音效 ——

/** 冒险营地 BGM：D Dorian 竖琴琶音 + 长笛主旋律，可无缝循环 */
function bgmAdventure() {
  const dur = 20;
  const out = buf(dur);
  // 竖琴分解和弦 (Am → G → F → Em 感)
  const harpSeq = [
    [293.66, 349.23, 440], // Dm
    [261.63, 329.63, 392], // C
    [246.94, 293.66, 369.99], // Bm
    [220, 261.63, 329.63], // Am
  ];
  const step = dur / 16;
  for (let bar = 0; bar < 16; bar++) {
    const chord = harpSeq[Math.floor(bar / 4) % 4];
    for (let n = 0; n < 3; n++) {
      place(out, bar * step + n * (step / 4), () =>
        note(chord[n], step / 3.5, 0.14, 'triangle', { a: 0.002, d: 0.12, s: 0, r: 0.08 }),
      );
    }
  }
  // 主旋律（简单 RPG 城镇风）
  const melody = [587.33, 659.25, 587.33, 523.25, 493.88, 523.25, 587.33, 659.25];
  melody.forEach((f, i) => {
    place(out, 1.2 + i * 0.55, () =>
      note(f, 0.42, 0.1, 'sine', { a: 0.01, d: 0.08, s: 0.5, r: 0.12 }),
    );
  });
  // 低音铺底
  [146.83, 130.81, 123.47, 110].forEach((f, i) => {
    place(out, i * 5, () => note(f, 4.8, 0.07, 'sine', { a: 0.2, d: 0.3, s: 0.6, r: 0.5 }));
  });
  // 淡入淡出便于循环
  for (let i = 0; i < out.length; i++) {
    const t = i / out.length;
    const fade = t < 0.03 ? t / 0.03 : t > 0.97 ? (1 - t) / 0.03 : 1;
    out[i] *= fade;
  }
  return normalize(out);
}

/** JRPG 菜单确认 */
function sfxUiClick() {
  return mix(
    note(784, 0.05, 0.22, 'square', { a: 0.001, d: 0.02, s: 0, r: 0.02 }),
    note(523.25, 0.04, 0.12, 'triangle', { a: 0.001, d: 0.015, s: 0, r: 0.015 }),
  );
}

/** 宝箱蓄力：低频隆隆 + 魔法粒子汇聚 + 铰链吱呀 */
function sfxLotteryCharge() {
  const out = buf(1.4);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const rumble = Math.sin(2 * Math.PI * (55 + t * 30) * t) * (0.08 + t * 0.12);
    const creak = (Math.random() * 2 - 1) * 0.04 * (t > 0.3 && t < 0.9 ? 1 : 0);
    out[i] = (rumble + creak) * Math.min(1, t * 2);
  }
  return mix(out, sparkle(0.25, 1.0, 18));
}

/** 宝箱滚轮：加速棘轮 + 木质摩擦 */
function sfxLotterySpin() {
  const dur = 2.6;
  const out = buf(dur);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const speed = 6 + t * 14;
    const tick = Math.sin(2 * Math.PI * speed * t) > 0.85 ? 1 : 0;
    const tickAmp = 0.06 + Math.min(0.08, t * 0.04);
    const wood = (Math.random() * 2 - 1) * 0.025;
    const env = adsr(i, out.length, 0.02, 0.1, 0.8, 0.08);
    out[i] = (tick * tickAmp + wood) * env;
  }
  return out;
}

/** 滚轮落位：金属卡扣 + 短共鸣 */
function sfxLotteryTick() {
  return mix(
    note(180, 0.06, 0.35, 'square', { a: 0.001, d: 0.02, s: 0, r: 0.03 }),
    note(880, 0.08, 0.18, 'sine', { a: 0.002, d: 0.04, s: 0.1, r: 0.04 }),
    noise(Math.floor(0.04 * SR), 0.15, 0.3),
  );
}

/** 普通（白）：拾取小道具 */
function sfxLotteryRevealCommon() {
  return mix(
    note(659.25, 0.1, 0.25, 'triangle', { a: 0.002, d: 0.04, s: 0, r: 0.05 }),
    coinClink(0.05, 1400),
  );
}

/** 稀有（蓝）：装备入手双音 */
function sfxLotteryRevealRare() {
  return mix(
    arp([523.25, 659.25, 783.99], 0.09, 0.22, 'triangle'),
    sparkle(0.15, 0.25, 6),
  );
}

/** 史诗（紫）：短 fanfare + 鼓点 */
function sfxLotteryRevealEpic() {
  const out = buf(0.9);
  const notes = [392, 523.25, 659.25, 783.99];
  notes.forEach((f, i) => {
    place(out, i * 0.1, () => note(f, 0.22, 0.24, 'saw', { a: 0.005, d: 0.06, s: 0.4, r: 0.1 }));
  });
  return mix(out, drumHit(0, 'kick'), drumHit(0.2, 'snare'), sparkle(0.3, 0.4, 10));
}

/** 传说（金）：完整胜利 fanfare */
function sfxLotteryRevealLegendary() {
  const out = buf(1.4);
  const fanfare = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.51];
  fanfare.forEach((f, i) => {
    place(out, i * 0.11, () => note(f, 0.28, 0.26, 'saw', { a: 0.005, d: 0.05, s: 0.5, r: 0.12 }));
    if (i % 2 === 0) place(out, i * 0.11, () => drumHit(0, i === 0 ? 'kick' : 'snare'));
  });
  return mix(out, sparkle(0.5, 0.7, 22));
}

/** 升级：经典 ascending EXP jingle */
function sfxLevelUp() {
  const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];
  const out = buf(1.1);
  scale.forEach((f, i) => {
    place(out, i * 0.07, () => note(f, 0.14, 0.26, 'square', { a: 0.002, d: 0.03, s: 0.3, r: 0.06 }));
  });
  return mix(out, sparkle(0.45, 0.5, 16), drumHit(0.55, 'kick'));
}

/** 成就：号角 + 钟声 */
function sfxAchievement() {
  const out = buf(1.0);
  [392, 523.25, 659.25].forEach((f, i) => {
    place(out, i * 0.15, () => note(f, 0.35, 0.22, 'saw', { a: 0.02, d: 0.08, s: 0.5, r: 0.15 }));
  });
  place(out, 0.35, () => note(1046.5, 0.6, 0.2, 'sine', { a: 0.01, d: 0.1, s: 0.4, r: 0.3 }));
  return mix(out, sparkle(0.2, 0.6, 12));
}

/** 神作晋升：圣光展开 + 和弦升华 */
function sfxMasterpiece() {
  const out = buf(1.6);
  place(out, 0, () => {
    const len = Math.floor(1.2 * SR);
    const part = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      const t = i / SR;
      const swell = adsr(i, len, 0.3, 0.2, 0.7, 0.4);
      const choir = [523.25, 659.25, 783.99, 987.77].reduce((s, f) => s + Math.sin(2 * Math.PI * f * t), 0) / 4;
      part[i] = choir * 0.18 * swell;
    }
    return part;
  });
  place(out, 0.6, () => arp([1046.5, 1318.51, 1567.98, 2093], 0.08, 0.2, 'sine'));
  return mix(out, sparkle(0.1, 1.0, 28));
}

/** 加油：治疗术风铃 */
function sfxSocialCheer() {
  return mix(
    arp([784, 988, 1174.66, 1318.51], 0.07, 0.18, 'sine'),
    note(523.25, 0.3, 0.12, 'sine', { a: 0.05, d: 0.1, s: 0.3, r: 0.15 }),
  );
}

/** 鲜花：魔法Bloom */
function sfxSocialFlower() {
  const out = buf(0.7);
  [659.25, 830.61, 987.77, 1174.66].forEach((f, i) => {
    place(out, i * 0.06, () => note(f, 0.2, 0.16, 'triangle', { a: 0.005, d: 0.08, s: 0.2, r: 0.1 }));
  });
  return mix(out, sparkle(0.1, 0.45, 8));
}

/** 鸡蛋：啪叽命中 */
function sfxSocialEgg() {
  const out = buf(0.35);
  place(out, 0, () => noise(Math.floor(0.08 * SR), 0.45, 0.5));
  place(out, 0.02, () => note(110, 0.12, 0.35, 'square', { a: 0.001, d: 0.04, s: 0, r: 0.06 }));
  place(out, 0.06, () => note(80, 0.15, 0.2, 'saw', { a: 0.002, d: 0.05, s: 0, r: 0.08 }));
  return out;
}

/** 打赏：金币入账 */
function sfxSocialTip() {
  return mix(
    coinClink(0, 1800),
    coinClink(0.08, 2100),
    coinClink(0.16, 2400),
    note(987.77, 0.25, 0.15, 'triangle', { a: 0.01, d: 0.08, s: 0.2, r: 0.12 }),
  );
}

/** 签到：日历盖章 + 小宝箱弹开 */
function sfxSignIn() {
  return mix(
    note(220, 0.08, 0.3, 'square', { a: 0.001, d: 0.02, s: 0, r: 0.04 }),
    arp([523.25, 659.25, 783.99, 1046.5], 0.06, 0.22, 'triangle'),
    coinClink(0.22, 1500),
    sparkle(0.18, 0.2, 5),
  );
}

/** 任务奖励：卷轴交付 + EXP 叮当 */
function sfxQuestReward() {
  const out = buf(0.75);
  place(out, 0, () => noise(Math.floor(0.12 * SR), 0.12, 0.8)); //  parchment swipe
  return mix(
    out,
    arp([659.25, 784, 880, 1046.5], 0.08, 0.24, 'square'),
    coinClink(0.35, 1700),
    note(523.25, 0.2, 0.1, 'sine', { a: 0.02, d: 0.08, s: 0.3, r: 0.1 }),
  );
}

const sounds = {
  'bgm-adventure': bgmAdventure(),
  'sfx-lottery-reveal-legendary': sfxLotteryRevealLegendary(),
};

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const [name, samples] of Object.entries(sounds)) {
  writeWav(path.join(OUT_DIR, `${name}.wav`), samples);
  console.log(`wrote ${name}.wav`);
}
console.log(`\nGenerated ${Object.keys(sounds).length} file-audio wav → ${OUT_DIR}`);
