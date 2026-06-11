import { ref, onUnmounted } from 'vue';
import { io, type Socket } from 'socket.io-client';
import { originUrl } from '~~/config';
import { getToken } from '@/utils/cookie';

/**
 * RPG WebSocket 连接 composable
 * 连接后端 /rpg namespace，接收实时推送事件
 *
 * 鉴权：须在 handshake.auth.token 传递 JWT（Bearer 前缀）
 */
export function useRpgSocket() {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);

  const onLevelUp = ref<((data: any) => void) | null>(null);
  const onLifeChange = ref<((data: any) => void) | null>(null);
  const onBanStatus = ref<((data: any) => void) | null>(null);
  const onSignInResult = ref<((data: any) => void) | null>(null);
  const onAchievementComplete = ref<((data: any) => void) | null>(null);
  const onQuestReward = ref<((data: any) => void) | null>(null);
  const onBuffGranted = ref<((data: any) => void) | null>(null);

  /** 从 Cookie 读取 accessToken 并格式化为后端 Socket 中间件要求的 Bearer 字符串 */
  const buildAuthToken = () => {
    const token = getToken();
    return token ? `Bearer ${token}` : '';
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

    // 重连时使用最新 token（无感 refresh 后避免仍用旧 JWT）
    socket.value.io.on('reconnect_attempt', () => {
      const freshToken = buildAuthToken();
      if (freshToken && socket.value) {
        socket.value.auth = { token: freshToken };
      }
    });

    socket.value.on('connect', () => {
      connected.value = true;
    });

    socket.value.on('disconnect', () => {
      connected.value = false;
    });

    socket.value.on('connect_error', () => {
      connected.value = false;
    });

    socket.value.on('levelUp', (data) => {
      onLevelUp.value?.(data);
    });

    socket.value.on('lifeChange', (data) => {
      onLifeChange.value?.(data);
    });

    socket.value.on('banStatus', (data) => {
      onBanStatus.value?.(data);
    });

    socket.value.on('signInResult', (data) => {
      onSignInResult.value?.(data);
    });

    socket.value.on('achievementComplete', (data) => {
      onAchievementComplete.value?.(data);
    });

    socket.value.on('questReward', (data) => {
      onQuestReward.value?.(data);
    });

    socket.value.on('buffGranted', (data) => {
      onBuffGranted.value?.(data);
    });
  };

  /** 主动断开并清理 socket 引用 */
  const disconnect = () => {
    socket.value?.disconnect();
    socket.value = null;
    connected.value = false;
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    socket,
    connected,
    connect,
    disconnect,
    onLevelUp,
    onLifeChange,
    onBanStatus,
    onSignInResult,
    onAchievementComplete,
    onQuestReward,
    onBuffGranted,
  };
}
