<script setup lang="ts">
/**
   * 成就达成弹窗
   */
const props = defineProps<{
  visible: boolean;
  name: string;
  expReward?: number;
}>();

const emit = defineEmits<{
  close: [];
}>();

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Transition name="achievement">
    <div v-if="visible" class="achievement-overlay" @click="handleClose">
      <div class="achievement-modal" @click.stop>
        <div class="achievement-badge">
          🏆 成就达成
        </div>
        <div class="achievement-name">
          {{ name }}
        </div>
        <div v-if="expReward" class="achievement-reward">
          +{{ expReward }} EXP
        </div>
        <button class="close-btn" @click="handleClose">
          太棒了！
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
  .achievement-overlay {
    position: fixed;
    inset: 0;
    background: var(--rpg-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10060;
  }

  .achievement-modal {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%);
    border-radius: 20px;
    padding: 32px 40px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
    min-width: 280px;
    max-width: 360px;
  }

  .achievement-badge {
    font-size: 14px;
    font-weight: 700;
    color: #92400e;
    margin-bottom: 12px;
    letter-spacing: 0.05em;
  }

  .achievement-name {
    font-size: 22px;
    font-weight: 800;
    color: #78350f;
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .achievement-reward {
    font-size: 16px;
    font-weight: 700;
    color: #b45309;
    margin-bottom: 20px;
  }

  .close-btn {
    padding: 10px 28px;
    border: none;
    border-radius: 999px;
    background: #78350f;
    color: #fef3c7;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .close-btn:hover {
    opacity: 0.9;
  }

  .achievement-enter-active,
  .achievement-leave-active {
    transition: opacity 0.25s ease;
  }

  .achievement-enter-from,
  .achievement-leave-to {
    opacity: 0;
  }
</style>
