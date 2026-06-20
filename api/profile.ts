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

/** 批量公开 RPG 等级（文章列表作者徽章，仅 level） */
export const getPublicRpgLevelsBatch = (uids: Array<number | string>) => {
  const unique = [
    ...new Set(
      uids
        .filter(Boolean)
        .map(id => Number(id))
        .filter(id => id > 0),
    ),
  ];
  if (!unique.length) {
    return Promise.resolve({} as Record<string, { level: number }>);
  }
  return request.get('/rpg/public/status/batch', { uids: unique.join(',') }) as Promise<
    Record<string, { level: number }>
  >;
};

/** 公开用户收藏文章 */
export const getPublicCollects = (uid: number | string, page = 1, pageSize = 10) => {
  return request.get(`/user/public/${uid}/collects`, { page, pageSize });
};

/** 公开用户点赞文章 */
export const getPublicLikes = (uid: number | string, page = 1, pageSize = 10) => {
  return request.get(`/user/public/${uid}/likes`, { page, pageSize });
};
