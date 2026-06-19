<script setup lang="ts">
/**
   * 神作晋升动画
   */
import type { RpgMasterpiecePayload } from '~~/composables/use-realtime-socket';

const props = defineProps<{
  visible: boolean;
  data: RpgMasterpiecePayload | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Transition name="masterpiece">
    <div v-if="visible && data" class="masterpiece-overlay" @click="handleClose">
      <div class="masterpiece-modal" @click.stop>
        <div class="masterpiece-badge">
          ✨ 神作诞生 ✨
        </div>
        <div class="masterpiece-title">
          {{ data.articleTitle }}
        </div>
        <p class="masterpiece-desc">
          你的文章已晋升神作，继续创作吧！
        </p>
        <button class="close-btn" @click="handleClose">
          太棒了！
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
  .masterpiece-overlay {
    position: fixed;
    inset: 0;
    background: var(--rpg-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .masterpiece-modal {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%);
    border-radius: 20px;
    padding: 32px 48px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(245, 158, 11, 0.4);
    min-width: 300px;
    max-width: 420px;
  }

  .masterpiece-badge {
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #92400e;
    margin-bottom: 16px;
    animation: pulse 1.2s infinite;
  }

  .masterpiece-title {
    font-size: 20px;
    font-weight: 700;
    color: #78350f;
    margin-bottom: 12px;
    line-height: 1.4;
  }

  .masterpiece-desc {
    font-size: 14px;
    color: #92400e;
    margin-bottom: 24px;
  }

  .close-btn {
    padding: 8px 32px;
    border-radius: 8px;
    background: #92400e;
    color: white;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
  }

  .close-btn:hover {
    background: #78350f;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.08);
    }
  }

  .masterpiece-enter-active {
    animation: fadeIn 0.3s ease;
  }

  .masterpiece-leave-active {
    animation: fadeIn 0.2s ease reverse;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
