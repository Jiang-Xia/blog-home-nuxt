import request from '~~/api/request';
import { filterApprovedComments } from '@/utils/comment';
import { isNotFoundError } from '@/utils/api-error';
import { uploadArticleImage as uploadArticleContentImage, parseUploadedUrl } from '@/api/resources';

export const getArticleList = (data: any) => {
  return request.post('/article/list', data);
};
export const getArticleInfo = async (params: { id?: string | number }) => {
  if (!params.id) {
    return null;
  }
  try {
    return await request.get('/article/info', params, { silent: true });
  }
  catch (err) {
    if (isNotFoundError(err)) {
      return null;
    }
    throw err;
  }
};

export const createArticle = (data: any) => {
  return request.post('/article/create', data);
};

export const editArticle = (data: any) => {
  return request.post('/article/edit', data);
};

/** 上传 Markdown 编辑器图片 */
export const uploadArticleImage = async (file: File) => {
  const res = await uploadArticleContentImage(file);
  return parseUploadedUrl(res);
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
export const getComment = async (
  id?: string,
  otherParams?: { page?: number; pageSize?: number; sort?: string },
) => {
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

/** 收藏/取消收藏（toggle） */
export const toggleCollect = (articleId: string | number) => {
  return request.post('/collect', { articleId: String(articleId) });
};

/** 检查当前用户是否已收藏 */
export const checkCollected = (articleId: string | number) => {
  return request.get('/collect/check', { articleId: String(articleId) });
};

/** 获取文章收藏总数 */
export const getCollectCount = (articleId: string | number) => {
  return request.get('/collect/count', { articleId: String(articleId) });
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

/** 禁用/恢复文章（软删除） */
export const disableArticle = (id: number | string, isDelete = true) => {
  return request.patch('/article/disabled', { id, isDelete });
};
