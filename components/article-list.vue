<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { getArticleList } from '@/api/article';
import { getWeather } from '@/api/index';
import {
  categoryOptions,
  formactDate,
  getOptions,
  tagsOptions,
  updateLikesHandle,
  xBLogStore,
} from '@/utils/common';
import { colorRgb } from '~~/utils/color';

interface queryState {
  page: number;
  category: string;
  tags: string[];
  pageSize: number;
  total: number;
  title?: string;
  description?: string;
  content?: string;
  sort: string;
}
interface itemState {
  id: string;
  checked: boolean;
  [x: string]: string | boolean;
}
// const store = useStore()
// 文章列表中的每一项item都为any
const articleListDefault: any[] = [];
const articleList = ref(articleListDefault);

const queryPrams: queryState = reactive({
  page: 1,
  category: '',
  tags: [],
  pageSize: 12,
  total: 0,
  title: '',
  description: '',
  content: '',
  client: true,
  sort: 'DESC', // 降序
});

/*
   * 第一个参数为唯一key
   * ！注意：如果有使用useAsyncData时，会最先执行此函数，也是是如此，
   * 分类和标签才会在服务渲染(useAsyncData后执行的函数)
   */

const {
  // 这样生命的变量时响应式的，不这样声明请求回来复制不然渲染到模板上
  data: articleData,
} = await useAsyncData('index_GetList', () => getArticleList(queryPrams));
if (articleData.value) {
  articleList.value = articleData.value.list;
  queryPrams.total = articleData.value.pagination.total;
  console.log('文章列表总文章======>', articleData.value.pagination.total);
}
// console.log({articleData:articleData.value})
// 此测试印证上面描述
// const { data: articleData } = await useAsyncData("index_GetList", () =>
//   Promise.resolve()
// );
getOptions('标签');
getOptions('分类');
// 下一页
const getArticleListHandle = async (val = 1) => {
  queryPrams.page = val;
  const res = await getArticleList(queryPrams);
  articleList.value = res.list;
  queryPrams.total = res.pagination.total;
};
  // 获取标签名(暂时没有用)
const getTagLabel = (arr: []): string => {
  // 如果是js的话，这个方法会写得很简单
  //  ts的话，它会提前对各种值进行类型推导，避免了一些取值的错误（比如在undefined和null取属性值）
  return arr.map((v: any) => v.label).join();
};

// 点击tag
const clickTagHandle = (item: itemState, type: string) => {
  if (type === '分类') {
    if (queryPrams.category === item.id) {
      // 清空选中
      queryPrams.category = '';
    }
    else {
      queryPrams.category = item.id;
    }
  }
  else {
    // 标签
    item.checked = !item.checked;

    const list: any = [...queryPrams.tags];
    if (!item.checked) {
      list.splice(list.indexOf(item.id), 1);
    }
    else if (!list.includes(item.id)) {
      list.push(item.id);
    }
    queryPrams.tags = list;
    // console.log(queryPrams.tags);
  }
  getArticleListHandle(1);
};
  // 分页
const current = ref(1);
const currentChangeHandle = (val: number) => {
  getArticleListHandle(val);
};

// 模糊搜索
const searchText = ref('');
const onSearchHandle = () => {
  queryPrams.page = 1;
  queryPrams.category = '';
  queryPrams.tags = [];
  queryPrams.title = searchText.value;
  queryPrams.description = searchText.value;
  queryPrams.content = searchText.value;
  getArticleListHandle(1);
};
const changeSort = () => {
  queryPrams.sort === 'ASC' ? (queryPrams.sort = 'DESC') : (queryPrams.sort = 'ASC');
  getArticleListHandle();
};

// 颜色转换
const toRgb = (color: string, alpha = 0.24) => {
  color = colorRgb(color);
  color = color.replace(')', `,${alpha})`);
  return color;
};

// 客户端执行
// 本地点赞记录
const localLikes = computed<number[]>(() => xBLogStore.value.likes);
const listKey = ref();
// 客户端徐根据缓存需重新渲染
onMounted(() => {
  listKey.value = new Date().getTime();
});

// 分类标签设置hover样式
const categoryMouseenter = (e: any, item: any) => {
  e.target.style.backgroundColor = toRgb(item.color, 0.12);
  e.target.style.setProperty('--current-color', `${item.color}`);
};
const categoryMouseleave = (e: any) => {
  e.target.style.backgroundColor = '';
};
  // 天气
const weatherData = ref<any>({});
const userInfo = useUserInfo();
const weatherUrl
    = 'https://api.vvhan.com/api/ipCard?tip=Hello ' + (userInfo.value.nickname || '亲爱的路人！');

onMounted(
  /* async */ () => {
    // 古诗词
    // weatherData.value = await getWeather()
    //  console.log(weatherData.value)
    // messageDanger('请输入你的评论！')
  },
);
const theme = useTheme();
</script>

<template>
  <div class="article-list-page">
    <section class="main-content px-3">
      <!-- 标签筛选 -->
      <div class="tag-card-wrap mb-3 max-w-7xl mx-auto">
        <base-card icon="blog-tag" title="标签" min-height="110px" vertical>
          <div
            v-for="item of tagsOptions"
            :key="item.id"
            class="custom-tag"
            :class="item.checked ? 'active' : ''"
            size="small"
            :style="{
              backgroundColor: item.checked ? item.color : toRgb(item.color),
              color: item.checked ? '#fff' : item.color,
            }"
            @click="clickTagHandle(item, '标签')"
          >
            <span>{{ item['label'] }} ({{ item['articleCount'] }})</span>
          </div>
        </base-card>
      </div>
      <!-- 文章列表 -->
      <div
        :key="listKey"
        class="article-item-wrap flex justify-center flex-wrap m-auto w-full max-w-7xl"
      >
        <transition-group key="article-item-wrap" name="list">
          <div
            v-for="item in articleList"
            :key="item.id"
            class="article-item card mr-5 bg-base-100 mb-5 hover:drop-shadow-lg transition-all shadow-sm"
          >
            <figure>
              <XiaCardBorderLight
                v-if="theme === 'dark'"
                :pic="item.cover"
                style="--border-size: 8px"
              />
              <img
                v-else
                v-lazyImg="item.cover"
                class="h-52 w-full bg-gray-900"
                :alt="item.category.label"
              >
              <!-- <XiaCardBorderLight :pic="item.cover" /> -->
            </figure>
            <div class="card-body">
              <h2 class="card-title">
                {{ item.title }}
                <div v-if="item.topping" class="badge badge-secondary">
                  TOP
                </div>
              </h2>
              <p class="text-sm">
                {{ item.description }}
              </p>
              <div class="card-actions justify-start text-xs flex-wrap">
                <div class="flex items-center">
                  <!-- 分类 -->
                  <span
                    class="text-icon mr-2 flex items-center"
                    :style="{ color: item.category.color }"
                  >
                    <xia-icon icon="blog-category" class="mr-1" />
                    {{ item.category.label }}
                  </span>
                  <!-- 标签 -->
                  <span
                    class="text-icon mr-2 flex items-center"
                    :style="{ color: item.tags[0]?.color }"
                  >
                    <xia-icon icon="blog-tag" class="mr-1" />
                    {{ getTagLabel(item.tags) }}
                  </span>
                  <!-- 阅读量 -->
                  <span class="text-icon mr-2 flex items-center pointer"><xia-icon icon="blog-view" class="mr-1" />{{ item.views }}</span>
                  <!-- 点赞数 -->
                  <span
                    class="text-icon mr-2 flex items-center pointer"
                    @click.stop="updateLikesHandle(item)"
                  >
                    <xia-icon
                      :icon="localLikes.includes(item.id) ? 'blog-like-solid' : 'blog-like'"
                      class="mr-1"
                    />
                    {{ item.likes }}
                  </span>
                  <!-- 评论数 -->
                  <span class="text-icon mr-2 flex items-center">
                    <xia-icon icon="blog-pinglun" class="mr-1" />
                    {{ item.commentCount }}
                  </span>
                </div>
                <div class="flex justify-between w-full items-center">
                  <div class="flex items-center">
                    <div class="avatar btn btn-ghost btn-circle btn-xs">
                      <div class="rounded-full">
                        <img :src="item.userInfo.avatar" :alt="item.userInfo.nickname">
                      </div>
                    </div>
                    <span class="pr-3 pt-2">{{ item.userInfo.nickname }}</span>
                    <span class="pt-2">{{ formactDate(item.createTime) }}</span>
                  </div>
                  <span @click="$router.push(`detail/${item.id}`)">
                    <button class="btn btn-neutral btn-xs xia-btn">Read</button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
      <div class="w-full">
        <xia-empty
          v-show="!articleList.length"
          :style="{ transform: !articleList.length ? 'scale(1,1)' : '' }"
          description="找不到文章..."
        />
        <!-- 分页 -->
        <div class="flex justify-around">
          <xia-pagination
            prev
            next
            :current-page="current"
            :page-size="queryPrams.pageSize"
            :total="queryPrams.total"
            :max="5"
            @change="currentChangeHandle"
          />
        </div>
      </div>
    </section>
    <!-- 右边筛选卡片 -->
    <section class="info-tool">
      <base-card icon="blog-filter" title="关键字" min-height="110px" class="mx-4 mb-4">
        <div class="join w-full mt-2">
          <button
            :title="queryPrams.sort === 'ASC' ? '升序' : '降序'"
            class="join-item btn btn-neutral btn-square w-10 btn-sm text-xs"
            @click="changeSort"
          >
            <svg
              v-if="queryPrams.sort === 'ASC'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z"
              />
            </svg>
          </button>
          <input
            v-model="searchText"
            type="text"
            placeholder="输入标题或者摘要"
            class="join-item input input-bordered input-sm max-w-xs"
            @keyup.enter="onSearchHandle"
          >
          <button class="join-item btn btn-neutral btn-square w-10 btn-sm" @click="onSearchHandle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </base-card>
      <base-card
        class="weather-card mx-4 mb-4"
        icon=""
        title=""
        :no-padding="false"
        min-height="180px"
      >
        <img v-lazyImg="weatherUrl" alt="天气预报" class="rounded-lg">
      </base-card>
      <!-- 天气 -->
      <base-card
        icon="" title="" min-height="110px"
        :no-padding="false"
        class="mx-4 mb-4"
      >
        <div class="icon-wrap">
          <xia-clock />
        </div>
      </base-card>

      <base-card icon="blog-category" title="分类" class="category-card mx-4 mb-4">
        <div
          v-for="item of categoryOptions"
          :key="item.id"
          class="category-item"
          :color="item.color"
          :class="item.id === queryPrams.category ? 'active' : ''"
          @click="clickTagHandle(item, '分类')"
          @mouseenter="(e) => categoryMouseenter(e, item)"
          @mouseleave="(e) => categoryMouseleave(e)"
        >
          <div
            class="category__inner flex justify-between items-center"
            :style="{
              borderColor: item.id === queryPrams.category ? 'transparent' : '',
            }"
          >
            <span class="category__text">{{ item['label'] }}</span>
            <div
              class="category__tag"
              :color="item.color"
              size="small"
              :style="{
                backgroundColor: item.color,
              }"
            >
              <span>{{ item['articleCount'] }}</span>
            </div>
          </div>
        </div>
      </base-card>
    </section>
  </div>
</template>

<style lang="less" scoped>
  .article-list-page {
    position: relative;
    padding-top: 20px;
    :deep(.xia-empty) {
      margin-bottom: 10vh;
      transition: all 1s;
      transform: scale(0, 0);
    }
    .el-pagination {
      margin-top: 8vh;
    }
    // 右边卡片
    .info-tool {
      position: absolute;
      right: 0;
      top: 20px;
      width: 340px;
      transition: all 0.5s;
      transform: translateX(300%);
      // 天气卡片
      .weather-card {
        min-height: 180px;
        img {
          width: 100%;
          height: 180px;
        }
      }

      // 分类卡片
      .category-card {
        max-height: 110vh;
        min-height: 100vh;
        overflow-y: auto;
      }
      .category-item {
        --current-color: #e5e6e6;
        padding: 5px 20px;
        transition: all 0.5s;
        border-radius: 2px 2px;
        .category__inner {
          cursor: pointer;
          position: relative;
          border-bottom: 1px solid #e5e6e6;
          &:after {
            // background: none repeat scroll 0 0 transparent;
            position: absolute;
            bottom: 0;
            left: 0;
            content: '';
            display: block;
            border-bottom-width: 1px;
            border-bottom-style: solid;
            border-bottom-color: var(--current-color);
            width: 0;
            transition: width 0.5s ease 0s;
          }
        }
      }
      .category-item:hover {
        .category__inner:after {
          width: 100%;
          left: 0;
        }
      }
      .category-item.active {
        .category__inner:after {
          width: 100%;
          left: 0;
        }
      }
      .category__tag {
        border-radius: 7px;
        line-height: 14px;
        font-size: 12px;
        height: 14px;
        color: #fff;
        padding: 0 9px;
      }
      .category__text {
        line-height: 1.8;
        flex: 1;
      }
    }
    .main-content,
    .info-tool {
      min-height: 100vh;
    }
    .card-title {
      color: var(--text-color);
    }
    .card-body {
      color: var(--text-color2);
    }
    .main-content {
      position: relative;
      margin-right: 0;
    }
    .article-item-wrap {
      transition: all 0.5s;
    }
    // 卡片样式
    .article-item {
      max-height: 408px;
    }
    .article-item-wrap {
      @media (max-width: 1535px) {
        //xl
        .article-item {
          width: calc(50% - 10px);
          &:nth-of-type(2n) {
            margin-right: 0;
          }
        }
      }

      @media (max-width: 1024px) {
        //lg
        .article-item {
          width: 100%;
          margin-right: 0;
        }
      }
      @media (min-width: 1536px) {
        //2xl
        .article-item {
          width: calc(33.3333% - 13.33px);
          &:nth-of-type(3n) {
            margin-right: 0;
          }
        }
      }
    }

    @media (min-width: 768px) {
      .main-content {
        margin-right: 340px;
      }
      .info-tool {
        transform: translateX(0%);
      }
    }
    @media (min-width: 1780px) {
      .info-tool {
        right: 100px;
      }
    }

    .xia-btn {
      text-transform: uppercase;
      background: linear-gradient(to right, #d926a9 50%, #3d4451 50%);
      background-size: 200% 100%;
      background-position: right bottom;
      transition: all 2s ease;
      border: none;
    }
    .article-item:hover .xia-btn {
      background-position: left bottom;
    }
  }
</style>
