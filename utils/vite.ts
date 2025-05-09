// 动态加载文件
export const getFileUrl = (url: string) => {
  // console.log(url, `../assets${url}`);
  const newUrl: URL = new URL(`../assets${url}`, import.meta.url);
  // console.log(newUrl, '--->', import.meta.url);
  return newUrl.href;
};
