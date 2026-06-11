<script setup lang="ts">
/**
   * RPG 冒险模块 - 冒险状态、等级奖励、抽奖与排行榜
   */
import { ref, watch } from 'vue';

const route = useRoute();
const router = useRouter();

const activeTab = ref<'status' | 'leaderboard'>('status');

definePageMeta({
  layout: 'default',
});

useHead({
  title: 'RPG 冒险',
});

watch(
  () => route.query.tab,
  (tab) => {
    if (tab === 'leaderboard') {
      activeTab.value = 'leaderboard';
    }
  },
  { immediate: true },
);

const switchTab = (tab: 'status' | 'leaderboard') => {
  activeTab.value = tab;
  router.replace({ query: tab === 'leaderboard' ? { tab: 'leaderboard' } : {} });
};
</script>

<template>
  <div class="rpg-page padding-top-bar">
    <div class="page-container">
      <div class="page-header">
        <NuxtLink to="/user/profile" class="back-link"> ← 返回个人中心 </NuxtLink>
        <h1 class="page-title">
          ⚔️ RPG 冒险
        </h1>
        <p class="page-desc">
          签到升级、完成任务，在博客世界里不断冒险
        </p>
      </div>

      <div role="tablist" class="tabs tabs-border mb-4">
        <a
          role="tab"
          class="tab"
          :class="{ 'tab-active': activeTab === 'status' }"
          @click="switchTab('status')"
        >
          冒险状态
        </a>
        <a
          role="tab"
          class="tab"
          :class="{ 'tab-active': activeTab === 'leaderboard' }"
          @click="switchTab('leaderboard')"
        >
          冒险排行
        </a>
      </div>

      <client-only>
        <!-- 冒险状态 -->
        <div v-show="activeTab === 'status'">
          <div class="card bg-base-100 shadow-md">
            <div class="card-body p-4 sm:p-5">
              <RpgProfileCard />
            </div>
          </div>

          <div class="card bg-base-100 shadow-md mt-5">
            <div class="card-body p-5">
              <RpgLevelRewardsPanel />
            </div>
          </div>

          <div class="card bg-base-100 shadow-md mt-5">
            <div class="card-body p-5">
              <RpgLotteryBox />
            </div>
          </div>
        </div>

        <!-- 冒险排行 -->
        <div v-show="activeTab === 'leaderboard'">
          <div class="card bg-base-100 shadow-md">
            <div class="card-body p-5">
              <h3 class="card-title text-base mb-3">
                冒险排行榜
              </h3>
              <RpgLeaderboardPanel />
            </div>
          </div>
        </div>
      </client-only>
    </div>
  </div>
</template>

<style scoped>
  .rpg-page {
    min-height: 100vh;
    padding: 104px 16px 32px;
  }

  .page-container {
    max-width: 960px;
    margin: 0 auto;
  }

  .page-header {
    text-align: center;
    margin-bottom: 24px;
    position: relative;
  }

  .back-link {
    position: absolute;
    left: 0;
    top: 4px;
    font-size: 13px;
    color: #3b82f6;
    font-weight: 600;
    text-decoration: none;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  .page-title {
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 6px;
  }

  .page-desc {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }
</style>
