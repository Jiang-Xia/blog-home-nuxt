<script setup lang="ts">
import Cookies from 'js-cookie';
import dayjs from 'dayjs';

const runTime = Math.ceil((dayjs().unix() - dayjs('2022-03-01').unix()) / (24 * 60 * 60));

onMounted(() => {
  if (!Cookies.get('browserId')) {
    Cookies.set('browserId', dayjs().valueOf().toString(), { expires: 7 });
  }
});
</script>

<template>
  <div class="custom-layout-container tech-shell min-h-screen bg-tech-shell text-tech">
    <CyberBackground />
    <header
      class="fixed inset-x-0 top-0 z-[10010] border-b border-tech bg-tech-header backdrop-blur-md"
    >
      <Nav />
    </header>
    <div class="min-h-[calc(100vh-120px)] pt-16">
      <NuxtPage />
    </div>
    <footer
      class="flex flex-col items-center justify-center border-t border-tech px-4 py-6 text-xs leading-relaxed text-tech-subtle"
    >
      <p>博客已平稳运行 {{ runTime }} 天</p>
      <p>
        <NuxtLink
          target="_blank"
          href="https://beian.miit.gov.cn/#/Integrated/recordQuery"
          class="text-tech-subtle hover:text-tech-muted"
        >
          桂ICP备2022001119-1
        </NuxtLink>
      </p>
    </footer>
  </div>
</template>
