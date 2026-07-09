import { ref, onUnmounted } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { io, type Socket } from 'socket.io-client';
import { originUrl } from '~~/config';
import { getToken } from '@/utils/cookie';
import { getNotificationsSince } from '@/api/notification';
import { canUseRpgDevMock } from '~~/utils/rpg-dev-mock-guard';
import type { LevelUpResult, RarityDisplayFields } from '~~/types/rpg';

/** true 时回退 Socket.IO（Nest）；默认原生 WebSocket（blog-server-go） */
const useSocketIO = import.meta.env.VITE_NUXT_USE_SOCKET_IO === 'true';

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
    | 'rechargeComplete'
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
export interface RpgAchievementCompletePayload extends RarityDisplayFields {
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

/** rechargeComplete 事件（充值弹窗 WS 关单） */
export interface RpgRechargeCompletePayload {
  outTradeNo: string;
  diamonds: number;
  balance: number;
  amountYuan: number;
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
  'rechargeComplete',
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
 * 默认原生 WS GET /realtime；VITE_NUXT_USE_SOCKET_IO=true 时回退 Socket.IO
 */
function useRealtimeSocketCore() {
  const socket = ref<Socket | WebSocket | null>(null);
  const connected = ref(false);
  const refreshHandlers = new Set<RpgRefreshHandler>();
  const listeners = Object.fromEntries(
    ALL_EVENTS.map(e => [e, new Set<RealtimeSocketListener>()]),
  ) as Record<RealtimeSocketEvent, Set<RealtimeSocketListener>>;

  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
  let reconnectAttempts = 0;
  let lastSeq = 0;
  let currentWsURL = '';

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

  const buildWsURL = () => {
    const raw = getToken();
    if (!raw) return '';
    const wsOrigin = originUrl.replace(/^http/i, 'ws');
    return `${wsOrigin}/realtime?token=${encodeURIComponent(raw)}`;
  };

  const routeNativeMessage = (msg: { type?: string; seq?: number; data?: unknown }) => {
    if (!msg.type || msg.type === 'pong') return;
    if (typeof msg.seq === 'number' && msg.seq > 0) {
      lastSeq = Math.max(lastSeq, msg.seq);
    }
    if (!ALL_EVENTS.includes(msg.type as RealtimeSocketEvent)) return;
    let data = msg.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      }
      catch {
        return;
      }
    }
    emitToListeners(msg.type as RealtimeSocketEvent, data);
  };

  const replayNotificationsSince = async () => {
    if (lastSeq <= 0) return;
    try {
      const list = (await getNotificationsSince(lastSeq)) as {
        id: number;
        type: string;
        payload: Record<string, unknown>;
        read: number;
        createTime: string;
      }[];
      if (!Array.isArray(list)) return;
      for (const item of list) {
        lastSeq = Math.max(lastSeq, item.id);
        emitToListeners('siteNotification', {
          notification: {
            id: item.id,
            type: item.type,
            payload: item.payload,
            read: item.read === 1,
            createTime: item.createTime,
          },
        });
      }
    }
    catch {
      // 补漏失败不阻断 WS
    }
  };

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = undefined;
    }
  };

  const startNativeHeartbeat = (ws: WebSocket) => {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 20000);
  };

  const scheduleReconnect = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
    const jitter = Math.random() * 1000;
    reconnectTimer = setTimeout(() => {
      reconnectAttempts += 1;
      connect();
    }, delay + jitter);
  };

  const connectNative = () => {
    const url = buildWsURL();
    if (!url) {
      disconnect();
      return;
    }

    const existing = socket.value;
    if (existing instanceof WebSocket) {
      if (existing.readyState === WebSocket.OPEN && currentWsURL === url) return;
      disconnect();
    }

    const ws = new WebSocket(url);
    currentWsURL = url;
    socket.value = ws;

    ws.onopen = () => {
      connected.value = true;
      reconnectAttempts = 0;
      startNativeHeartbeat(ws);
      void replayNotificationsSince();
    };

    ws.onmessage = (e) => {
      try {
        routeNativeMessage(JSON.parse(e.data as string));
      }
      catch {
        // ignore malformed
      }
    };

    ws.onclose = () => {
      connected.value = false;
      stopHeartbeat();
      if (getToken()) scheduleReconnect();
    };

    ws.onerror = () => ws.close();
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

  const connectSocketIO = () => {
    const authToken = buildAuthToken();
    if (!authToken) {
      disconnect();
      return;
    }

    const existing = socket.value;
    if (existing && 'connected' in existing && existing.connected) {
      const currentToken = (existing.auth as { token?: string } | undefined)?.token;
      if (currentToken === authToken) return;
      disconnect();
    }
    else if (existing) {
      disconnect();
    }

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

  /** 建立 /realtime 连接；未登录（无 token）时不连接；切账户时先断开旧连接 */
  const connect = () => {
    if (!import.meta.client) return;
    if (useSocketIO) {
      connectSocketIO();
    }
    else {
      connectNative();
    }
  };

  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = undefined;
    }
    stopHeartbeat();
    const s = socket.value;
    if (s instanceof WebSocket) {
      s.close();
    }
    else if (s && 'disconnect' in s) {
      s.disconnect();
    }
    socket.value = null;
    connected.value = false;
    currentWsURL = '';
  };

  /** 开发/测试页：本地注入 WS 事件，走与真推送相同的 on() 监听链 */
  const dispatchLocalEvent = (event: RealtimeSocketEvent, data: unknown) => {
    if (!canUseRpgDevMock()) return;
    emitToListeners(event, data);
  };

  onUnmounted(() => disconnect());

  return {
    socket,
    connected,
    connect,
    disconnect,
    on,
    onDataRefresh,
    notifyDataRefresh,
    dispatchLocalEvent,
  };
}

export const useRealtimeSocket = createSharedComposable(useRealtimeSocketCore);

export type { LevelUpResult };
