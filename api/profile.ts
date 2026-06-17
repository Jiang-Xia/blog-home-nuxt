import request from '~~/api/request';
import { isNotFoundError } from '@/utils/api-error';

/** 公开用户主页 */
export const getPublicProfile = async (uid: number | string) => {
  try {
    return await request.get(`/user/public/${uid}`, {}, { silent: true });
  }
  catch (err) {
    if (isNotFoundError(err)) {
      return null;
    }
    throw err;
  }
};

/** 公开用户文章 */
export const getPublicArticles = (uid: number | string, page = 1, pageSize = 10) => {
  return request.get(`/user/public/${uid}/articles`, { page, pageSize });
};

/** 公开 RPG 展示 */
export const getPublicRpgStatus = (uid: number | string) => {
  return request.get(`/rpg/public/${uid}/status`);
};

/** 公开用户收藏文章 */
export const getPublicCollects = (uid: number | string, page = 1, pageSize = 10) => {
  return request.get(`/user/public/${uid}/collects`, { page, pageSize });
};

/** 公开用户点赞文章 */
export const getPublicLikes = (uid: number | string, page = 1, pageSize = 10) => {
  return request.get(`/user/public/${uid}/likes`, { page, pageSize });
};
