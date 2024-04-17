import { useState } from '#app'
import dayjs from 'dayjs'

// useState 的第一参数为 key，第二参数为初始化的工厂函数(即默认值)
export const useTheme = () => useState('theme', () => 'light')
// 要监听变化得useTheme使用
const theme = useTheme()

const followOs = () => {
  const bool = matchMedia('(prefers-color-scheme: dark)').matches
  if (bool) {
    theme.value = 'dark'
  } else {
    theme.value = 'light'
  }
  setTheme()
}
const setTheme = () => {
  const type: string = theme.value
  document.documentElement.className = type
  document.documentElement.setAttribute('data-theme', type)
  localStorage.setItem('theme', type)
}
if (process.client) {
  // 监听系统主题变化
  const match = matchMedia('(prefers-color-scheme: dark)')
  match.addEventListener('change', followOs)
  // console.log('match========》', match)
}
// 副作用函数
watchEffect(() => {
  if (process.client) {
    setTheme()
  }
})

export default function () {
  return useState('home', () => 'home')
}
