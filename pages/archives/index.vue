<script setup lang="ts">
  import { ref } from 'vue'
  import dayjs from 'dayjs'
  import { getArchives } from '@/api/article'
  // 默认展开当前年
  const activeArr: string[] = [String(dayjs().year())]
  const defaultActiveKey = ref(activeArr)
  const { data: archivesList, } = await useAsyncData('archives_GetList', () => getArchives())
  defaultActiveKey.value = Object.keys(archivesList.value)

  useHead({
    title: '归档',
    titleTemplate: title => `${title} - 江夏的博客`,
  })
</script>

<template>
  <!-- default布局和custom布局只能二选一 -->
  <NuxtLayout name="main-content">
    <div class="archives-container">
      <h1 class="hidden"> 文章归档 - 江夏的博客 </h1>
      <div
        v-for="(archive, idx) in archivesList"
        :key="idx"
        tabindex="0"
        class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box shadow-xl mb-4"
      >
        <!-- 设置选择就勾选了 -->
        <input type="checkbox" checked>
        <div class="collapse-title text-xl font-medium">
          {{ archive.year }}
        </div>
        <div class="collapse-content">
          <div v-for="(value2, key2) in archive.data" :key="key2">
            <h4 class="month">
              {{ key2 }}
            </h4>
            <ul class="menu menu-compact lg:menu-normal lg:w-4/5 bg-base-100 p-2 rounded-box">
              <li v-for="(item, index) in value2" :key="index" class="font-semibold">
                <nuxt-link :to="'/detail/' + item.id" class="flex">
                  <span class="badge badge-md min-w-fit">{{
                    dayjs(item.createTime).format('YYYY-MM-DD')
                  }}</span>
                  <div class="hover:text-green-700 hover:underline flex-1">
                    {{ item['title'] }}
                  </div>
                </nuxt-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
<style lang="less" scoped>
  .archives-container {
    min-height: 100%;
    .month {
      color: var(--text-color);
      font-weight: normal;
      font-size: 16px;
    }
  }
</style>
