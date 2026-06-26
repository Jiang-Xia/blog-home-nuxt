<script setup lang="ts">
/**
   * RPG 物品图标：API iconUrl → public/rpg/icons → emoji
   * props.iconUrl/bgUrl 来自后端 enrich，勿前端拼路径；icon 键仍用于本地占位与 emoji
   */
import { buildRpgItemAssetCandidates, resolveRpgItemBgUrl } from '~~/utils/rpg-item-asset';
import {
  resolveRpgItemEmoji,
  resolveRpgItemTint,
  type RpgItemIconSource,
} from '~~/utils/rpg-item-icon';
import { isSilverRarityColor } from '~~/utils/rpg-rarity';

const props = withDefaults(
  defineProps<{
    /** 物品 icon 键，与 rpg_item_config.icon 一致 */
    icon?: string | null;
    /** 管理端上传图标 URL（API iconUrl） */
    iconUrl?: string | null;
    /** 管理端上传背景 URL（API bgUrl） */
    bgUrl?: string | null;
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

const assetCandidates = computed(() =>
  buildRpgItemAssetCandidates(iconSource.value, {
    iconUrl: props.iconUrl,
    bgUrl: props.bgUrl,
  }),
);
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

/** 银色稀有度：走 CSS 金属渐变，不用纯色底 */
const isSilverTint = computed(() => {
  if (!props.tinted || props.bgUrl) return false;
  const tintColor = props.rarityColor || props.frameColor;
  return isSilverRarityColor(tintColor);
});

/** 容器样式：有 bgUrl 时用背景图，否则用稀有度 tint */
const containerStyle = computed(() => {
  const bgImage = resolveRpgItemBgUrl(props.bgUrl);
  if (bgImage) {
    return {
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  if (!props.tinted || isSilverTint.value) return undefined;
  const bg = resolveRpgItemTint({
    rarityColor: props.rarityColor,
    color: props.frameColor,
  });
  if (!bg) return undefined;
  return { background: bg };
});

/** 有上传背景时不叠稀有度 tint，避免盖住底图 */
const isTinted = computed(
  () => props.tinted && (!!containerStyle.value || isSilverTint.value) && !props.bgUrl,
);

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
      'rpg-loot-icon--tinted': isTinted && !isSilverTint,
      'rpg-loot-icon--silver': isSilverTint,
      'rpg-loot-icon--asset': currentSrc,
      'rpg-loot-icon--bg': !!bgUrl,
      'rpg-loot-icon--sm': size === 'sm',
      'rpg-loot-icon--lg': size === 'lg',
    }"
    :style="containerStyle"
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

  .rpg-loot-icon--bg {
    border-color: rgb(255 255 255 / 0.2);
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
