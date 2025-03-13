// 节流
export function throttle(fn, delay) {
  let lastTime = 0; // 上次执行的时间
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}
// 防抖
export function debounce(fn, delay) {
  let timerId = null; // 定时器id
  return function (...args) {
    timerId && clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
      timerId = null;
    }, delay);
  };
}
