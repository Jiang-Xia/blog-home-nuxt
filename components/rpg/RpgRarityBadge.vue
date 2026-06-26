<script setup lang="ts">
/** 稀有度徽章：展示字段来自 API 的 rarityLabel / rarityColor / rarityIcon */
import type { RarityDisplayFields } from '~~/types/rpg';
import { getRarityBadgePresentation } from '~~/utils/rpg-rarity';

defineOptions({ inheritAttrs: false });

const props = defineProps<RarityDisplayFields>();

const badgePresentation = computed(() => getRarityBadgePresentation(props));
</script>

<template>
  <span
    v-if="rarity || rarityLabel"
    class="badge badge-xs inline-flex items-center gap-1 whitespace-nowrap border px-2"
    :class="[$attrs.class, badgePresentation.class]"
    :style="badgePresentation.style"
  >
    <template v-if="rarityIcon">{{ rarityIcon }} </template>
    {{ rarityLabel || rarity }}
  </span>
</template>
