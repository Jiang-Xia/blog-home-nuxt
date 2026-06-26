<script setup lang="ts">
/**
   * 史诗/传说物品获得全屏揭晓（非抽奖来源 itemGranted WS）
   * 复用抽奖彩带与揭晓音效，与 DrawOverlay 揭晓阶段视觉对齐
   */
import type { RpgItemGrantedPayload } from '~~/composables/use-realtime-socket';
import { itemGrantedSfxKey } from '~~/constants/rpg-audio';
import { getRarityGlow, rarityLabelToTier } from '~~/utils/rpg-rarity';

const props = defineProps<{
  visible: boolean;
  data: RpgItemGrantedPayload | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { playSfx } = useRpgAudio();

const revealReady = ref(false);
let readyTimer: ReturnType<typeof setTimeout> | null = null;

const tier = computed(() => rarityLabelToTier(props.data?.config?.rarityLabel));
const glowStyle = computed(() => ({ '--rarity-glow': getRarityGlow(tier.value) }));

const clearReadyTimer = () => {
  if (readyTimer) {
    clearTimeout(readyTimer);
    readyTimer = null;
  }
};

/** 弹窗打开：延迟卡片入场 + 按稀有度播音（handler 侧不再重复） */
watch(
  () => props.visible,
  (v) => {
    clearReadyTimer();
    revealReady.value = false;
    if (!v || !props.data) return;
    void playSfx(itemGrantedSfxKey(props.data.config?.rarityLabel));
    readyTimer = setTimeout(() => {
      revealReady.value = true;
    }, 120);
  },
);

onUnmounted(clearReadyTimer);

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="item-reveal">
      <div v-if="visible && data" class="item-reveal-overlay" @click="handleClose">
        <div class="overlay-rays" aria-hidden="true" />
        <RpgLotteryConfetti :active="visible" :rarity="tier" density="high" />

        <div class="reveal-panel" @click.stop>
          <div class="reveal-card" :class="{ ready: revealReady }" :style="glowStyle">
            <div class="reveal-banner">
              ✨ 恭喜获得 ✨
            </div>
            <RpgRarityBadge
              class="reveal-rarity"
              :rarity="tier"
              :rarity-label="data.config?.rarityLabel"
              :rarity-color="data.config?.rarityColor"
            />
            <RpgItemIcon
              class="reveal-item-icon"
              :icon="data.config?.icon"
              :icon-url="data.config?.iconUrl"
              :bg-url="data.config?.bgUrl"
              :item-type-icon="data.config?.itemTypeIcon"
              :rarity-color="data.config?.rarityColor"
              size="lg"
            />
            <div class="reveal-name">
              {{ data.config?.name || data.itemCode }}
            </div>
            <div v-if="data.config?.itemTypeLabel" class="reveal-meta">
              {{ data.config.itemTypeLabel }} · x{{ data.quantity }}
            </div>
            <div v-if="data.sourceLabel" class="reveal-source">
              来源：{{ data.sourceLabel }}
            </div>
          </div>
          <p class="reveal-hint">
            点击任意处收下奖励
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .item-reveal-overlay {
    position: fixed;
    inset: 0;
    z-index: 10080;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 0.72);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    overflow: hidden;
  }

  .overlay-rays {
    position: absolute;
    inset: -20%;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      rgb(251 191 36 / 0.08) 30deg,
      transparent 60deg,
      rgb(139 92 246 / 0.06) 120deg,
      transparent 150deg,
      rgb(59 130 246 / 0.06) 210deg,
      transparent 240deg,
      rgb(251 191 36 / 0.08) 300deg,
      transparent 330deg
    );
    animation: raysSpin 8s linear infinite;
    pointer-events: none;
  }

  .reveal-panel {
    position: relative;
    z-index: 3;
    text-align: center;
    padding: 0 1rem;
    max-width: 420px;
    width: 100%;
  }

  .reveal-card {
    background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
    border: 2px solid rgb(148 163 184 / 0.35);
    border-radius: 20px;
    padding: 28px 24px 24px;
    box-shadow: var(--rarity-glow);
    transform: scale(0.82);
    opacity: 0;
    transition:
      transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.35s ease;
  }

  .reveal-card.ready {
    transform: scale(1);
    opacity: 1;
  }

  .reveal-banner {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.14em;
    color: #fde68a;
    margin-bottom: 16px;
  }

  .reveal-rarity {
    margin-bottom: 10px;
  }

  .reveal-item-icon {
    margin: 0 auto 12px;
  }

  .reveal-name {
    font-size: 22px;
    font-weight: 800;
    color: #f8fafc;
    line-height: 1.35;
    margin-bottom: 8px;
  }

  .reveal-meta {
    font-size: 14px;
    color: #94a3b8;
    margin-bottom: 6px;
  }

  .reveal-source {
    font-size: 12px;
    color: #64748b;
  }

  .reveal-hint {
    margin-top: 18px;
    font-size: 12px;
    color: rgb(248 250 252 / 0.55);
  }

  @keyframes raysSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .item-reveal-enter-active {
    animation: overlayIn 0.28s ease;
  }

  .item-reveal-leave-active {
    animation: overlayIn 0.2s ease reverse;
  }

  @keyframes overlayIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
