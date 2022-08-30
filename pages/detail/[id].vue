<script setup lang="ts">
  import { getArticleInfo, getComment } from "@/api/article";
  import { ref, reactive, computed } from "vue";
  import { updateViews, xBLogStore } from "@/utils/common";
  import { useRoute, useRouter, onBeforeRouteUpdate } from "vue-router";
  import { updateLikesHandle } from "@/utils/common";

  import defaultImg from "@/assets/images/create.webp";
  import { makeToc, tocInter, isTrueCoverLink } from "@/utils";
  import MdEditor from "md-editor-v3";
  import Qie from "@/assets/images/animal/qie.svg";
  const theme: any = useTheme();
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
    userInfo: {},
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
    console.log("onBeforeMount");
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
  const previewTheme = ref("default");
  const previewThemeChange = (e) => {
    previewTheme.value = e;
    // console.log(previewTheme.value);
  };
  const scrollElement = ref(null);
  const themeList: any = ref([
    "default",
    "github",
    "vuepress",
    "mk-cute",
    "smart-blue",
    "cyanosis",
  ]);
  // 为了客户端时重新渲染才能设置为缓存的暗黑模式，themeLocal 另设置一个变量会导致签署数据两次
  const mdKey = ref(new Date().getTime());
  let likes = ref([]);
  // 本地点赞记录
  const localLikes = computed(() => likes.value);
  onMounted(() => {
    scrollElement.value = document.documentElement;
    mdKey.value = new Date().getTime();
    // 点赞的
    likes.value = xBLogStore.value.likes;
    ArticleInfo.checked = likes.value.includes(ArticleInfo.id);
    // getCommentHandle();
  });

  /* 评论回复功能 */
  const comments = ref([]);
  const commentTotal = ref(0);

  const getCommentHandle = async () => {
    const id: string = route.params.id as string;
    const res = await getComment(id);
    comments.value = res.list;
    let total = res.pagination.total;
    res.list.map((v: any) => (total += v.allReplyCount));
    commentTotal.value = total;
    // console.log({ comments, total });
  };
  getCommentHandle();
  useHead({
    title: ArticleInfo.title + " - 文章详情",
    titleTemplate: (title) => `${title} - 江夏的个人博客 - 记录生活记录你~`,
  });
</script>
<template>
  <div class="article-detail">
    <section class="banner-container">
      <div class="banner-content">
        <img
          :alt="ArticleInfo.category.label"
          :src="isTrueCoverLink(ArticleInfo.cover) || defaultImg"
        />
        <!-- <div>文章详情</div> -->
        <div class="article-header text-gray-200">
          <h1 class="title">{{ ArticleInfo.title }}</h1>
          <p class="detail inline-flex items-center justify-center">
            <xia-icon icon="blog-category" />
            {{ ArticleInfo.category.label }}
            <xia-icon class="ml-3" icon="blog-tag" />
            {{ tagLabel }}
          </p>
          <p class="detail">
            <!-- 阅读量 -->
            <span class="mr-2 cursor-pointer inline-flex items-center">
              <xia-icon icon="blog-view" />
              {{ ArticleInfo["views"] }}
            </span>
            <!-- 点赞数 -->
            <span
              class="mr-2 cursor-pointer inline-flex items-center"
              @click.stop="updateLikesHandle(ArticleInfo)"
            >
              <xia-icon :icon="ArticleInfo['checked'] ? 'blog-like-solid' : 'blog-like'" />
              {{ ArticleInfo["likes"] }}
            </span>
          </p>
        </div>
      </div>
    </section>
    <section class="module-wrap__detail article-info">
      <div class="flex items-center justify-between overflow-hidden">
        <div class="flex items-center justify-between">
          <div class="btn btn-ghost btn-circle avatar">
            <div class="w-10 rounded-full">
              <img :src="ArticleInfo.userInfo.avatar || Qie" />
            </div>
          </div>
          <span class="text-color font-bold">{{ ArticleInfo.userInfo.nickname }}</span>
        </div>

        <div class="dropdown">
          <label tabindex="0" class="btn m-1">主 题</label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li v-for="item of themeList" @click="previewThemeChange(item)">
              <a>{{ item }}</a>
            </li>
          </ul>
        </div>
      </div>
      <md-editor
        :key="mdKey"
        v-model="ArticleInfo.contentHtml"
        class="x-md-editor"
        preview-only
        :preview-theme="previewTheme"
        :theme="theme"
        @onGetCatalog="onGetCatalogHandle"
      />
      <!-- 目录 -->
      <Catalogue :topics="topics" />
    </section>
    <!-- 评论 -->
    <XiaComment
      class="module-wrap__detail comment-module"
      :comments="comments"
      :total="commentTotal"
      @commented="getCommentHandle"
    />
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
        filter: blur(28px) brightness(0.95);
        transform: scale(1.1);
        background-color: var(--nav-color);
      }
    }
  }
  .article-header {
    width: 80%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    font-size: 13px;
    text-align: center;
    // padding: 1rem;
    // backdrop-filter: blur(20px);
    // border-radius: 0.8rem;
    // box-shadow: 0 2px 15px rgb(0 0 0 / 30%);
    // background-color: rgba(255, 255, 255, 0.4);
    .title {
      font-size: 32px;
      font-weight: 600;
      text-align: center;
      line-height: 1.1;
      // backdrop-filter: blur(10px);
      // box-shadow: 0 0px 15px rgb(0 0 0 / 30%);
      // border-radius: 8px;
      // padding: 8px 18px;
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
    // @apply rounded-lg shadow-xl;
    box-sizing: border-box;
    position: relative;
    margin: 20px auto 100px;
    min-height: 40vh;
    min-width: 40%;
    max-width: 1200px;
    width: 70%;
    z-index: 0;
    // background-color: var(--minor-bgc);
    // padding: 10px;
    @media screen and (max-width: 768px) {
      width: 98%;
      padding: 0;
    }
  }
  .x-md-editor {
    @apply rounded-lg p-3;
  }
  .article-info {
  }
  .comment-module {
    min-height: 30vh;
  }
  .md-dark {
    --md-bk-color: var(--main-bgc);
  }
</style>
