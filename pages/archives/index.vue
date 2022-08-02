<script setup lang="ts">
import { ref } from "vue";
import { getArchives } from "@/api/article";
import dayjs from "dayjs";
// 默认展开当前年
const activeArr: string[] = [String(dayjs().year())];
const defaultActiveKey = ref(activeArr);
const {
  data: archivesInfo,
  pending,
  refresh,
  error,
} = await useAsyncData("archives_GetList", () => getArchives());
defaultActiveKey.value = Object.keys(archivesInfo.value);

useHead({
  title: "归档",
  titleTemplate: (title) => `${title} - 江夏的个人博客 - 记录生活记录你~`,
});
</script>

<template>
  <!-- default布局和custom布局只能二选一 -->
  <NuxtLayout name="main-content">
    <div class="archives-container">
      <h1 class="hidden">文章归档 - 江夏的个人博客 - 记录生活记录你~</h1>
      <div
        tabindex="0"
        class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
        v-for="(value, key) in archivesInfo"
        :key="String(key)"
      >
        <!-- 设置选择就勾选了 -->
        <input type="checkbox" checked />
        <div class="collapse-title text-xl font-medium">
          {{ key }}
        </div>
        <div class="collapse-content">
          <div v-for="(value2, key2) in value" :key="key2">
            <h4 class="month">{{ key2 }}</h4>
            <ul
              class="menu menu-compact lg:menu-normal lg:w-4/5 bg-base-100 p-2 rounded-box"
            >
              <li
                v-for="(item, index) in value2"
                :key="index"
                class="font-semibold"
              >
                <nuxt-link :to="'/detail/' + item.id" class="flex">
                  <span class="badge badge-md">{{
                    item.uTime.slice(5, 11)
                  }}</span>
                  <div class="hover:text-green-700 hover:underline">
                    {{ item["title"] }}
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
