<template>
  <div>
    <NuxtPage />
  </div>
</template>
<script setup lang="ts">
  definePageMeta({
    pageTransition: {
      name: 'scale',
      appear: true,
      mode: 'out-in',
    },
  })
</script>
