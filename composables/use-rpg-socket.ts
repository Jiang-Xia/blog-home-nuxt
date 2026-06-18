import { ref, onUnmounted } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { io, type Socket } from 'socket.io-client';
import { originUrl } from '~~/config';
import { getToken } from '@/utils/cookie';

export type RpgSocketEvent
  = | 'levelUp'
    | 'lifeChange'
    | 'banStatus'
    | 'signInResult'
    | 'achievementComplete'
    | 'questReward'
    | 'buffGranted';

type RpgSocketListener = (data: any) => void;

/**
 * RPG WebSocket 连接 composable（全站单例）
 * 连接后端 /rpg namespace，接收实时推送事件
 *
 * 鉴权：须在 handshake.auth.token 传递 JWT（Bearer 前缀）
 */
function useRpgSocketCore() {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);
  const listeners: Record<RpgSocketEvent, Set<RpgSocketListener>> = {
    levelUp: new Set(),
    lifeChange: new Set(),
    banStatus: new Set(),
    signInResult: new Set(),
    achievementComplete: new Set(),
    questReward: new Set(),
    buffGranted: new Set(),
  };

  const emitToListeners = (event: RpgSocketEvent, data: unknown) => {
    listeners[event].forEach(fn => fn(data));
  };

  /** 注册事件监听；组件卸载时自动取消 */
  const on = (event: RpgSocketEvent, handler: RpgSocketListener) => {
    listeners[event].add(handler);
    onUnmounted(() => listeners[event].delete(handler));
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

    (Object.keys(listeners) as RpgSocketEvent[]).forEach((event) => {
      s.on(event, data => emitToListeners(event, data));
    });
  };

  /** 建立 /rpg 连接；未登录（无 token）时不连接 */
  const connect = () => {
    if (!import.meta.client) return;
    if (socket.value?.connected) return;

    const authToken = buildAuthToken();
    if (!authToken) return;

    socket.value = io(`${originUrl}/rpg`, {
      auth: { token: authToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socket.value.io.on('reconnect_attempt', () => {
      const freshToken = buildAuthToken();
      if (freshToken && socket.value) {
        socket.value.auth = { token: freshToken };
      }
    });

    bindSocketEvents(socket.value);
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
  };
}

export const useRpgSocket = createSharedComposable(useRpgSocketCore);
