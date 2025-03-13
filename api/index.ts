import * as article from './article';
import * as tag from './tag';
import * as category from './category';
import * as tool from './tool';
import request from '~~/api/request.js';

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
// 古诗词
export const gushici = async () => {
  return await request
    .http('https://jiang-xia.top/x-zone/api/v1/third/gushici', {
      method: 'GET',
    })
    .then(res => res.data);
};
// 获取天气
export const getWeather = () => {
  return request.get('/resources/weather');
};

const api = {
  ...article,
  ...tag,
  ...category,
  ...tool,
  getUserInfo,
  gushici,
  getWeather,
};
// https://gitee.com/api/v5/repos/jiang-xia/blog-home-nuxt/commits?access_token=53db1802db341bf994093cace04c275b&page=1&per_page=20
export default api;
