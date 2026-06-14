<script setup lang="ts">
const route = useRoute();

const navLinks = [
  { path: '/', title: '首页', hash: '' },
  { path: '/download', title: '快速入口', hash: '' },
  { path: '/features', title: '特性', hash: '' },
  { path: '/archives', title: '归档', hash: '' },
  { path: '/tool', title: '工具箱', hash: '' },
  { path: '/about', title: '关于', hash: '' },
];

function isActive(path: string) {
  if (path === '/') return route.path === '/';
  return route.path === path || route.path.startsWith(path + '/');
}
</script>

<template>
  <nav class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
    <!-- Logo -->
    <NuxtLink to="/" class="flex shrink-0 items-center gap-2.5 no-underline">
      <div class="cyber-logo-badge flex h-9 w-9 items-center justify-center rounded-xl">
        <span class="text-sm font-bold cyber-gradient-text">X</span>
      </div>
      <span class="hidden text-lg font-semibold text-tech sm:inline">Xia</span>
    </NuxtLink>

    <!-- Center links -->
    <ul class="hidden items-center gap-1 lg:flex">
      <li v-for="item in navLinks" :key="item.path">
        <NuxtLink
          :to="item.path"
          :class="['cyber-nav-link no-underline', isActive(item.path) && 'cyber-nav-link-active']"
        >
          {{ item.title }}
        </NuxtLink>
      </li>
    </ul>

    <!-- Right actions -->
    <div class="flex shrink-0 items-center gap-1 sm:gap-2">
      <slot name="actions" />
    </div>
  </nav>
</template>
