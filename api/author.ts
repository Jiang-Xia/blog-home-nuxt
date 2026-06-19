/**
 * 作者侧聚合 API（相关推荐、数据看板、评论收件箱）
 */
import request from '~~/api/request';

/** 详情页相关文章推荐；公开接口，同作者优先 */
export const getRelatedArticles = (id: string | number, limit = 6) => {
  return request.get('/article/related', { id, limit });
};

/** 个人中心创作数据看板；需登录，返回发布/草稿/阅读/点赞/Top5 */
export const getAuthorStats = () => {
  return request.get('/article/author-stats');
};

/** 我文章收到的评论（作者收件箱）；分页，含 status 与 articleTitle */
export const getCommentsOnMyArticles = (params: { page?: number; pageSize?: number }) => {
  return request.get('/comment/on-my-articles', params);
};
