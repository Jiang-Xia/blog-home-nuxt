import * as tag from './tag';
import * as category from './category';
import * as tool from './tool';
import request from '~~/api/request.js';
import { originUrl } from '~/config';
// 获取用户信息
export const getUserInfo = async (): Promise<userInfoState> => {
  const data: any = await request.get('/user/info');
  const { nickname, homepage, intro, avatar, id: uid, role } = data;
  return {
    nickname,
    homepage,
    intro,
    avatar,
    uid,
    role,
  };
};

export interface UpdateUserProfileParams {
  id: number;
  nickname: string;
  intro?: string;
  homepage?: string;
  avatar?: string;
}

/** 更新当前用户资料（昵称、头像、简介、主页） */
export const updateUserProfile = (params: UpdateUserProfileParams) => {
  return request.patch('/user/edit', params);
};
// 古诗词
export const gushici = async () => {
  return await request
    .http(originUrl + '/x-zone/api/v1/third/gushici', {
      method: 'GET',
    })
    .then(res => res.data);
};
/** 注册页可选头像（公开，无需登录） */
export const getRegisterAvatars = (): Promise<{ avatars: string[] }> => {
  return request.get('/resources/register-avatars');
};

const api = {
  ...tag,
  ...category,
  ...tool,
  getUserInfo,
  updateUserProfile,
  gushici,
  getRegisterAvatars,
};
// https://gitee.com/api/v5/repos/jiang-xia/blog-home-nuxt/commits?access_token=53db1802db341bf994093cace04c275b&page=1&per_page=20
export default api;
