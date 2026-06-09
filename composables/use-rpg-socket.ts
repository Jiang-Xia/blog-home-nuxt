import { ref, onMounted, onUnmounted } from 'vue';
import { io, type Socket } from 'socket.io-client';
import { originUrl } from '~~/config';
import { getToken } from '@/utils/cookie';

/**
 * RPG WebSocket 连接 composable
 * 连接后端 /rpg namespace，接收实时推送事件
 */
export function useRpgSocket() {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);

  // 事件回调
  const onLevelUp = ref<((data: any) => void) | null>(null);
  const onLifeChange = ref<((data: any) => void) | null>(null);
  const onBanStatus = ref<((data: any) => void) | null>(null);
  const onSignInResult = ref<((data: any) => void) | null>(null);

  const connect = (uid: number) => {
    if (!import.meta.client) return;
    if (socket.value?.connected) return;

    const token = getToken();
    socket.value = io(`${originUrl}/rpg`, {
      auth: { uid, token },
      query: { uid },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socket.value.on('connect', () => {
      connected.value = true;
      console.log('[RPG WebSocket] 已连接');
    });

    socket.value.on('disconnect', () => {
      connected.value = false;
      console.log('[RPG WebSocket] 已断开');
    });

    socket.value.on('levelUp', (data) => {
      console.log('[RPG WebSocket] 升级通知:', data);
      onLevelUp.value?.(data);
    });

    socket.value.on('lifeChange', (data) => {
      console.log('[RPG WebSocket] 生命值变化:', data);
      onLifeChange.value?.(data);
    });

    socket.value.on('banStatus', (data) => {
      console.log('[RPG WebSocket] 禁言状态变更:', data);
      onBanStatus.value?.(data);
    });

    socket.value.on('signInResult', (data) => {
      console.log('[RPG WebSocket] 签到结果:', data);
      onSignInResult.value?.(data);
    });
  };

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
  };
}
