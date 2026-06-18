import { ref, onUnmounted } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { io, type Socket } from 'socket.io-client';
import { originUrl } from '~~/config';
import { getToken } from '@/utils/cookie';
import type { LevelUpResult } from '~~/types/rpg';

/**
 * 服务端推送事件名（与 blog-server constants/ws-events.ts 对齐）
 * 前端反馈逻辑见 use-rpg-socket-handlers.ts
 */
export type RpgSocketEvent
  = | 'levelUp' // 全屏升级动画 + refresh status
    | 'lifeChange' // Toast HP 变化 + refresh status
    | 'banStatus' // Toast 禁言 + refresh status
    | 'achievementComplete' // 成就弹窗 + refresh achievements/quests/status
    | 'questReward' // Toast 奖励已领 + refresh quests/status
    | 'buffGranted' // Toast 获得 Buff + refresh buffs
    | 'questComplete' // Toast 待领取 + refresh quests
    | 'expGain' // 5s 防抖 EXP Toast + refresh status
    | 'socialReceived' // Toast 社交互动 + refresh status
    | 'tipReceived' // Toast 打赏 + refresh status/inventory
    | 'articleLevelUp' // Toast 文章升级（无刷新）
    | 'masterpiece' // 神作弹窗 + Toast
    | 'currencyChange' // Toast 钻石变动 + refresh status/inventory
    | 'itemGranted' // Toast 获得物品 + refresh inventory
    | 'lotteryTicketChange' // Toast 抽奖券 + refresh status
    | 'petHatched' // Toast 孵化 + refresh pets
    | 'shieldUsed' // Toast 护盾抵消 + refresh buffs
    | 'weatherBuff' // Toast 天气加成 + refresh status
    | 'activityUpdate' // Toast 活动变更 + refresh status
    | 'rankChange' // Toast 排名 + refresh leaderboard
    | 'guildEvent' // Toast 公会事件 + refresh guild
    | 'buffExpired'; // Toast Buff 过期 + refresh buffs

/**
 * 冒险页增量刷新 scope（由 handlers notifyDataRefresh 触发 → useRpgPage.handleSocketRefresh）
 * 与 RpgSocketEvent 是多对一：多个 WS 事件可能刷新同一 scope
 */
export type RpgRefreshScope
  = | 'status' // reloadStatusCore：等级/EXP/HP/签到/天气/活动/抽奖券等
    | 'achievements' // reloadAchievements
    | 'quests' // reloadQuests
    | 'buffs' // reloadBuffs
    | 'inventory' // reloadInventory：背包/装扮/钻石相关
    | 'pets' // reloadPetTab
    | 'guild' // reloadGuildTab
    | 'leaderboard'; // loadTab('leaderboard')，仅 Tab 已加载时刷新

/**
 * 各事件 payload 类型（与 blog-server constants/ws-events.ts 对齐，改字段需同步）
 * 前端 Date 字段序列化为 string；部分字段服务端 enrich 后才有值
 */
/** lifeChange 事件 */
export interface RpgLifeChangePayload {
  lifeDeducted: number;
  currentLife: number;
  lifeRecovered?: number;
}

/** banStatus 事件 */
export interface RpgBanStatusPayload {
  banned: boolean;
  banEndTime: string | null;
  banReason?: string | null;
}

/** achievementComplete 事件 */
export interface RpgAchievementCompletePayload {
  code?: string;
  name?: string;
  achievementName?: string;
  expReward?: number;
}

/** questReward 事件 */
export interface RpgQuestRewardPayload {
  questCode?: string;
  questName?: string;
  expReward?: number;
}

/** buffGranted 事件 */
export interface RpgBuffGrantedPayload {
  code: string;
  name: string;
  description?: string;
  expireAt?: string;
}

/** questComplete 事件 */
export interface RpgQuestCompletePayload {
  questCode: string;
  questName: string;
  expReward: number;
  hpReward?: number;
}

/** expGain 事件（后端 8s 合并后推送） */
export interface RpgExpGainPayload {
  amount: number;
  reasons: string[];
  reasonLabels: string[];
}

/** socialReceived 事件；action: cheer | egg | flower */
export interface RpgSocialReceivedPayload {
  fromUid: number;
  fromNickname: string;
  action: string;
  hpDelta: number;
  currentLife: number;
  reputationDelta: number;
}

/** tipReceived 事件 */
export interface RpgTipReceivedPayload {
  fromUid: number;
  amount: number;
  articleId: number;
  articleTitle: string;
  balance?: number;
}

/** articleLevelUp 事件 */
export interface RpgArticleLevelUpPayload {
  articleId: number;
  articleTitle: string;
  oldLevel: number;
  newLevel: number;
}

/** masterpiece 事件 */
export interface RpgMasterpiecePayload {
  articleId: number;
  articleTitle: string;
}

/** currencyChange 事件 */
export interface RpgCurrencyChangePayload {
  delta: number;
  balance: number;
  reason: string;
  reasonLabel: string;
}

/** itemGranted 事件（config 由服务端 enrich） */
export interface RpgItemGrantedPayload {
  itemCode: string;
  quantity: number;
  source: string;
  sourceLabel: string;
  config: {
    name: string;
    rarityLabel?: string;
    rarityColor?: string;
    itemTypeLabel?: string;
  };
}

/** lotteryTicketChange 事件 */
export interface RpgLotteryTicketChangePayload {
  delta: number;
  total: number;
  reason: string;
  reasonLabel: string;
}

/** petHatched 事件 */
export interface RpgPetHatchedPayload {
  petId: number;
  petCode: string;
  name: string;
  rarityLabel: string;
  rarityColor: string;
}

/** shieldUsed 事件 */
export interface RpgShieldUsedPayload {
  buffName: string;
}

/** weatherBuff 事件（连接时每日一次） */
export interface RpgWeatherBuffPayload {
  label: string;
  expBoost: number;
  weather: string;
}

/** activityUpdate 事件；type: connect | start | end */
export interface RpgActivityUpdatePayload {
  type: 'connect' | 'start' | 'end';
  activities: { code: string; name: string; description?: string; expBuffRate?: number }[];
}

/** rankChange 事件（Top10） */
export interface RpgRankChangePayload {
  type: string;
  period: string;
  rank: number;
  score: number;
}

/** guildEvent 事件 */
export interface RpgGuildEventPayload {
  type: 'memberJoined' | 'memberLeft' | 'guildCreated';
  guildId: number;
  guildName: string;
  uid: number;
  nickname: string;
}

/** buffExpired 事件 */
export interface RpgBuffExpiredPayload {
  code: string;
  name: string;
}

type RpgSocketListener = (data: unknown) => void;
type RpgRefreshHandler = (scope: RpgRefreshScope) => void;

/** 订阅的事件列表（与 RpgSocketEvent 一一对应，bindSocketEvents 注册用） */
const ALL_EVENTS: RpgSocketEvent[] = [
  'levelUp',
  'lifeChange',
  'banStatus',
  'achievementComplete',
  'questReward',
  'buffGranted',
  'questComplete',
  'expGain',
  'socialReceived',
  'tipReceived',
  'articleLevelUp',
  'masterpiece',
  'currencyChange',
  'itemGranted',
  'lotteryTicketChange',
  'petHatched',
  'shieldUsed',
  'weatherBuff',
  'activityUpdate',
  'rankChange',
  'guildEvent',
  'buffExpired',
];

/**
 * RPG WebSocket 连接 composable（全站单例）
 * 连接后端 /rpg namespace，接收实时推送事件
 *
 * 鉴权：须在 handshake.auth.token 传递 JWT（Bearer 前缀）
 * 事件反馈由 use-rpg-socket-handlers 统一处理；冒险页通过 onDataRefresh 订阅增量刷新。
 */
function useRpgSocketCore() {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);
  const refreshHandlers = new Set<RpgRefreshHandler>();
  const listeners = Object.fromEntries(
    ALL_EVENTS.map(e => [e, new Set<RpgSocketListener>()]),
  ) as Record<RpgSocketEvent, Set<RpgSocketListener>>;

  const emitToListeners = (event: RpgSocketEvent, data: unknown) => {
    listeners[event].forEach(fn => fn(data));
  };

  /** 通知冒险页等订阅方按 scope 增量刷新 */
  const notifyDataRefresh = (scope: RpgRefreshScope) => {
    refreshHandlers.forEach(fn => fn(scope));
  };

  /** 注册事件监听；组件卸载时自动取消 */
  const on = <E extends RpgSocketEvent>(event: E, handler: RpgSocketListener) => {
    listeners[event].add(handler);
    onUnmounted(() => listeners[event].delete(handler));
  };

  /** 订阅 WebSocket 触发的局部数据刷新（如冒险页 useRpgPage） */
  const onDataRefresh = (handler: RpgRefreshHandler) => {
    refreshHandlers.add(handler);
    onUnmounted(() => refreshHandlers.delete(handler));
  };

  /** 从 Cookie 读取 accessToken 并格式化为后端 Socket 中间件要求的 Bearer 字符串 */
  const buildAuthToken = () => {
    const token = getToken();
    return token ? `Bearer ${token}` : '';
  };

  const bindSocketEvents = (s: Socket) => {
    s.on('connect', () => {
      connected.value = true;
    });

    s.on('disconnect', () => {
      connected.value = false;
    });

    s.on('connect_error', () => {
      connected.value = false;
    });

    ALL_EVENTS.forEach((event) => {
      s.on(event, data => emitToListeners(event, data));
    });
  };

  /** 建立 /rpg 连接；未登录（无 token）时不连接 */
  const connect = () => {
    if (!import.meta.client) return;
    if (socket.value?.connected) return;

    const authToken = buildAuthToken();
    if (!authToken) return;

    const newSocket = io(`${originUrl}/rpg`, {
      auth: { token: authToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    newSocket.io.on('reconnect_attempt', () => {
      const freshToken = buildAuthToken();
      if (freshToken) {
        newSocket.auth = { token: freshToken };
      }
    });

    bindSocketEvents(newSocket);
    socket.value = newSocket;
  };

  /** 主动断开并清理 socket 引用 */
  const disconnect = () => {
    socket.value?.disconnect();
    socket.value = null;
    connected.value = false;
  };

  return {
    socket,
    connected,
    connect,
    disconnect,
    on,
    onDataRefresh,
    notifyDataRefresh,
  };
}

export const useRpgSocket = createSharedComposable(useRpgSocketCore);

export type { LevelUpResult };
