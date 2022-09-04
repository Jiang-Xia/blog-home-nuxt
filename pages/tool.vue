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
            <xia-icon v-if="item.icon" :icon="item.icon" />
            <span>{{ item.title }}</span>
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
      title: '码',
      icon: '',
    },
    {
      path: '/tool/other',
      title: '其他',
      icon: '',
    }
  ])
</script>
<style lang="less" scoped>
  .xia-page {
    padding-top: 64px;
    .link-item {
      @apply border border-base-300 h-24 w-24 rounded-lg flex justify-center items-center mr-2 hover:bg-base-200;
    }
    .tool-children-pages {
      // min-height: 60vh
    }
  }
</style>
