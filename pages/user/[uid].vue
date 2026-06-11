<script setup lang="ts">
/** 他人公开主页 */
const route = useRoute();
const uid = computed(() => route.params.uid as string);
const { profile, articles, loading } = usePublicProfile(uid);
const userInfo = useUserInfo();

definePageMeta({ layout: 'default' });
useHead({
  title: computed(() =>
    profile.value?.nickname ? `${profile.value.nickname} 的主页` : '用户主页',
  ),
});
</script>

<template>
  <div class="public-profile padding-top-bar">
    <div class="container max-w-3xl mx-auto px-4 py-6">
      <div v-if="loading" class="text-center py-12 text-base-content/50">
        加载中...
      </div>
      <div v-else-if="profile" class="space-y-6">
        <div class="card bg-base-100 shadow-md">
          <div class="card-body">
            <div class="flex items-center gap-4">
              <div class="avatar">
                <div class="w-20 rounded-full ring ring-primary/30">
                  <img
                    :src="profile.avatar || '/assets/images/animal/qie.svg'"
                    :alt="profile.nickname"
                  >
                </div>
              </div>
              <div>
                <h1 class="text-xl font-bold">
                  {{ profile.nickname }}
                </h1>
                <p class="text-sm text-base-content/60 mt-1">
                  Lv{{ profile.level }} · 声望 {{ profile.reputation }}
                </p>
                <p v-if="profile.intro" class="text-sm mt-2">
                  {{ profile.intro }}
                </p>
              </div>
            </div>
            <RpgProfileSocialBar v-if="Number(uid) !== userInfo?.uid" :target-uid="Number(uid)" />
          </div>
        </div>

        <div v-if="profile.loadout" class="card bg-base-100 shadow-md">
          <div class="card-body">
            <h3 class="font-semibold mb-2">
              当前装扮
            </h3>
            <div class="flex flex-wrap gap-2 text-sm">
              <span v-if="profile.loadout.title" class="badge badge-warning">
                🏆 {{ profile.loadout.title.name }}
              </span>
              <span v-if="profile.loadout.avatarFrame" class="badge badge-info">
                🖼 {{ profile.loadout.avatarFrame.name }}
              </span>
              <span v-if="profile.loadout.pet" class="badge badge-success">
                🐾 {{ profile.loadout.pet.nickname || profile.loadout.pet.config?.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-md">
          <div class="card-body">
            <h3 class="font-semibold mb-3">
              已发布文章
            </h3>
            <div v-if="!articles.length" class="text-sm text-base-content/50">
              暂无文章
            </div>
            <ul v-else class="space-y-2">
              <li v-for="a in articles" :key="a.id">
                <NuxtLink :to="`/detail/${a.id}`" class="link link-hover">
                  {{ a.title }}
                  <span v-if="a.isMasterpiece" class="badge badge-sm badge-error ml-1">神作</span>
                  <span class="text-xs text-base-content/50 ml-2">Lv{{ a.articleLevel }}</span>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-12">
        用户不存在
      </div>
    </div>
  </div>
</template>

<style scoped>
  .public-profile {
    min-height: 100vh;
  }
</style>
