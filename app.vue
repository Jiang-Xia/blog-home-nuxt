<template>
  <!-- 需要个默认布局 因为default.vue中使用NuxtChild 所以app是所有页面的父级组件 必须存在！ -->
  <UApp>
    <NuxtLayout />
  </UApp>
</template>

<script setup lang="ts">
import '@/styles/index.less';
import './utils/editor-config';
import { fnTextPopup } from './utils/plugins';

onMounted(() => {
  fnTextPopup([
    '富强',
    '民主',
    '文明',
    '和谐',
    '自由',
    '平等',
    '公正',
    '法治',
    '爱国',
    '敬业',
    '诚信',
    '友善',
  ]);
});
</script>
