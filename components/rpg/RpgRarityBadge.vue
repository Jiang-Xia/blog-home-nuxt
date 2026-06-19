<script setup lang="ts">
/** 稀有度徽章：展示字段来自 API 的 rarityLabel / rarityColor / rarityIcon */
import type { RarityDisplayFields } from '~~/types/rpg';

defineOptions({ inheritAttrs: false });

const props = defineProps<RarityDisplayFields>();

const displayColor = computed(() => props.rarityColor || '#94a3b8');
</script>

<template>
  <span
    v-if="rarity || rarityLabel"
    class="badge badge-xs inline-flex items-center gap-1 whitespace-nowrap border px-2"
    :class="$attrs.class"
    :style="{
      backgroundColor: displayColor + '20',
      color: displayColor,
      borderColor: displayColor,
    }"
  >
    <template v-if="rarityIcon">{{ rarityIcon }} </template>
    {{ rarityLabel || rarity }}
  </span>
</template>
