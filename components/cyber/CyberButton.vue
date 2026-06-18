<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="variant === 'primary' ? 'cyber-btn-primary' : 'cyber-btn-secondary'"
    v-bind="$attrs"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :class="variant === 'primary' ? 'cyber-btn-primary' : 'cyber-btn-secondary'"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary';
    to?: string;
    type?: 'button' | 'submit' | 'reset';
  }>(),
  {
    variant: 'primary',
    type: 'button',
  },
);
</script>
