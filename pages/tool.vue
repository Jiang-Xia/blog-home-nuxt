<template>
  <div class="padding-top-bar xia-page">
    <div class="pt-4 px-4">
      <ul class="flex">
        <li v-for="item in menuList" :key="item.path">
          <NuxtLink
            :to="item.path"
            :title="item.title"
            class="link-item"
          >
            <xia-icon v-if="item.icon" width="40px" height="40px" :icon="item.icon" />

            <span class="mt-2">{{ item.title }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <section class="tool-children-pages">
      <NuxtPage />
    </section>
  </div>
</template>

<script setup lang="ts">
  const menuList = ref([
    {
      path: '/tool/code',
      title: '条形/二维码',
      icon: 'blog-erweima',
    },
    {
      path: '/tool/other',
      title: '其他工具',
      icon: 'blog-qita',
    },
    {
      path: '/au-vi',
      title: '音视频',
      icon: 'blog-shipin1',
    }
  ])
</script>
<style lang="less" scoped>
  .xia-page {
    padding-top: 64px;
    .link-item {
      @apply transition border border-base-300 h-36 w-36 text-sm rounded-lg flex flex-col justify-center items-center mr-2 hover:bg-base-200;
      @apply hover:scale-105 active:bg-base-300;
    }
    .tool-children-pages {
      // min-height: 60vh
    }
  }
</style>
