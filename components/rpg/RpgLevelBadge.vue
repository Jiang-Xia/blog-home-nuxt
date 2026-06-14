<script setup lang="ts">
/**
   * RPG 等级徽章 — 作者 Lv / 文章 Lv 通用展示
   */
const props = withDefaults(
  defineProps<{
    level: number;
    variant?: 'author' | 'article' | 'masterpiece';
    size?: 'xs' | 'sm';
  }>(),
  {
    variant: 'author',
    size: 'xs',
  },
);

const label = computed(() => {
  if (props.variant === 'masterpiece') return '神作';
  if (props.variant === 'article') return `文 Lv${props.level}`;
  return `Lv.${props.level}`;
});

const badgeClass = computed(() => {
  if (props.variant === 'masterpiece') {
    return 'rpg-badge-masterpiece';
  }
  if (props.variant === 'article') {
    return 'rpg-badge-article';
  }
  return 'rpg-badge-author';
});
</script>

<template>
  <span
    class="rpg-level-badge inline-flex shrink-0 items-center rounded-md font-bold text-white"
    :class="[badgeClass, size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-1.5 py-px text-[10px]']"
    :title="
      variant === 'author'
        ? `作者等级 ${level}`
        : variant === 'article'
          ? `文章等级 ${level}`
          : '神作'
    "
  >
    {{ label }}
  </span>
</template>

<style scoped>
  .rpg-badge-author {
    background: var(--rpg-level-badge-gradient);
    box-shadow: 0 1px 3px var(--rpg-level-shadow);
  }

  .rpg-badge-article {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    box-shadow: 0 1px 3px rgb(79 70 229 / 0.35);
  }

  .rpg-badge-masterpiece {
    background: linear-gradient(135deg, #f472b6, #ec4899);
    box-shadow: 0 1px 3px rgb(236 72 153 / 0.35);
  }
</style>
