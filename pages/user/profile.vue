<script setup lang="ts">
/**
   * 用户个人中心页面 - 使用 daisyUI tabs 组织内容
   */
import { ref, watch } from 'vue';

const route = useRoute();
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
</script>

<template>
  <CyberPageContainer label="PROFILE" title="个人中心" subtitle="管理你的资料与内容">
    <div class="profile-container">
      <div v-if="userInfo?.nickname && activeTab !== 'card'" class="cyber-glass-card mb-6 p-5">
        <div class="card-body flex-row items-center gap-4 p-5">
          <div class="avatar placeholder">
            <div
              class="bg-primary text-primary-content rounded-full w-16 ring ring-primary/20 ring-offset-2 ring-offset-base-100"
            >
              <img v-if="userInfo.avatar" :src="userInfo.avatar" :alt="userInfo.nickname">
              <span v-else class="text-2xl font-bold">
                {{ userInfo.nickname?.charAt(0) || '?' }}
              </span>
            </div>
          </div>
          <div>
            <h2 class="card-title text-lg">
              {{ userInfo.nickname }}
            </h2>
            <p v-if="userInfo.intro" class="text-sm text-base-content/60 mt-1">
              {{ userInfo.intro }}
            </p>
          </div>
        </div>
      </div>

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
          <div class="cyber-glass-card p-5">
            <div class="card-body p-5">
              <div class="flex items-center justify-between gap-3 mb-2">
                <h3 class="card-title text-base">
                  我的文章
                </h3>
                <NuxtLink to="/user/article/edit" class="btn btn-primary btn-sm"> 写文章 </NuxtLink>
              </div>
              <UserArticleList />
            </div>
          </div>
        </div>

        <!-- 收藏 -->
        <div v-show="activeTab === 'collect'">
          <div class="cyber-glass-card p-5">
            <div class="card-body p-5">
              <h3 class="card-title text-base">
                我的收藏
              </h3>
              <UserCollectList />
            </div>
          </div>
        </div>

        <!-- 评论/回复 -->
        <div v-show="activeTab === 'comment'">
          <div class="cyber-glass-card p-5">
            <div class="card-body p-5">
              <h3 class="card-title text-base">
                我的评论/回复
              </h3>
              <UserCommentReplyList />
            </div>
          </div>
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
