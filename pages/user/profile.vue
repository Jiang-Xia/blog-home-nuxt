<script setup lang="ts">
/**
   * 用户个人中心页面 - daisyUI tabs
   * Tab 与 URL ?tab= 双向同步，便于深链分享（对齐 rpg/index switchTab）
   */
import { ref, watch, onMounted } from 'vue';
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

/** 切换 Tab 并写回 URL query（card 为默认时不带 tab 参数） */
const switchTab = (tab: ProfileTab) => {
  activeTab.value = tab;
  router.replace({ query: tab === 'card' ? {} : { tab } });
};

definePageMeta({
  layout: 'default',
});

useHead({
  title: '个人中心',
});

onMounted(async () => {
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

      <!-- daisyUI 标签页 -->
      <div role="tablist" class="tabs tabs-border mb-4 overflow-x-auto flex-nowrap">
        <button
          type="button"
          role="tab"
          class="tab shrink-0"
          :class="{ 'tab-active': activeTab === 'card' }"
          :aria-selected="activeTab === 'card'"
          aria-controls="profile-panel-card"
          @click="switchTab('card')"
        >
          我的名片
        </button>
        <button
          type="button"
          role="tab"
          class="tab shrink-0"
          :class="{ 'tab-active': activeTab === 'article' }"
          :aria-selected="activeTab === 'article'"
          aria-controls="profile-panel-article"
          @click="switchTab('article')"
        >
          我的文章
        </button>
        <button
          type="button"
          role="tab"
          class="tab shrink-0"
          :class="{ 'tab-active': activeTab === 'collect' }"
          :aria-selected="activeTab === 'collect'"
          aria-controls="profile-panel-collect"
          @click="switchTab('collect')"
        >
          我的收藏
        </button>
        <button
          type="button"
          role="tab"
          class="tab shrink-0"
          :class="{ 'tab-active': activeTab === 'comment' }"
          :aria-selected="activeTab === 'comment'"
          aria-controls="profile-panel-comment"
          @click="switchTab('comment')"
        >
          我的评论/回复
        </button>
        <button
          type="button"
          role="tab"
          class="tab shrink-0"
          :class="{ 'tab-active': activeTab === 'inbox' }"
          :aria-selected="activeTab === 'inbox'"
          aria-controls="profile-panel-inbox"
          @click="switchTab('inbox')"
        >
          收到评论
        </button>
        <button
          type="button"
          role="tab"
          class="tab shrink-0"
          :class="{ 'tab-active': activeTab === 'dashboard' }"
          :aria-selected="activeTab === 'dashboard'"
          aria-controls="profile-panel-dashboard"
          @click="switchTab('dashboard')"
        >
          数据看板
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
