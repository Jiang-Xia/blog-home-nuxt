import * as article from './article';
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
// 古诗词
export const gushici = async () => {
  return await request
    .http(originUrl + '/x-zone/api/v1/third/gushici', {
      method: 'GET',
    })
    .then(res => res.data);
};
// 获取天气
export const getWeather = () => {
  return request.get('/resources/weather');
};

// 发送邮箱验证码
export const sendEmailCode = (email: string, type: 'login' | 'register') => {
  return request.post('/user/sendEmailCode', { email, type });
};

// 邮箱登录
export const emailLogin = (email: string, password: string, emailCode: string) => {
  return request.post('/user/login', {
    email,
    password,
    emailCode,
    loginType: 'email',
  });
};

// 邮箱注册
export const emailRegister = (params: {
  email: string;
  password: string;
  nickname: string;
  avatar?: string;
  emailCode: string;
}) => {
  return request.post('/user/register', {
    ...params,
    registerType: 'email',
  });
};

const api = {
  ...article,
  ...tag,
  ...category,
  ...tool,
  getUserInfo,
  gushici,
  getWeather,
  sendEmailCode,
  emailLogin,
  emailRegister,
};
// https://gitee.com/api/v5/repos/jiang-xia/blog-home-nuxt/commits?access_token=53db1802db341bf994093cace04c275b&page=1&per_page=20
export default api;
