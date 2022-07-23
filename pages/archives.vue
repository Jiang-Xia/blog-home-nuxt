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
  titleTemplate: (title) => `${title} - 江夏的个人博客`,
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  charset: "utf-8",
  meta: [
    { name: "Keywords", content: "江夏的个人博客" },
    {
      name: "description",
      content: "江夏的个人博客，用于记录工作生活学习中的点滴~",
    },
  ],
});
</script>

<template>
  <NuxtLayout name="custom">
    <div class="archives-container">
      <section class="archives-info">
        <el-empty
          v-if="!Object.keys(archivesInfo).length"
          description="归档页面 暂时没有东西哦！"
        />
        <el-collapse v-else v-model="defaultActiveKey">
          <el-collapse-item
            v-for="(value, key) in archivesInfo"
            :key="String(key)"
            :name="String(key)"
            :title="String(key)"
          >
            <div v-for="(value2, key2) in value" :key="key2">
              <h4 class="month">{{ key2 }}</h4>
              <el-timeline >
                <!-- placement="top" -->
                <el-timeline-item
                  v-for="(item, index) in value2"
                  :key="index"
                  :timestamp="item.uTime"
                  color="#00adb5"
                >
                  <nuxt-link :to="'/article/info?id=' + item['id']">
                    <div class="link-title">{{ item["title"] }}</div>
                  </nuxt-link>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-collapse-item>
        </el-collapse>
      </section>
    </div>
  </NuxtLayout>
</template>
<style lang="less" scoped>
.archives-container {
  min-height: 100%;
  .archives-info {
    margin: 20px auto 0;
    min-height: 100vh;
    min-width: 40%;
    width: 70%;
    z-index: 10;
    border-radius: var(--layout-border-radius);
    background-color: var(--minor-bgc);
    padding: 10px 20px 20px 20px;
  }
  .month {
    color: var(--text-color);
    font-weight: normal;
    font-size: 16px;
  }
  .link-title {
    cursor: pointer;
    font-weight: 600;
  }
  .link-title:hover {
    color: var(--main-color);
    text-decoration: underline;
  }
}
</style>
