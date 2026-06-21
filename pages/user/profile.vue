<script setup lang="ts">
/**
   * 用户个人中心页面
   * Tab 与 URL ?tab= 双向同步，便于深链分享（对齐 rpg/index switchTab）
   */
import { ref, watch, onMounted, nextTick } from 'vue';
import { refreshUserInfo } from '@/composables/use-common';

const { frame: avatarFrame } = useEquippedAvatarFrame();

const route = useRoute();
const router = useRouter();
const userInfo = useUserInfo();

type ProfileTab = 'card' | 'article' | 'collect' | 'comment' | 'inbox' | 'dashboard';
const TAB_VALUES: ProfileTab[] = ['card', 'article', 'collect', 'comment', 'inbox', 'dashboard'];

const resolveTab = (tab: unknown): ProfileTab => {
  if (typeof tab === 'string' && TAB_VALUES.includes(tab as ProfileTab)) {
    return tab as ProfileTab;
  }
  return 'card';
};

/** 当前激活的标签页 */
const activeTab = ref<ProfileTab>(resolveTab(route.query.tab));

watch(
  () => route.query.tab,
  (tab) => {
    activeTab.value = resolveTab(tab);
  },
);

const tabOptions: { key: ProfileTab; label: string }[] = [
  { key: 'card', label: '我的名片' },
  { key: 'article', label: '我的文章' },
  { key: 'collect', label: '我的收藏' },
  { key: 'comment', label: '我的评论/回复' },
  { key: 'inbox', label: '收到评论' },
  { key: 'dashboard', label: '数据看板' },
];

const tabListRef = ref<HTMLElement | null>(null);

/** 移动端横向 Tab 栏：将当前 Tab 滚入可视区域 */
const scrollActiveTabIntoView = (smooth = true) => {
  nextTick(() => {
    const list = tabListRef.value;
    if (!list) return;
    const activeEl = list.querySelector<HTMLElement>('[aria-selected="true"]');
    activeEl?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
      block: 'nearest',
      inline: 'center',
    });
  });
};

/** 切换 Tab 并写回 URL query（card 为默认时不带 tab 参数） */
const switchTab = (tab: ProfileTab) => {
  activeTab.value = tab;
  router.replace({ query: tab === 'card' ? {} : { tab } });
};

watch(activeTab, () => scrollActiveTabIntoView());

definePageMeta({
  layout: 'default',
});

useHead({
  title: '个人中心',
});

onMounted(async () => {
  scrollActiveTabIntoView(false);
  try {
    await refreshUserInfo();
  }
  catch {
    // 错误由全局拦截器处理
  }
});
</script>

<template>
  <CyberPageContainer label="PROFILE" title="个人中心" subtitle="管理你的资料与内容">
    <div class="profile-container">
      <CyberCard v-if="userInfo?.nickname && activeTab !== 'card'" class="mb-6 !p-5">
        <div class="flex flex-row items-center gap-4">
          <CommonAvatarWithFrame
            :avatar="userInfo.avatar"
            :alt="userInfo.nickname"
            :frame="avatarFrame"
            :size="64"
          >
            <template #fallback>
              <span class="text-2xl font-bold text-primary-content">
                {{ userInfo.nickname?.charAt(0) || '?' }}
              </span>
            </template>
          </CommonAvatarWithFrame>
          <div>
            <h2 class="text-lg font-semibold text-tech">
              {{ userInfo.nickname }}
            </h2>
            <p v-if="userInfo.intro" class="mt-1 text-sm text-tech-muted">
              {{ userInfo.intro }}
            </p>
          </div>
        </div>
      </CyberCard>

      <!-- 横向可滚动 Tab（移动端优化，对齐 rpg/index .rpg-page-tabs） -->
      <div ref="tabListRef" role="tablist" class="profile-page-tabs">
        <button
          v-for="opt in tabOptions"
          :key="opt.key"
          type="button"
          role="tab"
          class="profile-page-tab"
          :class="{ active: activeTab === opt.key }"
          :aria-selected="activeTab === opt.key"
          :aria-controls="`profile-panel-${opt.key}`"
          @click="switchTab(opt.key)"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- 标签页内容 -->
      <client-only>
        <!-- 我的名片 -->
        <div
          v-show="activeTab === 'card'"
          id="profile-panel-card"
          role="tabpanel"
          class="card-tab-panel"
        >
          <UserBusinessCard />
        </div>

        <!-- 我的文章 -->
        <div v-show="activeTab === 'article'" id="profile-panel-article" role="tabpanel">
          <CyberCard class="!p-5">
            <div class="mb-2 flex items-center justify-between gap-3">
              <h3 class="text-base font-semibold text-tech">
                我的文章
              </h3>
              <CyberButton to="/user/article/edit" variant="primary" class="!py-2 !text-sm">
                写文章
              </CyberButton>
            </div>
            <UserArticleList />
          </CyberCard>
        </div>

        <!-- 收藏 -->
        <div v-show="activeTab === 'collect'" id="profile-panel-collect" role="tabpanel">
          <CyberCard class="!p-5">
            <h3 class="mb-3 text-base font-semibold text-tech">
              我的收藏
            </h3>
            <UserCollectList />
          </CyberCard>
        </div>

        <!-- 评论/回复 -->
        <div v-show="activeTab === 'comment'" id="profile-panel-comment" role="tabpanel">
          <CyberCard class="!p-5">
            <h3 class="mb-3 text-base font-semibold text-tech">
              我的评论/回复
            </h3>
            <UserCommentReplyList />
          </CyberCard>
        </div>

        <div v-show="activeTab === 'inbox'" id="profile-panel-inbox" role="tabpanel">
          <CyberCard class="!p-5">
            <p class="cyber-section-label mb-1">
              INBOX
            </p>
            <h3 class="mb-4 text-base font-semibold text-tech">
              我文章收到的评论
            </h3>
            <UserInboxList />
          </CyberCard>
        </div>

        <div v-show="activeTab === 'dashboard'" id="profile-panel-dashboard" role="tabpanel">
          <CyberCard class="!p-5">
            <p class="cyber-section-label mb-1">
              ANALYTICS
            </p>
            <h3 class="mb-4 text-base font-semibold text-tech">
              创作数据看板
            </h3>
            <UserDashboardPanel />
          </CyberCard>
        </div>
      </client-only>
    </div>
  </CyberPageContainer>
</template>

<style scoped>
  .profile-container {
    max-width: 720px;
    margin: 0 auto;
    min-width: 0;
  }

  .profile-page-tabs {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 0;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--tech-border);
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .profile-page-tabs::-webkit-scrollbar {
    display: none;
  }

  .profile-page-tab {
    position: relative;
    flex: 0 0 auto;
    padding: 0.625rem 0.875rem;
    border: none;
    background: transparent;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25;
    white-space: nowrap;
    color: var(--tech-fg-muted);
    cursor: pointer;
    transition: color 0.2s;
  }

  .profile-page-tab:hover {
    color: var(--tech-fg);
  }

  .profile-page-tab.active {
    color: var(--tech-section-label);
    font-weight: 600;
  }

  .profile-page-tab.active::after {
    content: '';
    position: absolute;
    left: 0.875rem;
    right: 0.875rem;
    bottom: -1px;
    height: 3px;
    border-radius: 3px 3px 0 0;
    background: var(--tech-section-label);
    z-index: 1;
  }

  @media (max-width: 639px) {
    .profile-page-tabs {
      margin-inline: -0.75rem;
      padding-inline: 0.75rem;
    }

    .profile-page-tab {
      padding: 0.5rem 0.625rem;
      font-size: 0.8125rem;
    }

    .profile-page-tab.active::after {
      left: 0.625rem;
      right: 0.625rem;
      height: 2px;
      border-radius: 2px 2px 0 0;
    }
  }

  .card-tab-panel {
    animation: tab-fade-in 0.2s ease;
  }

  @keyframes tab-fade-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
