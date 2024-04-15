// 动态加载文件
export const getFileUrl = (url: string) => {
  //  console.log(url,`../assets${url}`)
  console.log(new URL(`../../assets${url}`, import.meta.url), import.meta.url)
  return new URL(`../assets${url}`, import.meta.url).href
}
