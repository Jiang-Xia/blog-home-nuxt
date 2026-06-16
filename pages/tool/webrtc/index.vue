<template>
  <CyberToolCard title="WebRTC 调试" desc="信令与视频通话组件测试">
    <div class="space-y-6">
      <ClientComponent />
      <VideoChat />
    </div>
  </CyberToolCard>
</template>

<script setup lang="ts">
import ClientComponent from './components/ClientComponent.client.vue';
import VideoChat from './components/VideoChat.client.vue';
</script>
