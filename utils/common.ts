import { ref } from 'vue'
import type { LocationQueryValue } from 'vue-router'
import dayjs from 'dayjs'
import { useStorage } from '@vueuse/core'
import api from '@/api/index'
// 分类
const categoryOptions: any = ref([])
// 标签
const tagsOptions: any = ref([])
export const xBLogStore = useStorage('x-blog-store', { likes: [], })

const getOptions = async (type: string) => {
  if (type === '分类') {
    let { data: res, } = await useAsyncData('index_GetCategory', () => api.getAllCategory())
    if (!res.value) {
      res = ref([]) // 仅为了解决开发环境报错
    }
    // console.log('=>>>>>>>>>>>>>>>>>>>>>', res.value)
    categoryOptions.value = res.value.filter((v: any) => v.articleCount)
    // console.log(res)
  } else {
    let { data: res, } = await useAsyncData('index_GetTag', () => api.getAllTag())
    // console.log({ res: res.value, })
    if (!res.value) {
      res = ref([]) // 仅为了解决开发环境报错
    }
    tagsOptions.value = res.value
      .filter((v: any) => v.articleCount)
      .map((v: any) => {
        v.checked = false
        return v
      })
  }
}
const colors: string[] = [
  '#4ea397',
  '#22c3aa',
  '#7bd9a5',
  '#d0648a',
  '#f58db2',
  '#f2b3c9',
  // dark
  '#dd6b66',
  '#759aa0',
  '#e69d87',
  '#8dc1a9',
  '#ea7e53',
  '#73a373',
  '#73b9bc',
  '#7289ab',
  '#91ca8c',
  '#f49f42'
]
// 随机获取一种颜色
const getRandomClor = () => {
  const index = Math.floor(Math.random() * colors.length)
  return colors[index]
}
export { categoryOptions, tagsOptions, getOptions, colors, getRandomClor }

export const updateViews = async (id: LocationQueryValue | LocationQueryValue[]) => {
  await api.updateViews({ id, })
}
export const updateLikes = async (data: any) => {
  return await api.updateLikes(data)
}

// const store = useStore()
// 更新点赞数
export const updateLikesHandle = async (item: any) => {
  const { uid, } = useUserInfo().value
  const id = item.id as never
  const send = {
    articleId: item.id,
    uid,
    status: 1,
  }
  const likes = xBLogStore.value.likes
  if (likes.includes(id)) {
    send.status = 0
    likes.splice(likes.indexOf(id), 1)
    item.likes = --item.likes
  } else {
    send.status = 1
    !likes.includes(id) && likes.push(id)
    item.likes = ++item.likes
  }
  await updateLikes(send)
}

export const formactDate = (str: string) => {
  return dayjs(str).format('YYYY-MM-DD HH:mm:ss')
}

const avatars = [
  'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/2tp9sykqn11a6b41yodlzz-头像_天秤座.png',
  'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/sca06wy3ht6mgu839y9xk9-头像_天蝎座.png',
  'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/2tp9sykqn11a6b41yodlez-头像_白羊座.png',
  'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/sca06wy3ht6mgu839y9xhh-头像_双子座.png',
  'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/2tp9sykqn11a6b41yodluq-头像_巨蟹座.png',
  'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/2tp9sykqn11a6b41yodlph-头像_狮子座.png',
  'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/sca06wy3ht6mgu839y9xep-头像_处女座.png',
  'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/sca06wy3ht6mgu839y9xbx-头像_水瓶座.png',
  'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/sca06wy3ht6mgu839y9x95-头像_摩羯座.png',
  'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/2tp9sykqn11a6b41yodlk8-头像_双鱼座.png',
  'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/2tp9sykqn11a6b41yodl9q-头像_金牛座.png',
  'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-26/sca06wy3ht6mgu839y9x6d-头像_射手座.png'
]
// 获取十二星座随机头像
export const getRandomAvatar = () => {
  const index = Math.floor(Math.random() * avatars.length)
  return avatars[index]
}

// 判断是否是pc设备
export const isPC = () => {
  const userAgentInfo: any = navigator.userAgent
  const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPod']
  let flag = true
  for (let v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false
      break
    }
  }
  if (window.screen.width >= 768) {
    flag = true
  }
  return flag
}

// 下载文件
export const downloadFile = (url: string, name = '') => {
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()

  document.body.removeChild(a)
}
