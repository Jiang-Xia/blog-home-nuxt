// 动态加载文件
export const getFileUrl = (url: string) => {
  // console.log(url,`../assets/tabsIcon/${url}`)
  return new URL(`../assets/${url}`, import.meta.url).href
}
