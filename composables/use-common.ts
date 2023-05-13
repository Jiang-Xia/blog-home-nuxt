import { useState } from '#app'
export const defaultInfo: userInfoState = {
  nickname: '',
  homepage: '',
  intro: '',
  avatar: '',
  uid: 0,
  role: '',
}

let userInfo = reactive<userInfoState>({ ...defaultInfo, })
const token = ref('')

// useState 的第一参数为 key，第二参数为初始化的工厂函数
export const useUserInfo = () => useState('userInfo', () => userInfo)
export const useToken = () => useState('token', () => token)

const clearUserInfo = () => {
  userInfo = { ...defaultInfo, }
}
export const useClearUserInfo = () => useState('userInfo', () => clearUserInfo)

export default function () {
  return useState('userCommon', () => {
    return {
      userInfo,
      token,
    }
  })
}
