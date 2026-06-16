<template>
  <CyberCard :class="['flex flex-col', widthClass, props.class]">
    <h2 v-if="title" class="mb-3 flex items-center gap-2 text-lg font-semibold text-tech">
      <slot name="icon" />
      {{ title }}
    </h2>
    <p v-if="desc" class="mb-4 text-sm text-tech-muted">
      {{ desc }}
    </p>
    <slot />
  </CyberCard>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    desc?: string;
    widthClass?: string;
    class?: string;
  }>(),
  {
    title: '',
    desc: '',
    widthClass: 'w-full',
    class: '',
  },
);
</script>
