import request from '~~/api/request';
import { filterApprovedComments } from '@/utils/comment';

export const getArticleList = (data: any) => {
  return request.post('/article/list', data);
};
export const getArticleInfo = (params: any) => {
  // console.log(params.id)
  if (!params.id) {
    return Promise.reject(Error('id不能为空'));
  }
  return request.get('/article/info', params);
};

export const createArticle = (data: any) => {
  return request.post('/article/create', data);
};

export const editArticle = (data: any) => {
  return request.post('/article/edit', data);
};

/** 上传 Markdown 编辑器图片 */
export const uploadArticleImage = (file: File) => {
  const form = new FormData();
  form.append('fileContents', file);
  form.append('pid', 'd5561c87-f189-4dc1-a28d-ba862a50f01f');
  return request.post('/resources/uploadFile', form);
};

// 更新阅读量
export const updateViews = (data: any) => {
  return request.post('/article/views', data);
};

// 更新点赞数
export const updateLikes = (data: any) => {
  return request.post('/like', data);
};

// 必应每日一图
export const dailyImage = (n?: number) => {
  return request.get('/resources/daily-img', { n });
};

// 获取文章归档
export const getArchives = () => {
  return request.get('/article/archives');
};

// 获取文章评论（仅展示已审核通过的评论与回复）
export const getComment = async (id?: string, otherParams?: any) => {
  const { status: _status, ...safeParams } = otherParams || {};
  const res = await request.get('/comment/findAll', { articleId: id, ...safeParams });
  if (res?.list) {
    res.list = filterApprovedComments(res.list);
  }
  return res;
};
// 新增评论
export const addComment = (data: any) => {
  return request.post('/comment/create', data);
};
// 删除评论
export const delComment = (id: string) => {
  return request.del('/comment/delete', { id });
};

// 新增回复
export const addReply = (data: any) => {
  return request.post('/reply/create', data);
};
// 删除回复
export const delReply = (id: string) => {
  return request.del('/reply/delete', { id });
};

// 获取我的收藏列表（分页）
export const getMyCollectList = (params: { page?: number; pageSize?: number }) => {
  return request.get('/collect/list', params);
};

// 获取我的评论列表（分页）
export const getMyComments = (params: { page?: number; pageSize?: number }) => {
  return request.get('/comment/my-list', params);
};

// 获取我的回复列表（分页）
export const getMyReplies = (params: { page?: number; pageSize?: number }) => {
  return request.get('/reply/my-list', params);
};

// 获取我的文章列表（分页）
export const getMyArticleList = (params: { page?: number; pageSize?: number }) => {
  return request.get('/article/my-list', params);
};
