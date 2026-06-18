<script setup lang="ts">
import { TOOL_LINKS } from '@/utils/constant';

const route = useRoute();

const selectedTool = computed(() => TOOL_LINKS.find(item => item.path === route.path));
</script>

<template>
  <div>
    <div class="cyber-glass-card mb-4 p-4 md:hidden">
      <div class="dropdown w-full">
        <button tabindex="0" class="cyber-btn-secondary w-full justify-start !py-2.5">
          <xia-icon :icon="selectedTool?.icon || 'blog-tool'" class="mr-2" />
          <span>{{ selectedTool?.title || '选择工具' }}</span>
        </button>
        <ul
          tabindex="0"
          class="menu dropdown-content z-50 mt-2 w-full rounded-xl border border-tech bg-[var(--tech-dropdown-bg)] p-2 shadow-xl backdrop-blur-xl"
        >
          <li v-for="item in TOOL_LINKS" :key="item.path">
            <NuxtLink
              :to="item.path"
              class="text-tech-muted hover:text-primary"
              :class="{ 'text-primary': route.path === item.path }"
            >
              <xia-icon :icon="item.icon" class="mr-2" />
              <span>{{ item.title }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <div class="mb-6 hidden flex-wrap justify-center gap-2 md:flex">
      <NuxtLink
        v-for="item in TOOL_LINKS"
        :key="item.path"
        :to="item.path"
        :class="[
          'rounded-xl px-4 py-2 text-sm no-underline transition-all',
          route.path === item.path
            ? 'bg-primary/20 text-primary border border-primary/30'
            : 'border border-tech text-tech-muted hover:border-primary/30 hover:bg-tech-header hover:text-tech',
        ]"
      >
        <xia-icon :icon="item.icon" class="mr-1.5 inline" />
        {{ item.title }}
      </NuxtLink>
    </div>
  </div>
</template>
