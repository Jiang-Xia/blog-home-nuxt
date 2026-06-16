<script setup lang="ts">
/**
   * 用户个人中心页面 - 使用 daisyUI tabs 组织内容
   */
import { ref, watch, onMounted } from 'vue';
import { getToken, TokenKey } from '@/utils/cookie';
import { getUserInfo } from '~~/api/index';
import { messageWarning } from '@/utils/toast';

const { frame: avatarFrame, fetchStatus } = useEquippedAvatarFrame();

const route = useRoute();
const router = useRouter();
const token = useToken();
const userInfo = useUserInfo();

type ProfileTab = 'card' | 'article' | 'collect' | 'comment';
const TAB_VALUES: ProfileTab[] = ['card', 'article', 'collect', 'comment'];

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

definePageMeta({
  layout: 'default',
});

useHead({
  title: '个人中心',
});

onMounted(async () => {
  const currentToken = token.value || getToken(TokenKey);
  if (!currentToken) {
    messageWarning('请先登录后再访问个人中心');
    router.replace({
      path: '/login',
      query: { redirect: route.fullPath },
    });
    return;
  }
  if (!userInfo.value?.uid) {
    try {
      userInfo.value = await getUserInfo();
    }
    catch {
      // 错误由全局拦截器处理
    }
  }
  fetchStatus().catch(() => {});
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
      <div role="tablist" class="tabs tabs-border mb-4">
        <a
          role="tab"
          class="tab"
          :class="{ 'tab-active': activeTab === 'card' }"
          @click="activeTab = 'card'"
        >
          我的名片
        </a>
        <a
          role="tab"
          class="tab"
          :class="{ 'tab-active': activeTab === 'article' }"
          @click="activeTab = 'article'"
        >
          我的文章
        </a>
        <a
          role="tab"
          class="tab"
          :class="{ 'tab-active': activeTab === 'collect' }"
          @click="activeTab = 'collect'"
        >
          我的收藏
        </a>
        <a
          role="tab"
          class="tab"
          :class="{ 'tab-active': activeTab === 'comment' }"
          @click="activeTab = 'comment'"
        >
          我的评论/回复
        </a>
      </div>

      <!-- 标签页内容 -->
      <client-only>
        <!-- 我的名片 -->
        <div v-show="activeTab === 'card'" class="card-tab-panel">
          <UserBusinessCard />
        </div>

        <!-- 我的文章 -->
        <div v-show="activeTab === 'article'">
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
        <div v-show="activeTab === 'collect'">
          <CyberCard class="!p-5">
            <h3 class="mb-3 text-base font-semibold text-tech">
              我的收藏
            </h3>
            <UserCollectList />
          </CyberCard>
        </div>

        <!-- 评论/回复 -->
        <div v-show="activeTab === 'comment'">
          <CyberCard class="!p-5">
            <h3 class="mb-3 text-base font-semibold text-tech">
              我的评论/回复
            </h3>
            <UserCommentReplyList />
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
