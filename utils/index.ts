import _copy from 'copy-to-clipboard'
import { ElMessage } from 'element-plus'
// 节流
export function throttle(fn: { apply: (arg0: any, arg1: any[]) => void }, t: number) {
  let flag = true
  const interval = t || 500
  return function (this: any, ...args: any) {
    if (flag) {
      // 每个函数都有apply方法，调用apply可以改变当前函数的this和参数
      fn.apply(this, args)
      // 修改传入的函数this指向以及传递参数
      // console.log(this, args)
      flag = false
      setTimeout(() => {
        flag = true
      }, interval)
    }
  }
}

// 防抖
export function debounce(fn: { apply: (arg0: any, arg1: any) => void }, t: number) {
  let timeId: any = null
  const delay = t || 500
  return function (this: any, ...args: any) {
    if (timeId) {
      clearTimeout(timeId)
    }
    timeId = setTimeout(() => {
      timeId = null
      fn.apply(this, args)
    }, delay)
  }
}

export function copy(text: string) {
  ElMessage.success('copy!')
  return _copy(text)
}

// 生成目录
export function makeToc(html: string): tocInter[] {
  const reg = /<h([\d]) id="([^<]+)">([^<]+)<\/h([\d])>/gi
  let ret = null
  const toc: tocInter[] = []
  while ((ret = reg.exec(html)) !== null) {
    toc.push({ level: ret[1], id: ret[2], text: ret[3] })
  }
  return toc
}
export interface tocInter {
  level: string
  id: string
  text: string
}

export function beforeTimeNow(updateTime: number) {
  if (updateTime === null) {
    return ''
  }
  const now = new Date().getTime()
  const second = Math.floor((now - updateTime) / 1000)
  const minute = Math.floor(second / 60)
  const hour = Math.floor(minute / 60)
  const day = Math.floor(hour / 24)
  const month = Math.floor(day / 31)
  const year = Math.floor(month / 12)

  // console.log(hour)
  // console.log(minute)
  if (year > 0) {
    return year + '年前'
  } else if (month > 0) {
    return month + '月前'
  } else if (day > 0) {
    let ret = day + '天前'
    if (day >= 7 && day < 14) {
      ret = '1周前'
    } else if (day >= 14 && day < 21) {
      ret = '2周前'
    } else if (day >= 21 && day < 28) {
      ret = '3周前'
    } else if (day >= 28 && day < 31) {
      ret = '4周前'
    }
    return ret
  } else if (hour > 0) {
    return hour + '小时前'
  } else if (minute > 0) {
    return minute + '分钟前'
  } else if (second > 0) {
    return second + '秒前'
  } else {
    return '刚刚'
  }
}
// 判断封面中是否为url链接或者base64
export function isTrueCoverLink(str = '') {
  if (!str) return
  const urlRegex = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g
  // console.log(str.includes('base64'))
  if (urlRegex.test(str) || str.includes('base64')) {
    return str
  }
}
