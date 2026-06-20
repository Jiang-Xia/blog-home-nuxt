import { ref } from 'vue';
import type { LocationQueryValue } from 'vue-router';
import dayjs from 'dayjs';
import { useStorage } from '@vueuse/core';
import request from '@/api/request';
import { toggleCollect } from '@/api/article';
import { getAllCategory } from '@/api/category';
import { getAllTag } from '@/api/tag';
import { messageError } from '@/utils/toast';
import { resolveStaticUrl } from '@/utils/static-url';

export { resolveStaticUrl };

const categoryOptions: any = ref([]);
const tagsOptions: any = ref([]);
const categoryLoaded = ref(false);
const tagsLoaded = ref(false);
export const xBLogStore = useStorage('x-blog-store', { likes: [] });

const loadCategoryOptions = async () => {
  if (categoryLoaded.value) return;
  try {
    const res = await getAllCategory();
    categoryOptions.value = (res || []).filter((v: any) => v.articleCount);
    categoryLoaded.value = true;
  }
  catch (e) {
    console.error('[common] 加载分类失败:', e);
  }
};

const loadTagOptions = async (selectedTagIds: string[] = []) => {
  if (tagsLoaded.value) {
    tagsOptions.value.forEach((v: any) => {
      v.checked = selectedTagIds.includes(v.id);
    });
    return;
  }
  try {
    const res = await getAllTag();
    tagsOptions.value = (res || [])
      .filter((v: any) => v.articleCount)
      .map((v: any) => ({
        ...v,
        checked: selectedTagIds.includes(v.id),
      }));
    tagsLoaded.value = true;
  }
  catch (e) {
    console.error('[common] 加载标签失败:', e);
  }
};

/** @deprecated 请用 loadCategoryOptions / loadTagOptions（lazy） */
const getOptions = async (type: string) => {
  if (type === '分类') {
    await loadCategoryOptions();
  }
  else {
    await loadTagOptions();
  }
};
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
  '#f49f42',
];
// 随机获取一种颜色
const getRandomClor = () => {
  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
};
export {
  categoryOptions,
  tagsOptions,
  getOptions,
  loadCategoryOptions,
  loadTagOptions,
  colors,
  getRandomClor,
};

export const updateViews = async (id: LocationQueryValue | LocationQueryValue[]) => {
  await request.post('/article/views', { id });
};
export const updateLikes = async (data: any) => {
  return await request.post('/like', data);
};

// const store = useStore()
// 更新点赞数
export const updateLikesHandle = async (item: any) => {
  const { uid } = useUserInfo().value;
  if (!uid) {
    messageError('请先登录');
    await goLogin();
    return;
  }
  const id = item.id as never;
  const send = {
    articleId: item.id,
    uid,
    status: 1,
  };
  const likes = xBLogStore.value.likes;
  if (likes.includes(id)) {
    send.status = 0;
    likes.splice(likes.indexOf(id), 1);
    item.likes = --item.likes;
  }
  else {
    send.status = 1;
    !likes.includes(id) && likes.push(id);
    item.likes = ++item.likes;
  }
  await updateLikes(send);
  if (import.meta.client) {
    void useRpgAudio().playSfx('uiClick');
  }
  try {
    const { fetchQuests } = useRpg();
    await fetchQuests();
  }
  catch {
    // 非组件上下文时忽略
  }
};

/** 收藏/取消收藏；成功时播放 uiClick，收藏后刷新任务进度 */
export const toggleCollectHandle = async (
  articleId: string | number,
): Promise<{ collected: boolean } | null> => {
  const { uid } = useUserInfo().value;
  if (!uid) {
    messageError('请先登录');
    await goLogin();
    return null;
  }
  const res = await toggleCollect(articleId);
  if (import.meta.client) {
    void useRpgAudio().playSfx('uiClick');
  }
  try {
    if (res?.collected) {
      const { fetchQuests } = useRpg();
      await fetchQuests();
    }
  }
  catch {
    // 非组件上下文时忽略
  }
  return res;
};

export const formactDate = (str: string) => {
  return dayjs(str).format('YYYY-MM-DD HH:mm:ss');
};

/** 头像加载失败时的本地兜底图 */
export const DEFAULT_AVATAR_FALLBACK = '/assets/images/animal/animal3.svg';

/** 从头像列表中随机取一张；列表为空时返回本地兜底图 */
export const getRandomAvatar = (list: string[] = []): string => {
  if (!list.length) return DEFAULT_AVATAR_FALLBACK;
  const index = Math.floor(Math.random() * list.length);
  return list[index] || DEFAULT_AVATAR_FALLBACK;
};

/** 注册默认昵称（≤6 字，与后端 RegisterDTO 一致） */
export const DEFAULT_NICKNAMES = [
  // RPG 冒险
  '冒险萌新',
  '星光勇者',
  '萌新骑士',
  '小小法师',
  '路过勇者',
  '赏金猎人',
  '任务达人',
  '副本小白',
  '练级狂人',
  '成就猎人',
  '摸鱼勇者',
  '签到小侠',
  '冒险旅人',
  '初来乍到',
  '江湖过客',
  '游侠儿',
  '拾荒者',
  '独行侠',
  '码字骑士',
  '阅读星人',
  '点赞小侠',
  '评论达人',
  // 可爱
  '小太阳',
  '棉花糖',
  '软萌兔',
  '云朵喵',
  '星星糖',
  '小草莓',
  '芋泥球',
  '小布丁',
  '团子君',
  '小熊饼',
  // 积极阳光
  '向阳花',
  '小确幸',
  '天天开心',
  '好事发生',
  '加油鸭',
  '超级棒',
  '乐天派',
  '开心果',
  '小幸运',
  '阳光仔',
  '暖洋洋',
  '元气满满',
  '笑容满格',
  // 各种酱 · 调味
  '番茄酱',
  '咖喱酱',
  '草莓酱',
  '蓝莓酱',
  '苹果酱',
  '蜜桃酱',
  '花生酱',
  '芝麻酱',
  '豆瓣酱',
  '甜面酱',
  '蒜蓉酱',
  '海鲜酱',
  '沙茶酱',
  '千岛酱',
  '沙拉酱',
  '蛋黄酱',
  '芝士酱',
  '抹茶酱',
  '可可酱',
  '柠檬酱',
  '橘子酱',
  '芒果酱',
  '樱桃酱',
  '黑椒酱',
  '椒麻酱',
  '辣椒酱',
  '梅子酱',
  '桂花酱',
  '玫瑰酱',
  '桑葚酱',
  '葡萄酱',
  '菠萝酱',
  '照烧酱',
  '芥末酱',
  '山葵酱',
  '蘑菇酱',
  '培根酱',
  '蜂蜜酱',
  '焦糖酱',
  '炼乳酱',
  '酸奶酱',
  '奶油酱',
  '黄油酱',
  '太妃酱',
  '朗姆酱',
  '香草酱',
  '肉桂酱',
  '蒜泥酱',
  '香菇酱',
  '牛肉酱',
  '鸡肉酱',
  '咕咾酱',
  '寿喜酱',
  '味噌酱',
  '甜辣酱',
  '意面酱',
  '黑莓酱',
  '树莓酱',
  '枇杷酱',
  '杨桃酱',
  '荔枝酱',
  '龙眼酱',
  '石榴酱',
  '巧克力酱',
  '奥尔良酱',
  '黑胡椒酱',
  '蒜蓉辣酱',
  '覆盆子酱',
  '蔓越莓酱',
  '蜂蜜芥末酱',
  // 各种酱 · 萌系
  '奶糖酱',
  '橘猫酱',
  '喵喵酱',
  '兔叽酱',
  '布丁酱',
  '团子酱',
  '芋泥酱',
  '年糕酱',
  '麻薯酱',
  '可颂酱',
  '泡芙酱',
  '曲奇酱',
  '月饼酱',
  '汤圆酱',
  '豆花酱',
  '奶茶酱',
  '珍珠酱',
  '果冻酱',
  '软糖酱',
  '星星酱',
  '月亮酱',
  '云朵酱',
  '彩虹酱',
  '微风酱',
  '雪花酱',
  '樱花酱',
  '桃花酱',
  '薄荷酱',
  '熊猫酱',
  '柴犬酱',
  '柯基酱',
  '仓鼠酱',
  '龙猫酱',
  '企鹅酱',
  '海豚酱',
  '考拉酱',
  '狐狸酱',
  '小鹿酱',
  '松鼠酱',
  '河马酱',
  '水獭酱',
  '小熊猫酱',
  '薰衣草酱',
  '向日葵酱',
  '棒棒糖酱',
  // 各种酱 · RPG
  '冒险酱',
  '勇者酱',
  '法师酱',
  '骑士酱',
  '萌新酱',
  '练级酱',
  '副本酱',
  '签到酱',
  '任务酱',
  '成就酱',
  '摸鱼酱',
  '码字酱',
  '阅读酱',
  '点赞酱',
  '评论酱',
  '星空酱',
  '阳光酱',
  '元气酱',
  '幸运酱',
  '开心酱',
] as const;

export const getRandomNickname = (list: readonly string[] = DEFAULT_NICKNAMES): string => {
  if (!list.length) return '冒险萌新';
  const index = Math.floor(Math.random() * list.length);
  return list[index]!;
};

// 判断是否是pc设备
export const isPC = () => {
  const userAgentInfo: any = navigator.userAgent;
  const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPod'];
  let flag = true;
  for (let v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  if (window.screen.width >= 768) {
    flag = true;
  }
  return flag;
};

// 下载文件
export const downloadFile = (url: string, name = '') => {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
};

// URL获取查询参数
export const getUrlParams = (key: string) => {
  const queryString = window.location.search.substring(1);
  const params: any = {};
  // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace#%E6%8C%87%E5%AE%9A%E5%87%BD%E6%95%B0%E4%BD%9C%E4%B8%BA%E6%9B%BF%E6%8D%A2%E9%A1%B9
  queryString.replace(/([^&=]+)=([^&]+)/g, (_: string, key: string, value: string) => {
    // (match,p1,p2,offset, string) match-匹配项 p1,p2 捕获项 offset偏移量 string-原字符串
    params[key] = decodeURIComponent(value);
    return _;
  });
  if (key) {
    return params[key];
  }
  else {
    return params;
  }
};
