<template>
  <CyberToolCard
    title="WebRTC 调试"
    desc="媒体采集、本页回环与双 Tab P2P 联调，用于验证摄像头权限、编解码与 ICE 信令流程"
  >
    <div class="space-y-10">
      <ClientComponent />
      <div class="divider divider-neutral opacity-30" />
      <VideoChat />
    </div>
  </CyberToolCard>
</template>

<script setup lang="ts">
import ClientComponent from './components/ClientComponent.client.vue';
import VideoChat from './components/VideoChat.client.vue';
</script>
