/**
 * 站内通知未读数（全站单例）
 * - 登录后连接 /realtime WebSocket，订阅 siteNotification 实时更新角标
 * - 挂载时 HTTP 拉一次未读数；断线重连后再拉一次兜底
 */
import { ref, watch } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import {
  useRealtimeSocket,
  type SiteNotificationPayload,
} from '~~/composables/use-realtime-socket';
import { getUnreadNotificationCount } from '@/api/notification';

function useSiteNotificationCore() {
  const token = useToken();
  const unreadCount = ref(0);
  const { connect, on, connected } = useRealtimeSocket();
  let listenersBound = false;

  const fetchUnread = async () => {
    if (!token.value) return;
    try {
      unreadCount.value = Number(await getUnreadNotificationCount()) || 0;
    }
    catch {
      unreadCount.value = 0;
    }
  };

  const bindListeners = () => {
    if (!import.meta.client || listenersBound) return;
    listenersBound = true;

    on('siteNotification', (data) => {
      const payload = data as SiteNotificationPayload;
      if (typeof payload.unreadCount === 'number') {
        unreadCount.value = payload.unreadCount;
      }
      else {
        unreadCount.value += 1;
      }
    });

    watch(connected, (isConnected, wasConnected) => {
      if (isConnected && wasConnected === false && token.value) {
        void fetchUnread();
      }
    });
  };

  watch(
    token,
    (v) => {
      if (v) {
        bindListeners();
        connect();
        void fetchUnread();
      }
      else {
        unreadCount.value = 0;
      }
    },
    { immediate: true },
  );

  const resetUnread = () => {
    unreadCount.value = 0;
  };

  return {
    unreadCount,
    fetchUnread,
    resetUnread,
  };
}

export const useSiteNotification = createSharedComposable(useSiteNotificationCore);
