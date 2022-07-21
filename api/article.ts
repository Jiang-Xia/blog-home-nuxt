import request from "~~/api/request";
export const getArticleList = async (data: any) => {
  const res = await request.post("/article/list", data);
  console.log('/article/list:  ', res)
  return res.data;
};
export const getArticleInfo = async (params: any) => {
  const res = await request.get("/article/info", params);
  return res.data;
};

export const createArticle = async (data: any) => {
  const res = await request.post("/article/create", data);
  return res.data;
};

// 更新阅读量
export const updateViews = async (data: any) => {
  const res = await request.post("/article/views", data);
  return res.data;
};

// 更新点赞数
export const updateLikes = async (data: any) => {
  const res = await request.post("/like", data);
  return res.data;
};

// 必应每日一图
export const dailyImage = async (n?: number) => {
  const res = await request.get("/resources/daily-img", { n });
  return res.data;
};

// 获取文章归档
export const getArchives = async () => {
  const res = await request.get("/article/archives");
  return res.data;
};
