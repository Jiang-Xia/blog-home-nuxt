<script setup lang="ts">
import { getArticleInfo } from "@/api/article";
import { ref, reactive, UnwrapRef, watch } from "vue";
import { updateViews } from "@/utils/common";
import { computed, onBeforeUnmount } from "vue";
import { useRoute, useRouter, onBeforeRouteUpdate } from "vue-router";
import { updateLikesHandle } from "@/utils/common";

import defaultImg from "@/assets/images/create.webp";
import { makeToc, tocInter, isTrueCoverLink } from "@/utils";
import MdEditor from "md-editor-v3";
import "md-editor-v3/lib/style.css";
const theme = useCookie("theme");
interface FormState {
  [propName: string]: any;
}
const defaultForm: FormState = {
  id: "",
  title: "",
  description: "",
  content: "",
  contentHtml: "",
  cover: "",
  category: {
    label: "",
  },
  tags: [],
  views: 0,
  checked: 0,
  likes: 0,
  uid: 0,
};
const route = useRoute();
// 获取到的html内容
const html = ref("");
// 先定义默认数组类型
const topicsDefault: tocInter[] = [];
const topics = ref(topicsDefault);
let ArticleInfo = reactive({ ...defaultForm });
let params = route.params;

// 响应式声明
const {
  data: articleData,
  pending,
  refresh,
  error,
} = await useAsyncData("detail_GetInfo", () => getArticleInfo(params));
const setArticleData = () => {
  if (articleData) {
    Object.keys(defaultForm).forEach((v: string) => {
      if (articleData.value.info[v]) {
        ArticleInfo[v] = articleData.value.info[v];
      }
    });
  }
};
setArticleData();

onBeforeMount(async () => {
  await refresh();
  setArticleData();
});
updateViews(params.id);

const getTagLabel = (arr: any): string => {
  let text = arr.map((v: any) => v.label).join();
  return text;
};

const tagLabel = computed(() => {
  return getTagLabel(ArticleInfo.tags);
});

const router = useRouter();

// 获取文章目录
const onGetCatalogHandle = (list: any) => {
  topics.value = list.map((v: any) => {
    v.id = v.text;
    return v;
  });
};

useHead({
  title: "文章详情",
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
  <div>
    <section class="banner-container">
      <div class="banner-content">
        <img :src="isTrueCoverLink(ArticleInfo.cover) || defaultImg" alt="" />
        <!-- <div>文章详情</div> -->
        <div class="article-header">
          <p class="title">{{ ArticleInfo.title }}</p>
          <p class="detail">
            <x-icon icon="blog-category"></x-icon>
            {{ ArticleInfo["category"]["label"] }}
            <x-icon class="mg-l-10" icon="blog-tag"></x-icon>
            {{ tagLabel }}
          </p>
          <p class="detail">
            <!-- 阅读量 -->
            <span class="mg-r-10 pointer">
              <x-icon icon="blog-view"></x-icon>
              {{ ArticleInfo["views"] }}
            </span>
            <!-- 点赞数 -->
            <span
              class="mg-r-10 pointer blog-like"
              @click.stop="updateLikesHandle(ArticleInfo)"
            >
              <x-icon
                :icon="ArticleInfo['checked'] ? 'blog-like-solid' : 'blog-like'"
              ></x-icon>
              {{ ArticleInfo["likes"] }}
            </span>
          </p>
        </div>
      </div>
    </section>
    <section class="module-wrap__detail article-info">
      <md-editor
        v-model="ArticleInfo.contentHtml"
        class="x-md-editor"
        preview-only
        :theme="theme"
        @onGetCatalog="onGetCatalogHandle"
      />
      <!-- 目录 -->
      <Catalogue :topics="topics" />
    </section>
    <!-- 评论 -->
  </div>
</template>
<style lang="less" scoped>
.banner-container {
  height: 60vh;
  .banner-content {
    position: relative;
    overflow: hidden;
    height: 100%;
    & > img {
      width: 100%;
      height: 100%;
      filter: blur(8px) brightness(0.95);
      transform: scale(1.1);
      background-color: var(--nav-color);
    }
  }
}
.article-header {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  font-size: 13px;
  text-align: center;
  .title {
    color: #fff;
    backdrop-filter: blur(2px);
    font-size: 32px;
    text-shadow: 3px 3px steelblue;
    letter-spacing: 8px;
    text-align: center;
    line-height: 1.1;
  }
  .detail {
    font-size: 12px;
    text-align: center;
    margin-top: 10px;
  }
  .x-icon {
    font-size: 16px;
  }
}
.module-wrap__detail {
  box-sizing: border-box;
  position: relative;
  margin: 20px auto 0;
  min-height: 40vh;
  min-width: 40%;
  max-width: 1200px;
  width: 70%;
  z-index: 0;
  border-radius: var(--layout-border-radius);
  background-color: var(--minor-bgc);
  padding: 10px 20px 20px 20px;
  @media screen and (max-width: 768px) {
    width: 95%;
  }
}
.article-info {
}
.comment-module {
  min-height: 30vh;
}
</style>
