<script setup lang="ts">
/**
   * 用户个人中心页面 - 使用 daisyUI tabs 组织内容
   */
import { ref } from 'vue';

const userInfo = useUserInfo();
const { theme, clickIcon } = useThemeActions();

/** 当前激活的标签页 */
const activeTab = ref<'card' | 'collect' | 'comment'>('card');

definePageMeta({
  layout: 'default',
});

useHead({
  title: '个人中心',
});
</script>

<template>
  <div class="profile-page padding-top-bar">
    <!-- 顶部闪烁网格背景 -->
    <div class="absolute inset-0 z-10" style="height: 104px">
      <InFlickeringGrid
        class="relative inset-0 z-0 [mask-image:radial-gradient(650px_circle_at_center,white,transparent)]"
        :square-size="4"
        :grid-gap="6"
        color="#4ba6c6"
        :max-opacity="0.5"
        :flicker-chance="0.1"
      />
      <xia-icon
        class="cursor-pointer px-3 absolute right-2 top-10 text-white"
        :icon="'blog-' + theme"
        @click="clickIcon"
      />
    </div>

    <div class="profile-container">
      <!-- 用户基础信息 -->
      <div v-if="userInfo?.nickname" class="card bg-base-100 shadow-md mb-6">
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
              {{
                userInfo.intro
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- daisyUI 标签页 -->
      <div role="tablist" class="tabs tabs-boxed mb-4">
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
          :class="{ 'tab-active': activeTab === 'collect' }"
          @click="activeTab = 'collect'"
        >
          收藏
        </a>
        <a
          role="tab"
          class="tab"
          :class="{ 'tab-active': activeTab === 'comment' }"
          @click="activeTab = 'comment'"
        >
          评论/回复
        </a>
      </div>

      <!-- 标签页内容 -->
      <client-only>
        <!-- 我的名片 -->
        <div v-show="activeTab === 'card'">
          <div class="card bg-base-100 shadow-md">
            <div class="card-body p-5">
              <h3 class="card-title text-base">
                RPG 冒险状态
              </h3>
              <RpgStatusPanel />
            </div>
          </div>

          <div class="card bg-base-100 shadow-md mt-5">
            <div class="card-body p-5">
              <RpgLotteryBox />
            </div>
          </div>
        </div>

        <!-- 收藏 -->
        <div v-show="activeTab === 'collect'">
          <div class="card bg-base-100 shadow-md">
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
          <div class="card bg-base-100 shadow-md">
            <div class="card-body p-5">
              <h3 class="card-title text-base">
                评论与回复
              </h3>
              <UserCommentReplyList />
            </div>
          </div>
        </div>
      </client-only>
    </div>
  </div>
</template>

<style scoped>
  .profile-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #f0f9ff, #e0f2fe);
    padding: 104px 16px 32px;
  }

  .profile-container {
    padding-top: 20px;
    max-width: 560px;
    margin: 0 auto;
  }

  .loading-state {
    text-align: center;
    color: #94a3b8;
    padding: 24px;
  }
</style>
