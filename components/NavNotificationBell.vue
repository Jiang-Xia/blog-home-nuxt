<script setup lang="ts">
/**
   * 导航栏站内通知铃铛
   * - WebSocket siteNotification 实时更新未读数；展开时拉列表并 markRead
   * - 展示字段来自 API payload，勿本地 map 业务 type
   */
import { getNotifications, markNotificationsRead } from '@/api/notification';
import { useSiteNotification } from '~~/composables/use-site-notification';
import { beforeTimeNow } from '@/utils';

const token = useToken();
const { unreadCount, resetUnread } = useSiteNotification();
const open = ref(false);
const list = ref<any[]>([]);
const loading = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const formatTime = (timeStr?: string) => {
  if (!timeStr) return '';
  return beforeTimeNow(new Date(timeStr).getTime());
};

/** 通知标题：优先 payload.articleTitle，type 仅作兜底 */
const notificationTitle = (item: any) => {
  if (item.type === 'comment_created' || item.payload?.articleTitle) {
    return `收到新评论 · ${item.payload?.articleTitle || '文章'}`;
  }
  return item.type || '系统通知';
};

/** 通知摘要：展示评论内容或评论者昵称 */
const notificationDesc = (item: any) => {
  if (item.payload?.commentContent) {
    const text = String(item.payload.commentContent);
    return text.length > 48 ? `${text.slice(0, 48)}...` : text;
  }
  if (item.payload?.nickname) {
    return `${item.payload.nickname} 评论了你的文章`;
  }
  return '点击查看详情';
};

/** 展开面板时拉取最近通知 */
const fetchList = async () => {
  if (!token.value) return;
  loading.value = true;
  try {
    const res = await getNotifications({ page: 1, pageSize: 8 });
    list.value = res?.list ?? [];
  }
  finally {
    loading.value = false;
  }
};

const closePanel = () => {
  open.value = false;
};

/** 切换面板；打开时标记全部已读并清零角标 */
const toggle = async () => {
  open.value = !open.value;
  if (open.value) {
    await fetchList();
    await markNotificationsRead();
    resetUnread();
  }
};

const onDocumentClick = (event: MouseEvent) => {
  if (!open.value || !rootRef.value) return;
  if (!rootRef.value.contains(event.target as Node)) {
    closePanel();
  }
};

onMounted(() => {
  if (import.meta.client) {
    document.addEventListener('click', onDocumentClick);
    onUnmounted(() => {
      document.removeEventListener('click', onDocumentClick);
    });
  }
});

watch(token, (v) => {
  if (!v) {
    closePanel();
  }
});
</script>

<template>
  <div v-if="token" ref="rootRef" class="notify-bell">
    <button
      type="button"
      class="notify-bell__trigger"
      :class="{ 'notify-bell__trigger--active': open }"
      aria-label="通知"
      aria-haspopup="true"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      <span v-if="unreadCount > 0" class="notify-bell__badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <Transition name="notify-panel">
      <div v-if="open" class="notify-panel" @click.stop>
        <div class="notify-panel__head">
          <div>
            <p class="cyber-section-label">
              NOTIFICATIONS
            </p>
            <h3 class="notify-panel__title">
              通知中心
            </h3>
          </div>
          <button type="button" class="notify-panel__close" aria-label="关闭" @click="closePanel">
            ✕
          </button>
        </div>

        <div v-if="loading" class="notify-panel__state">
          <span class="loading loading-spinner loading-sm text-primary" />
          <span class="text-sm text-tech-muted">同步中...</span>
        </div>

        <div v-else-if="!list.length" class="notify-panel__state">
          <xia-icon icon="blog-pinglun" width="24px" class="text-tech-muted" />
          <span class="text-sm text-tech-muted">暂无新通知</span>
        </div>

        <ul v-else class="notify-panel__list">
          <li v-for="item in list" :key="item.id">
            <NuxtLink
              v-if="item.payload?.articleId"
              :to="`/detail/${item.payload.articleId}`"
              class="notify-item"
              :class="{ 'notify-item--unread': !item.read }"
              @click="closePanel"
            >
              <span class="notify-item__dot" aria-hidden="true" />
              <span class="notify-item__icon">
                <xia-icon icon="blog-pinglun" width="14px" />
              </span>
              <span class="notify-item__body">
                <span class="notify-item__title">{{ notificationTitle(item) }}</span>
                <span class="notify-item__desc">{{ notificationDesc(item) }}</span>
                <span v-if="item.createTime" class="notify-item__time">{{
                  formatTime(item.createTime)
                }}</span>
              </span>
            </NuxtLink>
            <div v-else class="notify-item notify-item--static">
              <span class="notify-item__icon">
                <xia-icon icon="blog-pinglun" width="14px" />
              </span>
              <span class="notify-item__body">
                <span class="notify-item__title">{{ notificationTitle(item) }}</span>
                <span class="notify-item__desc">{{ notificationDesc(item) }}</span>
              </span>
            </div>
          </li>
        </ul>

        <div class="notify-panel__foot">
          <NuxtLink to="/user/profile?tab=inbox" class="notify-panel__link" @click="closePanel">
            查看评论收件箱
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
  .notify-bell {
    position: relative;
  }

  .notify-bell__trigger {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 999px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--tech-muted, var(--tech-fg-muted));
    transition:
      color 0.2s,
      border-color 0.2s,
      background-color 0.2s;
  }

  .notify-bell__trigger:hover,
  .notify-bell__trigger--active {
    border-color: var(--tech-border);
    background: var(--tech-header);
    color: var(--tech-fg);
  }

  .notify-bell__badge {
    position: absolute;
    top: -2px;
    right: -2px;
    display: inline-flex;
    min-width: 1rem;
    height: 1rem;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: linear-gradient(to right, #f43f5e, #fb7185);
    padding: 0 0.25rem;
    font-size: 0.625rem;
    font-weight: 700;
    line-height: 1;
    color: #fff;
    box-shadow: 0 0 12px color-mix(in oklch, #f43f5e 45%, transparent);
  }

  .notify-panel {
    position: absolute;
    top: calc(100% + 0.625rem);
    right: 0;
    z-index: 10030;
    width: min(20rem, calc(100vw - 2rem));
    overflow: hidden;
    isolation: isolate;
    border-radius: 1.25rem;
    border: 1px solid var(--tech-border);
    background-color: var(--color-base-200);
    padding: 0;
    box-shadow:
      0 0 0 1px color-mix(in oklch, var(--color-base-content) 6%, transparent),
      0 20px 50px color-mix(in oklch, var(--color-base-content) 22%, transparent);
  }

  .notify-panel__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 1rem 1rem 0.75rem;
    border-bottom: 1px solid var(--tech-border);
    background-color: var(--color-base-200);
  }

  .notify-panel__title {
    margin-top: 0.125rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--tech-fg);
  }

  .notify-panel__close {
    display: inline-flex;
    width: 1.75rem;
    height: 1.75rem;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid var(--tech-border);
    background: transparent;
    font-size: 0.75rem;
    color: var(--tech-muted, var(--tech-fg-muted));
    transition:
      background-color 0.2s,
      color 0.2s;
  }

  .notify-panel__close:hover {
    background: var(--tech-header);
    color: var(--tech-fg);
  }

  .notify-panel__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 2rem 1rem;
    background-color: var(--color-base-200);
  }

  .notify-panel__list {
    max-height: 18rem;
    overflow-y: auto;
    padding: 0.375rem;
    background-color: var(--color-base-200);
  }

  .notify-item {
    display: flex;
    gap: 0.625rem;
    align-items: flex-start;
    border-radius: 0.875rem;
    padding: 0.625rem;
    transition: background-color 0.2s;
  }

  .notify-item:hover {
    background: var(--color-base-300);
  }

  .notify-item--static {
    color: inherit;
  }

  .notify-item__dot {
    position: absolute;
    opacity: 0;
  }

  .notify-item--unread {
    position: relative;
    background: color-mix(in oklch, var(--color-primary) 10%, var(--color-base-200));
  }

  .notify-item--unread::before {
    content: '';
    position: absolute;
    left: 0.25rem;
    top: 50%;
    width: 4px;
    height: 4px;
    border-radius: 999px;
    transform: translateY(-50%);
    background: var(--color-primary);
    box-shadow: 0 0 8px color-mix(in oklch, var(--color-primary) 50%, transparent);
  }

  .notify-item__icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--tech-border);
    background: var(--color-base-100);
    color: var(--tech-section-label);
  }

  .notify-item__body {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .notify-item__title {
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.35;
    color: var(--tech-fg);
  }

  .notify-item__desc {
    font-size: 0.75rem;
    line-height: 1.45;
    color: var(--tech-muted, var(--tech-fg-muted));
  }

  .notify-item__time {
    margin-top: 0.125rem;
    font-size: 0.6875rem;
    color: var(--tech-muted, var(--tech-fg-muted));
  }

  .notify-panel__foot {
    padding: 0.625rem;
    border-top: 1px solid var(--tech-border);
    background-color: var(--color-base-200);
  }

  .notify-panel__link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-radius: 0.75rem;
    border: 1px solid var(--tech-btn-secondary-border, var(--tech-border));
    background: var(--color-base-100);
    padding: 0.625rem 0.75rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--tech-fg);
    transition:
      border-color 0.2s,
      background-color 0.2s;
  }

  .notify-panel__link:hover {
    border-color: var(--tech-section-label);
    background: var(--color-base-300);
  }

  .notify-panel-enter-active,
  .notify-panel-leave-active {
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }

  .notify-panel-enter-from,
  .notify-panel-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
  }
</style>
