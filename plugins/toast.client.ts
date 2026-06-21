/**
 * 在 setup 上下文中绑定 useToast，避免异步队列（如 WS / fetch 回调）中 inject() 失败。
 */
import { bindToastApi } from '@/utils/toast';

export default defineNuxtPlugin(() => {
  bindToastApi(useToast());
});
