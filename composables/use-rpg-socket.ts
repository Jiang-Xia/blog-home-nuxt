import { ref, onUnmounted } from 'vue';
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

  const onLevelUp = ref<((data: any) => void) | null>(null);
  const onLifeChange = ref<((data: any) => void) | null>(null);
  const onBanStatus = ref<((data: any) => void) | null>(null);
  const onSignInResult = ref<((data: any) => void) | null>(null);
  const onAchievementComplete = ref<((data: any) => void) | null>(null);
  const onQuestReward = ref<((data: any) => void) | null>(null);
  const onBuffGranted = ref<((data: any) => void) | null>(null);

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
    });

    socket.value.on('disconnect', () => {
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
