<script setup lang="ts">
/**
   * Cyber 主题悬浮操作按钮（FAB）
   * 毛玻璃底 + 霓虹描边 + `--tech-*` 令牌，供全站浮层入口复用
   */
withDefaults(
  defineProps<{
    ariaLabel: string;
    hint?: string;
    placement?: 'bottom-right' | 'bottom-left';
    /** 自定义距底偏移，默认避开 backtop / RPG FAB */
    bottom?: string;
  }>(),
  {
    placement: 'bottom-right',
    bottom: undefined,
  },
);

defineEmits<{ click: [] }>();
</script>

<template>
  <div
    class="cyber-fab"
    :class="placement === 'bottom-left' ? 'cyber-fab--left' : 'cyber-fab--right'"
    :style="bottom ? { bottom } : undefined"
  >
    <div
      v-if="hint"
      class="cyber-fab__hint hidden sm:block"
      :class="placement === 'bottom-left' ? 'cyber-fab__hint--left' : 'cyber-fab__hint--right'"
    >
      {{ hint }}
    </div>
    <button type="button" class="cyber-fab__btn" :aria-label="ariaLabel" @click="$emit('click')">
      <span class="cyber-fab__glow" aria-hidden="true" />
      <span class="cyber-fab__icon">
        <slot />
      </span>
    </button>
  </div>
</template>
