<script setup lang="ts">
const props = defineProps({
  icon: {
    type: String,
    defaule: "",
  },
});
</script>
<template>
  <span class="x-icon">
    <span class="icon iconfont" :class="props.icon"></span>
  </span>
</template>
