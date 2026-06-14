<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :class="variant === 'primary' ? 'cyber-btn-primary' : 'cyber-btn-secondary'"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components';

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
