<script setup lang="ts">
const userInfo = useUserInfo();

await navigateTo(userInfo.value?.uid ? '/user/profile' : '/login', { replace: true });
</script>

<template>
  <div />
</template>
