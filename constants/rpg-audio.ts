/**
 * RPG 音频配置 — 混合方案
 * - BGM + 传说 fanfare：howler 播放 public/audio/rpg/ 文件
 * - 其余短音效：Web Audio API 实时合成（utils/rpg-audio-synth.ts）
 */

/** 全部音效键名 */
export type RpgSfxKey = RpgSynthSfxKey | RpgFileSfxKey;

/** Web Audio 实时合成 */
export type RpgSynthSfxKey
  = | 'uiClick'
    | 'lotteryCharge'
    | 'lotterySpin'
    | 'lotteryTick'
    | 'lotteryRevealCommon'
    | 'lotteryRevealRare'
    | 'lotteryRevealEpic'
    | 'levelUp'
    | 'achievement'
    | 'masterpiece'
    | 'socialCheer'
    | 'socialFlower'
    | 'socialEgg'
    | 'socialTip'
    | 'signIn'
    | 'questReward'
    | 'tabSwitch'
    | 'equip'
    | 'unequip'
    | 'buffActivate'
    | 'buffDeactivate'
    | 'petDeploy'
    | 'petRest'
    | 'petHatch'
    | 'petBuy'
    | 'petRename'
    | 'guildCreate'
    | 'guildJoin'
    | 'guildLeave'
    | 'contentPost'
    | 'rankUp'
    | 'questComplete'
    | 'shieldBlock'
    | 'lifeDamage'
    | 'lifeRecover'
    | 'currencyGain'
    | 'activityStart'
    | 'banPunish'
    | 'articleLevelUp';

/** howler 文件播放 */
export type RpgFileSfxKey = 'lotteryRevealLegendary';

/** 背景音乐键名 */
export type RpgBgmKey = 'adventure';

export interface RpgSoundDef {
  /** 音频文件 URL 列表（howler src） */
  src: string[];
  loop?: boolean;
  volume?: number;
}

const base = '/audio/rpg';

/** 合成音效音量系数（实际音量 = 用户 SFX 音量 × 此值） */
export const RPG_SYNTH_SFX: Record<RpgSynthSfxKey, { volume: number }> = {
  uiClick: { volume: 0.35 },
  lotteryCharge: { volume: 0.45 },
  lotterySpin: { volume: 0.3 },
  lotteryTick: { volume: 0.4 },
  lotteryRevealCommon: { volume: 0.5 },
  lotteryRevealRare: { volume: 0.55 },
  lotteryRevealEpic: { volume: 0.6 },
  levelUp: { volume: 0.6 },
  achievement: { volume: 0.55 },
  masterpiece: { volume: 0.6 },
  socialCheer: { volume: 0.45 },
  socialFlower: { volume: 0.45 },
  socialEgg: { volume: 0.4 },
  socialTip: { volume: 0.5 },
  signIn: { volume: 0.5 },
  questReward: { volume: 0.45 },
  tabSwitch: { volume: 0.28 },
  equip: { volume: 0.42 },
  unequip: { volume: 0.35 },
  buffActivate: { volume: 0.4 },
  buffDeactivate: { volume: 0.32 },
  petDeploy: { volume: 0.48 },
  petRest: { volume: 0.32 },
  petHatch: { volume: 0.5 },
  petBuy: { volume: 0.45 },
  petRename: { volume: 0.3 },
  guildCreate: { volume: 0.5 },
  guildJoin: { volume: 0.42 },
  guildLeave: { volume: 0.35 },
  contentPost: { volume: 0.38 },
  rankUp: { volume: 0.52 },
  questComplete: { volume: 0.4 },
  shieldBlock: { volume: 0.48 },
  lifeDamage: { volume: 0.42 },
  lifeRecover: { volume: 0.38 },
  currencyGain: { volume: 0.46 },
  activityStart: { volume: 0.44 },
  banPunish: { volume: 0.5 },
  articleLevelUp: { volume: 0.38 },
};

/** 文件音效（howler） */
export const RPG_FILE_SFX: Record<RpgFileSfxKey, RpgSoundDef> = {
  lotteryRevealLegendary: { src: [`${base}/sfx-lottery-reveal-legendary.wav`], volume: 0.65 },
};

/** 背景音乐（howler） */
export const RPG_BGM: Record<RpgBgmKey, RpgSoundDef> = {
  adventure: { src: [`${base}/bgm-adventure.wav`], loop: true, volume: 0.18 },
};

export const RPG_AUDIO_STORAGE_KEY = 'rpg-audio-settings';

const SYNTH_KEY_SET = new Set<string>(Object.keys(RPG_SYNTH_SFX));
const FILE_SFX_KEY_SET = new Set<string>(Object.keys(RPG_FILE_SFX));

/** 判断音效键是否走 Web Audio 合成 */
export function isSynthSfxKey(key: RpgSfxKey): key is RpgSynthSfxKey {
  return SYNTH_KEY_SET.has(key);
}

/** 判断音效键是否走 howler 文件播放 */
export function isFileSfxKey(key: RpgSfxKey): key is RpgFileSfxKey {
  return FILE_SFX_KEY_SET.has(key);
}

/** 抽奖稀有度 → 揭晓音效 */
export function lotteryRevealSfxKey(rarity: string): RpgSfxKey {
  if (rarity === 'legendary') return 'lotteryRevealLegendary';
  if (rarity === 'epic') return 'lotteryRevealEpic';
  if (rarity === 'rare') return 'lotteryRevealRare';
  return 'lotteryRevealCommon';
}

/** itemGranted WS：按稀有度中文标签映射揭晓音 */
export function itemGrantedSfxKey(rarityLabel?: string): RpgSfxKey {
  const map: Record<string, RpgSfxKey> = {
    普通: 'lotteryRevealCommon',
    稀有: 'lotteryRevealRare',
    史诗: 'lotteryRevealEpic',
    传说: 'lotteryRevealLegendary',
  };
  return map[rarityLabel ?? ''] ?? 'lotteryRevealCommon';
}
