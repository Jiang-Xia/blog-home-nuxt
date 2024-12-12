type BannerState = {
  copyright: string
  copyrightlink: string
  title: string
  url: string
}

interface queryState {
  page: number
  pageSize: number
  title: string
  description: string
  content: string
}

interface StringKey {
  [propName: string]: any
}

interface userInfoState {
  nickname: string
  homepage: string
  intro: string
  avatar: string
  uid: number | null
  role: string
}

declare module 'js-cookie'
declare module 'tailvue'
// pdf.js全局对象
declare const pdfjsLib: any
// pdf-lib全局对象
declare const PDFLib: any
