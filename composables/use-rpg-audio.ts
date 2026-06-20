/**
 * RPG 音频管理 — 混合方案
 * - BGM、传说 fanfare：howler.js 播放文件
 * - 其余 SFX：Web Audio API 实时合成
 * - 音量/静音写入 localStorage，全站单例共享
 */
import { computed, ref, watch } from 'vue';
import type { Howl } from 'howler';
import {
  RPG_AUDIO_STORAGE_KEY,
  RPG_BGM,
  RPG_FILE_SFX,
  isFileSfxKey,
  isSynthSfxKey,
  type RpgBgmKey,
  type RpgFileSfxKey,
  type RpgSfxKey,
} from '~~/constants/rpg-audio';
import {
  disposeSynth,
  playSynthSfx,
  startSynthLoop,
  stopAllSynthLoops,
  stopSynthLoop,
  ensureSynthContext,
} from '~~/utils/rpg-audio-synth';

/** localStorage 持久化的音量与静音偏好 */
interface RpgAudioSettings {
  muted: boolean;
  bgmVolume: number;
  sfxVolume: number;
}

const DEFAULT_SETTINGS: RpgAudioSettings = {
  muted: false,
  bgmVolume: 0.7,
  sfxVolume: 0.85,
};

/** 从 localStorage 读取音频设置；SSR 或解析失败时回退默认值 */
function readSettings(): RpgAudioSettings {
  if (!import.meta.client) return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(RPG_AUDIO_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<RpgAudioSettings>;
    return {
      muted: !!parsed.muted,
      bgmVolume: clamp01(parsed.bgmVolume ?? DEFAULT_SETTINGS.bgmVolume),
      sfxVolume: clamp01(parsed.sfxVolume ?? DEFAULT_SETTINGS.sfxVolume),
    };
  }
  catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** 将当前设置写入 localStorage（仅客户端） */
function persistSettings(settings: RpgAudioSettings) {
  if (!import.meta.client) return;
  localStorage.setItem(RPG_AUDIO_STORAGE_KEY, JSON.stringify(settings));
}

/** 将音量限制在 [0, 1] */
function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

let howlerModule: typeof import('howler') | null = null;
const fileSfxCache = new Map<RpgFileSfxKey, Howl>();
const bgmCache = new Map<RpgBgmKey, Howl>();
let currentBgmKey: RpgBgmKey | null = null;
let currentBgmId: number | null = null;

const settings = ref<RpgAudioSettings>(readSettings());
const ready = ref(false);

/** 懒加载 howler 模块并同步全局静音状态 */
async function ensureHowler() {
  if (!import.meta.client) return null;
  if (!howlerModule) {
    howlerModule = await import('howler');
  }
  applyGlobalMute();
  return howlerModule;
}

/** 将 howler 全局 mute 与 settings.muted 对齐 */
function applyGlobalMute() {
  if (!howlerModule) return;
  howlerModule.Howler.mute(settings.value.muted);
}

/** 按 key 获取或创建文件 SFX Howl 实例（缓存复用，音量随 sfxVolume） */
function getOrCreateFileSfx(key: RpgFileSfxKey): Howl | null {
  if (!howlerModule) return null;
  const cached = fileSfxCache.get(key);
  if (cached) return cached;

  const def = RPG_FILE_SFX[key];
  const howl = new howlerModule.Howl({
    src: def.src,
    volume: (def.volume ?? 1) * settings.value.sfxVolume,
    preload: true,
    html5: false,
  });
  fileSfxCache.set(key, howl);
  return howl;
}

/** 按 key 获取或创建 BGM Howl 实例；html5 模式利于长音频流式播放 */
function getOrCreateBgm(key: RpgBgmKey): Howl | null {
  if (!howlerModule) return null;
  const cached = bgmCache.get(key);
  if (cached) return cached;

  const def = RPG_BGM[key];
  const howl = new howlerModule.Howl({
    src: def.src,
    loop: def.loop ?? true,
    volume: 0,
    preload: true,
    html5: true,
    onplayerror: () => {
      // 移动端首次播放可能被锁，unlock 后自动续播
      howl.once('unlock', () => {
        if (currentBgmKey === key) howl.play();
      });
    },
  });
  bgmCache.set(key, howl);
  return howl;
}

/** 用户调节音量后，刷新已缓存 howler 实例的实际输出音量 */
function refreshVolumes() {
  for (const [key, howl] of fileSfxCache) {
    howl.volume((RPG_FILE_SFX[key].volume ?? 1) * settings.value.sfxVolume);
  }
  if (currentBgmKey && currentBgmId != null) {
    const howl = bgmCache.get(currentBgmKey);
    if (howl) {
      howl.volume((RPG_BGM[currentBgmKey].volume ?? 1) * settings.value.bgmVolume, currentBgmId);
    }
  }
}

/** 初始化 Web Audio 合成器与 howler，完成后置 ready */
async function initAudioEngines() {
  await ensureSynthContext();
  await ensureHowler();
  ready.value = true;
}

/**
 * 全站共享 RPG 音频状态（单例）
 * 无副作用的读操作；play/stop 类方法会操作 Web Audio / howler，静音时自动跳过播放
 */
export function useRpgAudio() {
  /** 全局静音开关，写入 localStorage 并同步 howler.mute */
  const muted = computed({
    get: () => settings.value.muted,
    set: (v: boolean) => {
      settings.value = { ...settings.value, muted: v };
      persistSettings(settings.value);
      applyGlobalMute();
    },
  });

  /** BGM 主音量倍率 [0, 1] */
  const bgmVolume = computed({
    get: () => settings.value.bgmVolume,
    set: (v: number) => {
      settings.value = { ...settings.value, bgmVolume: clamp01(v) };
      persistSettings(settings.value);
      refreshVolumes();
    },
  });

  /** SFX 主音量倍率 [0, 1] */
  const sfxVolume = computed({
    get: () => settings.value.sfxVolume,
    set: (v: number) => {
      settings.value = { ...settings.value, sfxVolume: clamp01(v) };
      persistSettings(settings.value);
      refreshVolumes();
    },
  });

  /** 页面进入时调用，懒加载音频引擎；可重复调用 */
  async function initAudio() {
    await initAudioEngines();
  }

  /** 播放 howler 文件音效（传说揭晓等）；每次 play 前先 stop 避免叠音 */
  async function playFileSfx(key: RpgFileSfxKey) {
    await ensureHowler();
    const howl = getOrCreateFileSfx(key);
    if (!howl) return;
    howl.stop();
    howl.play();
  }

  /** 播放音效（自动路由合成 / 文件）；静音或 lotterySpin 循环键不走此入口 */
  async function playSfx(key: RpgSfxKey) {
    if (settings.value.muted) return;
    if (isFileSfxKey(key)) {
      await playFileSfx(key);
      return;
    }
    if (isSynthSfxKey(key) && key !== 'lotterySpin') {
      await playSynthSfx(key, settings.value.sfxVolume);
    }
  }

  /** 播放循环音效（目前仅 lotterySpin → Web Audio） */
  async function playSfxLoop(key: RpgSfxKey) {
    if (settings.value.muted) return;
    if (key === 'lotterySpin') {
      await startSynthLoop('lotterySpin', settings.value.sfxVolume);
    }
  }

  /** 停止指定循环音效，默认带短淡出 */
  async function stopSfx(key: RpgSfxKey, fadeMs = 120) {
    if (key === 'lotterySpin') {
      stopSynthLoop('lotterySpin', fadeMs);
    }
  }

  /**
   * 播放 BGM，支持淡入；同一 key 已在播则跳过
   * 切换曲目时先淡出当前 BGM
   */
  async function playBgm(key: RpgBgmKey, fadeMs = 800) {
    if (settings.value.muted) return;
    await ensureHowler();
    if (currentBgmKey === key) {
      const existing = bgmCache.get(key);
      if (existing?.playing()) return;
    }

    if (currentBgmKey && currentBgmKey !== key) {
      await stopBgm(400);
    }

    const howl = getOrCreateBgm(key);
    if (!howl) return;

    const targetVol = (RPG_BGM[key].volume ?? 1) * settings.value.bgmVolume;
    howl.stop();
    howl.volume(0);
    const id = howl.play();
    currentBgmKey = key;
    currentBgmId = id;
    howl.fade(0, targetVol, fadeMs, id);
  }

  /** 淡出并停止当前 BGM；fadeMs=0 时立即 stop */
  async function stopBgm(fadeMs = 600) {
    if (!currentBgmKey) return;
    await ensureHowler();
    const howl = bgmCache.get(currentBgmKey);
    if (!howl) return;

    if (fadeMs > 0 && howl.playing()) {
      const id = currentBgmId ?? undefined;
      const from = howl.volume(id);
      howl.fade(from, 0, fadeMs, id);
      howl.once(
        'fade',
        () => {
          howl.stop(id);
          currentBgmKey = null;
          currentBgmId = null;
        },
        id,
      );
    }
    else {
      howl.stop();
      currentBgmKey = null;
      currentBgmId = null;
    }
  }

  /** 切换静音状态 */
  function toggleMute() {
    muted.value = !muted.value;
  }

  /** 卸载全部音频资源（合成器、howler 缓存）；页面卸载或登出时可选调用 */
  function unloadAll() {
    stopAllSynthLoops(0);
    disposeSynth();
    for (const howl of fileSfxCache.values()) howl.unload();
    for (const howl of bgmCache.values()) howl.unload();
    fileSfxCache.clear();
    bgmCache.clear();
    currentBgmKey = null;
    currentBgmId = null;
    howlerModule?.Howler.unload();
    howlerModule = null;
    ready.value = false;
  }

  // 静音时立即停止 BGM 与循环 SFX，避免用户关音后仍残留播放
  watch(
    () => settings.value.muted,
    (isMuted) => {
      if (isMuted) {
        void stopBgm(200);
        stopAllSynthLoops(0);
      }
    },
  );

  return {
    ready,
    muted,
    bgmVolume,
    sfxVolume,
    initAudio,
    playSfx,
    playSfxLoop,
    stopSfx,
    playBgm,
    stopBgm,
    toggleMute,
    unloadAll,
  };
}
