<script setup lang="ts">
import dayjs from 'dayjs';
import { getArchives } from '@/api/article';
import { SiteTitle } from '@/utils/constant';

const { data: archivesList } = await useAsyncData('archives_GetList', () => getArchives());

useHead({
  title: '归档',
  titleTemplate: title => `${title} - ${SiteTitle}`,
});
</script>

<template>
  <CyberPageContainer label="ARCHIVES" title="文章归档" subtitle="按年份浏览全部文章">
    <h1 class="hidden">
      文章归档 - {{ SiteTitle }}
    </h1>
    <div class="space-y-4">
      <div
        v-for="(archive, idx) in archivesList"
        :key="idx"
        tabindex="0"
        class="collapse collapse-arrow rounded-2xl border border-tech cyber-glass-card backdrop-blur-md"
      >
        <input type="checkbox" checked>
        <div class="collapse-title flex items-center gap-2 text-xl font-medium text-tech">
          <span class="cyber-feature-tag">{{ archive.year }}</span>
          年文章
        </div>
        <div class="collapse-content">
          <div v-for="(value2, key2) in archive.data" :key="key2" class="mb-4">
            <h4 class="mb-2 border-b border-tech pb-1 text-sm font-medium text-tech-muted">
              {{ key2 }}
            </h4>
            <ul class="space-y-1">
              <li v-for="(item, index) in value2" :key="index">
                <NuxtLink
                  :to="'/detail/' + item.id"
                  class="group flex items-center gap-3 rounded-xl px-2 py-2 no-underline transition-colors hover:bg-tech-header"
                >
                  <span class="badge badge-neutral badge-sm min-w-fit shrink-0 font-mono text-xs">{{
                    dayjs(item.createTime).format('MM-DD')
                  }}</span>
                  <span class="flex-1 text-sm text-tech group-hover:text-primary transition-colors">
                    {{ item['title'] }}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="shrink-0 text-tech-faint opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </CyberPageContainer>
</template>
