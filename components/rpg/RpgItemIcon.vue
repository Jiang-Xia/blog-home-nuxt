<script setup lang="ts">
/**
   * RPG 物品图标：public/rpg/icons/{icon}.png|.webp|.svg → emoji
   * 展示字段来自 API config.icon / itemTypeIcon / rarityColor
   */
import { buildRpgItemAssetCandidates } from '~~/utils/rpg-item-asset';
import {
  resolveRpgItemEmoji,
  resolveRpgItemTint,
  type RpgItemIconSource,
} from '~~/utils/rpg-item-icon';

const props = withDefaults(
  defineProps<{
    icon?: string | null;
    itemTypeIcon?: string | null;
    rarityColor?: string | null;
    frameColor?: string | null;
    tinted?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    tinted: true,
    size: 'md',
  },
);

const iconSource = computed(
  () =>
      ({
        icon: props.icon,
        itemTypeIcon: props.itemTypeIcon,
      }) satisfies RpgItemIconSource,
);

const assetCandidates = computed(() => buildRpgItemAssetCandidates(iconSource.value));
const candidateIndex = ref(0);
const useEmoji = ref(false);

watch(
  assetCandidates,
  () => {
    candidateIndex.value = 0;
    useEmoji.value = assetCandidates.value.length === 0;
  },
  { immediate: true },
);

const currentSrc = computed(() => {
  if (useEmoji.value) return null;
  return assetCandidates.value[candidateIndex.value] ?? null;
});

const emoji = computed(() => resolveRpgItemEmoji(iconSource.value));

const tintStyle = computed(() => {
  if (!props.tinted) return undefined;
  const bg = resolveRpgItemTint({
    rarityColor: props.rarityColor,
    color: props.frameColor,
  });
  if (!bg) return undefined;
  return { background: bg };
});

/** 当前候选加载失败，尝试下一格式或回退 emoji */
const onImgError = () => {
  if (candidateIndex.value < assetCandidates.value.length - 1) {
    candidateIndex.value += 1;
    return;
  }
  useEmoji.value = true;
};
</script>

<template>
  <div
    class="rpg-loot-icon"
    :class="{
      'rpg-loot-icon--tinted': tinted && tintStyle,
      'rpg-loot-icon--asset': currentSrc,
      'rpg-loot-icon--sm': size === 'sm',
      'rpg-loot-icon--lg': size === 'lg',
    }"
    :style="tintStyle"
    aria-hidden="true"
  >
    <img
      v-if="currentSrc"
      :key="currentSrc"
      :src="currentSrc"
      class="rpg-loot-icon__img"
      alt=""
      @error="onImgError"
    >
    <template v-else>
      {{ emoji }}
    </template>
  </div>
</template>

<style scoped>
  .rpg-loot-icon--asset {
    color: #fff;
  }

  .rpg-loot-icon__img {
    width: 72%;
    height: 72%;
    object-fit: contain;
    filter: drop-shadow(0 1px 2px rgb(15 23 42 / 0.18));
    pointer-events: none;
  }

  .rpg-loot-icon--lg .rpg-loot-icon__img {
    width: 78%;
    height: 78%;
  }

  .rpg-loot-icon--sm .rpg-loot-icon__img {
    width: 68%;
    height: 68%;
  }

  .rpg-loot-icon--sm {
    width: 28px;
    height: 28px;
    font-size: 14px;
    border-radius: 8px;
  }

  .rpg-loot-icon--lg {
    width: 52px;
    height: 52px;
    font-size: 28px;
    border-radius: 14px;
  }
</style>
