// 判断是否移动端
export const isMobile = () => {
  const flag = navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i,
  );
  return flag;
};

export const createScript = (scriptUrl: string) => {
  const script = document.createElement('script');
  script.src = scriptUrl;
  script.setAttribute('defer', 'defer');
  document.body.appendChild(script);
};
