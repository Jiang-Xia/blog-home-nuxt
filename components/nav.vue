<!--
 * @Author: 酱
 * @LastEditors: jx
 * @Date: 2021-11-24 20:34:46
 * @LastEditTime: 2023-01-10 21:26:28
 * @Description:
 * @FilePath: \blog-home-nuxt\components\nav.vue
-->

<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import dayjs from 'dayjs'
  import Yaya from '../assets/images/animal/yaya.svg'
  import { getArticleList } from '@/api/article'
  import { throttle } from '~~/utils'
  import api from '@/api'
  import { adminUrl } from '@/config'
  const navList = ref([
    {
      path: '/',
      title: '首页',
      icon: 'blog-shouye',
    },
    {
      path: '/archives',
      title: '归档',
      icon: 'blog-guidang',
    },
    {
      path: '/links',
      title: '友链',
      icon: 'blog-lianjie',
    },
    {
      path: '/msgboard',
      title: '留言板',
      icon: 'blog-liuyanguanli',
    },
    {
      path: '/about',
      title: '关于',
      icon: 'blog-about',
    },
    {
      path: '/projects',
      title: '项目',
      icon: 'blog-xiangmu',
    }
    // {
    //   path: '/au-vi',
    //   title: '音视频',
    //   icon: 'blog-shipin',
    // },
    // {
    //   path: '/tool',
    //   title: '工具箱',
    //   icon: 'blog-tool',
    // }
  ])

  const token = useToken()
  const userInfo = useUserInfo()
  // init()
  /* 切换主题 开始 */
  const theme = useTheme()

  const iconClass = ref('blog-light')
  const setTheme = (type: string) => {
    iconClass.value = 'blog-' + type
    document.documentElement.className = type
    document.documentElement.setAttribute('data-theme', type)
    localStorage.setItem('theme', type)
    theme.value = type
  }
  const getHour = () => {
    const time = dayjs().hour()
    // 白天
    if (time > 6 && time < 18) {
      theme.value = 'light'
    } else {
      theme.value = 'dark'
    }
    setTheme(theme.value)
  }
  onMounted(() => {
    console.log(localStorage.getItem('theme'))
    const themeType = localStorage.getItem('theme') || ('' as string)
    if (themeType) {
      // 都有设置icon和选中
      setTheme(themeType)
    } else {
      getHour()
    }
    const isDark: boolean = matchMedia('(prefers-color-scheme: dark)').matches
    if (isDark && (themeType === 'light' || !themeType)) {
      setTheme('dark')
    }
    document.addEventListener('click', () => {
      checked.value = false
    })
  })
  // 点击icon直接切换
  const clickIcon = () => {
    if (theme.value === 'light') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }
  /* 切换主题 结束 */

  /* 搜索文章 */

  // 搜索文章
  const queryPrams = reactive<queryState>({
    page: 1,
    pageSize: 20,
    title: '',
    description: '',
    content: '',
  })
  const searchText = ref('')
  const articleList: any = ref([])
  const getArticleListHandle = async () => {
    const res = await getArticleList(queryPrams)
    articleList.value = res.list.map((v: any) => {
      return {
        value: v.title,
        label: v.title,
        id: v.id,
      }
    })
  }

  const onSearchHandle = throttle(() => {
    if (searchText.value) {
      queryPrams.page = 1
      queryPrams.title = searchText.value
      queryPrams.description = searchText.value
      queryPrams.content = searchText.value
      getArticleListHandle()
    } else {
      articleList.value = []
    }
  }, 500)

  const clear = () => {
    token.value = ''
    localStorage.setItem('x-token', '')
    useClearUserInfo()
  }
  if (process.client) {
    token.value = localStorage.getItem('x-token') || ('' as string)
    if (token.value) {
      api.getUserInfo().then((res: any) => {
        userInfo.value = res
      })
    } else {
      clear()
    }
  }
  const goUrl = `${adminUrl}?ticket=${token.value}`
  // 菜单控制
  const checked = ref(false)
</script>
<template>
  <div class="navbar bg-transparent text-gray-100 dark:text-gray-300">
    <div class="navbar-start w-fit">
      <div class="dropdown">
        <label tabindex="0" class="btn btn-ghost swap swap-rotate lg:hidden" @click.stop="">
          <input v-model="checked" type="checkbox" @click="checked = !checked">
          <svg
            class="swap-off fill-current"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 512 512"
          >
            <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
          </svg>
          <svg
            class="swap-on fill-current"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 512 512"
          >
            <polygon
              points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49"
            />
          </svg>
        </label>
        <ul
          tabindex="0"
          :style="{
            visibility: checked ? 'visible' : undefined,
            opacity: Number(checked),
          }"
          class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-32 text-zinc-500"
        >
          <li v-for="(item, index) in navList" :key="item.path + index">
            <NuxtLink class="py-2 px-4 flex" :to="item.path" :title="item.title">
              <xia-icon :icon="item.icon" />
              <span>{{ item.title }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
      <a
        class="hidden sm:inline-flex btn btn-ghost normal-case text-3xl gradient-text"
        href="/"
      >Xia</a>
    </div>
    <div class="navbar-center hidden md:flex">
      <ul class="menu menu-horizontal p-0">
        <li v-for="(item, index) in navList" :key="item.path + index" class="mr-2">
          <NuxtLink
            :to="item.path"
            class="router-link-item leading-6 flex items-center px-4 py-3 rounded-lg"
            :title="item.title"
          >
            <xia-icon class="hidden md:flex" :icon="item.icon" />
            <span class="hidden xl:flex">{{ item.title }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- 右边搜索 -->
    <div class="navbar-end flex-1 flex items-center">
      <div class="dropdown relative">
        <label tabindex="0">
          <input
            v-model="searchText"
            type="text"
            placeholder="搜索"
            class="input w-full input-bordered input-ghost input-md"
            autocomplete="off"
            @input="onSearchHandle"
            @keyup.enter="onSearchHandle"
          >
        </label>
        <ul
          v-if="articleList.length"
          tabindex="0"
          class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52 max-h-72 text-gray-500 text-xs overflow-auto"
        >
          <li v-for="item in articleList" class="flex items-center">
            <NuxtLink class="py-2 px-4" :to="'/detail/' + item.id">{{ item.value }}</NuxtLink>
          </li>
        </ul>
      </div>

      <xia-icon class="cursor-pointer px-3" :icon="iconClass" @click="clickIcon" />

      <NuxtLink
        v-if="!token"
        class="btn btn-ghost inline-flex tracking-wide"
        to="/login"
        title="登录"
      >
        登录
      </NuxtLink>
      <div v-else class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full text-center leading-loose">
            <img :src="userInfo.avatar || Yaya" :alt="userInfo.nickname">
          </div>
        </label>
        <ul
          tabindex="0"
          class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-32 text-gray-500 text-xs"
        >
          <li>
            <a :href="goUrl" target="_blank" class="leading-5 flex items-center py-2 px-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              写文章
            </a>
          </li>
          <li @click="clear">
            <a class="leading-5 flex items-center py-2 px-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              退出
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
  // 'sm': '640px',
  // // => @media (min-width: 640px) { ... }

  // 'md': '768px',
  // // => @media (min-width: 768px) { ... }

  // 'lg': '1024px',
  // // => @media (min-width: 1024px) { ... }

  // 'xl': '1280px',
  // // => @media (min-width: 1280px) { ... }

  // '2xl': '1536px',
  // // => @media (min-width: 1536px) { ... }
  .navbar {
    .router-link-active {
      border-radius: var(--rounded-btn, 0.5rem);
      background: hsl(0 0% 100% / var(--tw-bg-opacity));
      --tw-bg-opacity: 0.1;
    }
  }
</style>
