import request from '~~/api/request';

/** 公开用户主页 */
export const getPublicProfile = (uid: number | string) => {
  return request.get(`/user/public/${uid}`);
};

/** 公开用户文章 */
export const getPublicArticles = (uid: number | string, page = 1, pageSize = 10) => {
  return request.get(`/user/public/${uid}/articles`, { page, pageSize });
};

/** 公开 RPG 展示 */
export const getPublicRpgStatus = (uid: number | string) => {
  return request.get(`/rpg/public/${uid}/status`);
};
