<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { MdPreview } from 'md-editor-v3'

  import { useScroll } from '@vueuse/core'
  import { getArticleInfo, getComment } from '@/api/article'
  import { updateViews, xBLogStore, updateLikesHandle, formactDate } from '@/utils/common'
  import defaultImg from '@/assets/images/create.webp'
  import { type tocInter, isTrueCoverLink } from '@/utils'
  import Qie from '@/assets/images/animal/qie.svg'

  const theme: any = useTheme()
  interface FormState {
    [propName: string]: any
  }
  const defaultForm: FormState = {
    id: '',
    title: '',
    description: '',
    content: '',
    contentHtml: '',
    cover: '',
    uTime: '',
    category: {
      label: '',
    },
    tags: [],
    views: 0,
    checked: 0,
    likes: 0,
    uid: 0,
    userInfo: {},
  }
  const route = useRoute()
  // 先定义默认数组类型
  const topicsDefault: tocInter[] = []
  const topics = ref(topicsDefault)
  const ArticleInfo = reactive({ ...defaultForm, })
  // console.log(route)
  const params = route.params
  // console.log({ '文章id:': params.id, })
  // 响应式声明
  const { data: articleData, refresh, } = await useAsyncData('detail_GetInfo', () =>
    getArticleInfo(params)
  )
  const setArticleData = () => {
    if (articleData) {
      Object.keys(defaultForm).forEach((v: string) => {
        if (articleData.value.info[v]) {
          ArticleInfo[v] = articleData.value.info[v]
        }
      })
    }
  }
  setArticleData()

  // onBeforeMount(async () => {
  //   console.log('onBeforeMount')
  //   await refresh()
  //   setArticleData()
  // })
  updateViews(params.id)

  const getTagLabel = (arr: any): string => {
    const text = arr.map((v: any) => v.label).join()
    return text
  }

  const tagLabel = computed(() => {
    return getTagLabel(ArticleInfo.tags)
  })

  // 获取文章目录
  const onGetCatalogHandle = (list: any) => {
    topics.value = list.map((v: any) => {
      v.id = v.text
      return v
    })
  }
  const previewTheme = ref('default')
  const previewThemeChange = (e: any) => {
    previewTheme.value = e
    // console.log(previewTheme.value);
  }
  const scrollElement = ref<HTMLElement>()
  const themeList: any = ref(['default', 'github', 'vuepress', 'mk-cute', 'smart-blue', 'cyanosis'])
  // 为了客户端时重新渲染才能设置为缓存的暗黑模式，themeLocal 另设置一个变量会导致签署数据两次
  const mdKey = ref(new Date().getTime())
  const likes = ref([])
  // 本地点赞记录

  onMounted(() => {
    scrollElement.value = document.documentElement
    mdKey.value = new Date().getTime()
    // 点赞的
    likes.value = xBLogStore.value.likes
    ArticleInfo.checked = likes.value.includes(ArticleInfo.id as never)
    // getCommentHandle();
  })

  /* 评论回复功能 */
  const comments = ref([])
  const commentTotal = ref(0)

  const getCommentHandle = async () => {
    const id: string = route.params.id as string
    const { data: res, } = await useAsyncData('detail_GetComment', () => getComment(id))
    comments.value = res.value.list
    let total = res.value.pagination.total
    res.value.list.map((v: any) => (total += v.allReplyCount))
    commentTotal.value = total
    // console.log({ comments, total });
  }
  getCommentHandle()

  // 目录吸顶
  const mainViewArea = ref<HTMLElement>()
  let fixedAsideBar = ref<boolean>()
  if (process.client) {
    // 都是响应式的
    const { y, } = useScroll(window, {})
    fixedAsideBar = computed(() => {
      let top = 0
      if (mainViewArea.value) {
        top = mainViewArea.value.offsetTop - 66
      }
      return !!y.value && y.value > top
    })
  }
  // 侧边栏吸顶

  useHead({
    title: ArticleInfo.title + ' - 文章详情',
    titleTemplate: title => `${title} - 江夏的博客`,
  })
</script>
<template>
  <div class="article-detail">
    <section class="banner-container">
      <div class="banner-content">
        <img
          :alt="ArticleInfo.category.label"
          :src="isTrueCoverLink(ArticleInfo.cover) || defaultImg"
        >
        <!-- <div>文章详情</div> -->
        <div class="article-header text-gray-200">
          <h1 class="title">{{ ArticleInfo.title }}</h1>
          <p class="detail inline-flex items-center justify-center">
            <xia-icon icon="blog-category" />
            {{ ArticleInfo.category.label }}
            <xia-icon class="ml-3" icon="blog-tag" />
            {{ tagLabel }}
          </p>
          <p class="detail flex items-center justify-center">
            <xia-icon icon="blog-time" />更新于{{ formactDate(ArticleInfo.uTime) }}
          </p>
          <p class="detail">
            <!-- 阅读量 -->
            <span class="mr-2 cursor-pointer inline-flex items-center">
              <xia-icon icon="blog-view" />
              {{ ArticleInfo['views'] }}
            </span>
            <!-- 点赞数 -->
            <span
              class="mr-2 cursor-pointer inline-flex items-center"
              @click.stop="updateLikesHandle(ArticleInfo)"
            >
              <xia-icon :icon="ArticleInfo['checked'] ? 'blog-like-solid' : 'blog-like'" />
              {{ ArticleInfo['likes'] }}
            </span>
          </p>
        </div>
      </div>
    </section>
    <div ref="mainViewArea" class="main-view-area">
      <section class="main-content">
        <section class="module-wrap__detail article-info">
          <div class="flex items-center">
            <div class="flex items-center justify-between">
              <div class="btn btn-ghost btn-circle avatar">
                <div class="w-10 rounded-full">
                  <img :src="ArticleInfo.userInfo.avatar || Qie">
                </div>
              </div>
              <span class="text-color font-bold">{{ ArticleInfo.userInfo.nickname }}</span>
            </div>
            <div class="dropdown dropdown-bottom ml-6">
              <div tabindex="0" role="button" class="btn m-1 btn-neutral">主 题</div>
              <ul
                tabindex="0"
                class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li v-for="item of themeList" @click="previewThemeChange(item)">
                  <a>{{ item }}</a>
                </li>
              </ul>
            </div>
          </div>
          <MdPreview
            :key="mdKey"
            v-model="ArticleInfo.content"
            class="x-md-editor"
            preview-only
            :preview-theme="previewTheme"
            :theme="theme"
            @on-get-catalog="onGetCatalogHandle"
          />
        </section>
        <XiaComment
          class="module-wrap__detail comment-module"
          :comments="comments"
          :total="commentTotal"
          @commented="getCommentHandle"
        />
      </section>

      <aside ref="aside" class="aside-bar" :class="{ 'aside-bar__fixed': fixedAsideBar }">
        <div class="sticky-box">
          <Catalogue :topics="topics" />
        </div>
      </aside>
    </div>
  </div>
</template>
<style lang="less" scoped>
  .banner-container {
    height: 50vh;
    .banner-content {
      position: relative;
      overflow: hidden;
      height: 100%;
      & > img {
        width: 100%;
        height: 100%;
        filter: blur(28px) brightness(0.95);
        transform: scale(1.1);
        background: var(--nav-color);
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
    // background: rgba(255, 255, 255, 0.4);
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
  .main-view-area {
    margin: 20px auto 0;
    position: relative;
    @apply w-full xl:w-4/5;
    .main-content {
      width: calc(100% - 324px);
      @apply rounded-lg max-w-full p-3;
    }
    .aside-bar {
      @apply w-80 absolute right-0 top-0 hidden lg:block rounded-lg h-full overflow-auto;
    }
  }
  .aside-bar__fixed {
    .sticky-box {
      position: fixed;
      top: 66px;
      width: inherit; // 这样定位时还是继承父元素的宽度
    }
  }
  @media (max-width: 1140px) {
    .main-view-area {
      .main-content {
        width: 820px;
      }
    }
  }
  .article-detail {
    position: relative;
  }
  .x-md-editor {
    @apply rounded-lg p-3;
  }
  .article-info {
  }
  .comment-module {
    margin-top: 76px;
    min-height: 30vh;
  }
  .md-editor {
    font-family:
      HarmonyOS-Sans,
      ZhuZiAWan,
      -apple-system,
      Helvetica Neue,
      Helvetica,
      PingFang SC,
      Hiragino Sans GB,
      Microsoft YaHei,
      Arial,
      sans-serif;
  }
  .md-dark {
    --md-bk-color: var(--main-bgc);
  }
</style>
