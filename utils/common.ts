import { ref } from "vue";
import api from "@/api/index";
import { LocationQueryValue } from "vue-router";
import dayjs from "dayjs";
import { useStorage } from "@vueuse/core";
// 分类
const categoryOptions: any = ref([]);
// 标签
const tagsOptions: any = ref([]);
export const xBLogStore = useStorage("x-blog-store", { likes: [] });

const getOptions = async (type: string) => {
  if (type === "分类") {
    const res = await api.getAllCategory();
    categoryOptions.value = res.map((v: any) => {
      v.value = v.id;
      return v;
    });
    // console.log(res)
  } else {
    const likes = xBLogStore.value.likes;
    const res = await api.getAllTag();
    tagsOptions.value = res.map((v: any) => {
      v.value = v.id;
      v.checked = false;
      return v;
    });
  }
};
const colors: string[] = [
  "#4ea397",
  "#22c3aa",
  "#7bd9a5",
  "#d0648a",
  "#f58db2",
  "#f2b3c9",
  // dark
  "#dd6b66",
  "#759aa0",
  "#e69d87",
  "#8dc1a9",
  "#ea7e53",
  "#73a373",
  "#73b9bc",
  "#7289ab",
  "#91ca8c",
  "#f49f42",
];
// 随机获取一种颜色
const getRandomClor = () => {
  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
};
export { categoryOptions, tagsOptions, getOptions, colors, getRandomClor };

export const updateViews = async (id: LocationQueryValue | LocationQueryValue[]) => {
  await api.updateViews({ id });
};
export const updateLikes = async (data: any) => {
  return await api.updateLikes(data);
};

// const store = useStore()
// 更新点赞数
export const updateLikesHandle = async (item: any) => {
  const { uid } = useUserInfo().value;
  const send = {
    articleId: item.id,
    uid,
    status: 1,
  };
  const likes = xBLogStore.value.likes;
  if (item.checked) {
    send.status = 0;
    likes.splice(likes.indexOf(item.id), 1);
  } else {
    send.status = 1;
    !likes.includes(item.id) && likes.push(item.id);
  }
  const res = await updateLikes(send);
  if (item.checked) {
    item.likes = --item.likes;
    item.checked = 0;
  } else {
    item.likes = ++item.likes;
    item.checked = 1;
  }
};

export const formactDate = (str: string) => {
  return dayjs(str).format("YYYY-MM-DD HH:mm:ss");
};
