<script setup lang="ts">
import { NAV_LINKS } from '@/utils/constant';

const route = useRoute();

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
    <ul
      class="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto px-1 lg:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <li
        v-for="item in NAV_LINKS"
        :key="item.path"
        class="shrink-0 rounded-xl transition-colors"
        :class="isActive(item.path) && 'bg-[var(--tech-nav-active-bg)]'"
      >
        <NuxtLink
          :to="item.path"
          :class="[
            'cyber-nav-link block no-underline',
            isActive(item.path) && 'cyber-nav-link-active',
            item.highlight && 'rpg-nav-link',
          ]"
        >
          <span v-if="item.icon" class="mr-0.5">{{ item.icon }}</span>{{ item.title }}
        </NuxtLink>
      </li>
    </ul>

    <!-- Right actions -->
    <div class="flex shrink-0 items-center gap-1 sm:gap-2">
      <slot name="actions" />
    </div>
  </nav>
</template>
