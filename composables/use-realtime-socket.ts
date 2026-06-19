import { ref, onUnmounted } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { io, type Socket } from 'socket.io-client';
import { originUrl } from '~~/config';
import { getToken } from '@/utils/cookie';
import type { LevelUpResult } from '~~/types/rpg';

/**
 * 博客实时推送事件名（与 blog-server modules/core/realtime/constants/ws-events.ts 对齐）
 * RPG 反馈逻辑见 use-rpg-realtime-handlers.ts；站内通知见 use-site-notification.ts
 */
export type RealtimeSocketEvent
  = | 'levelUp'
    | 'lifeChange'
    | 'banStatus'
    | 'achievementComplete'
    | 'questReward'
    | 'buffGranted'
    | 'questComplete'
    | 'expGain'
    | 'socialReceived'
    | 'tipReceived'
    | 'articleLevelUp'
    | 'masterpiece'
    | 'currencyChange'
    | 'itemGranted'
    | 'lotteryTicketChange'
    | 'petHatched'
    | 'shieldUsed'
    | 'weatherBuff'
    | 'activityUpdate'
    | 'rankChange'
    | 'guildEvent'
    | 'buffExpired'
    | 'siteNotification';

/** 冒险页增量刷新 scope（RPG 专用；由 handlers notifyDataRefresh 触发） */
export type RpgRefreshScope
  = | 'status'
    | 'achievements'
    | 'quests'
    | 'buffs'
    | 'inventory'
    | 'pets'
    | 'guild'
    | 'leaderboard';

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
  fromNickname?: string;
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

/** siteNotification 事件；评论提醒等站内通知 */
export interface SiteNotificationPayload {
  notification: {
    id: number;
    type: string;
    payload: Record<string, unknown>;
    read: boolean;
    createTime: string;
  };
  unreadCount: number;
}

type RealtimeSocketListener = (data: unknown) => void;
type RpgRefreshHandler = (scope: RpgRefreshScope) => void;

const ALL_EVENTS: RealtimeSocketEvent[] = [
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
  'siteNotification',
];

/**
 * 博客实时 WebSocket 连接 composable（全站单例）
 * 连接后端 /realtime namespace，接收 RPG、站内通知等推送
 */
function useRealtimeSocketCore() {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);
  const refreshHandlers = new Set<RpgRefreshHandler>();
  const listeners = Object.fromEntries(
    ALL_EVENTS.map(e => [e, new Set<RealtimeSocketListener>()]),
  ) as Record<RealtimeSocketEvent, Set<RealtimeSocketListener>>;

  const emitToListeners = (event: RealtimeSocketEvent, data: unknown) => {
    listeners[event].forEach(fn => fn(data));
  };

  const notifyDataRefresh = (scope: RpgRefreshScope) => {
    refreshHandlers.forEach(fn => fn(scope));
  };

  const on = <E extends RealtimeSocketEvent>(event: E, handler: RealtimeSocketListener) => {
    listeners[event].add(handler);
    onUnmounted(() => listeners[event].delete(handler));
  };

  const onDataRefresh = (handler: RpgRefreshHandler) => {
    refreshHandlers.add(handler);
    onUnmounted(() => refreshHandlers.delete(handler));
  };

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

  /** 建立 /realtime 连接；未登录（无 token）时不连接 */
  const connect = () => {
    if (!import.meta.client) return;
    if (socket.value?.connected) return;

    const authToken = buildAuthToken();
    if (!authToken) return;

    const newSocket = io(`${originUrl}/realtime`, {
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

export const useRealtimeSocket = createSharedComposable(useRealtimeSocketCore);

export type { LevelUpResult };
