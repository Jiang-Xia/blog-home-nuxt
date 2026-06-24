import { useState } from '#app';
import api from '@/api';

export const defaultInfo: userInfoState = {
  nickname: '',
  homepage: '',
  intro: '',
  avatar: '',
  uid: 0,
  role: '',
};

const userInfo = reactive<userInfoState>({ ...defaultInfo });
const token = ref('');

export const useUserInfo = () => useState('userInfo', () => userInfo);
export const useToken = () => useState('token', () => token);

export const clearUserInfo = () => {
  Object.assign(userInfo, defaultInfo);
};

export const useClearUserInfo = () => clearUserInfo;

/**
 * 确保 userInfo 已与 token 同步（刷新后 uid 可能暂未写入）
 * @returns 是否已登录
 */
export const ensureLoggedIn = async (): Promise<boolean> => {
  const info = useUserInfo();
  const tok = useToken();
  if (info.value?.uid) return true;
  if (!tok.value) return false;
  await refreshUserInfo();
  return !!info.value?.uid;
};

/** 根据当前 token 拉取并写入用户信息；无 token 时清空 */
export const refreshUserInfo = async () => {
  const info = useUserInfo();
  const tok = useToken();
  if (!tok.value) {
    clearUserInfo();
    return null;
  }
  try {
    const res = await api.getUserInfo();
    Object.assign(info.value, res);
    return res;
  }
  catch {
    const tok = useToken();
    tok.value = '';
    clearUserInfo();
    return null;
  }
};

export default function () {
  return useState('userCommon', () => {
    return {
      userInfo,
      token,
    };
  });
}
