import type { ApiResponse } from './ApiResponse';
import { baseUrl } from '~~/config';
import { messageDanger } from '~~/utils/toast';
import { setToken, getToken, removeToken, TokenKey, RefreshTokenKey } from '@/utils/cookie';
import { aesEncrypt, aesDecrypt } from '~~/utils/crypto';

// 是否开启请求日志记录
const openRequestLog = import.meta.dev;
// 是否开启加密功能，从环境变量读取
// 线上“紧急开关”：本地缓存有值则关闭加密（key 需尽量隐晦，避免被随意调试）
// 规则：长一些 + 含项目指纹（home）但不直白暴露项目名/用途
const DISABLE_ENCRYPT_STORAGE_KEY = '__bxp__nuxt_home__k3Y9p2__fuse__v1';
const openEncryptByEnv = import.meta.env.VITE_NUXT_OPEN_ENCRYPT === 'true';
const isEncryptEnabled = (): boolean => {
  if (!openEncryptByEnv) {
    return false;
  }
  // 仅线上部署支持通过本地缓存一键关闭加密（有值即关闭）
  if (import.meta.env.MODE !== 'production') {
    return true;
  }
  if (!import.meta.client) {
    return true;
  }
  try {
    return !localStorage.getItem(DISABLE_ENCRYPT_STORAGE_KEY);
  }
  catch {
    return true;
  }
};

/**
 * 日志记录函数
 * @param msg 日志消息
 * @param type 日志类型，默认为 'log'
 */
const log = (msg: string, type = 'log') => {
  if (openRequestLog) {
    // @ts-expect-error: 不需要进行ts检测
    console[type](msg);
  }
};

// 注释掉的错误响应模板
// const errorResponse: ApiResponse = {
//   success: false,
//   code: 0,
//   message: '',
//   data: null,
// }

/**
 * 待处理任务接口定义
 * 用于无感刷新token时的请求队列管理
 */
interface PendingTask {
  config: any; // 请求配置
  url: string; // 请求URL
  fn: Function; // 回调函数
}

/**
 * 可选请求行为（通过 get 第三参或 $http options 传入）
 * @example request.get('/article/info', { id }, { silent: true })
 */
interface RequestHttpOptions {
  /** 为 true 时不弹出全局错误 toast，由调用方自行处理（如文章详情页预期 404） */
  silent?: boolean;
}

// 无感刷新token相关变量
let refreshing = false; // 是否正在刷新token
let queue: PendingTask[] = []; // 待处理请求队列

/**
 * async/await函数错误统一处理工具函数
 * 使用方式: const [err, data] = await checkFile({ hash, })
 * @param promise Promise对象
 * @returns 返回一个元组 [错误, 数据]，成功时错误为null，失败时数据为null
 */
export const awaitWrap = <T, U = any>(promise: Promise<T>): Promise<[U | null, T | null]> => {
  return promise.then<[null, T]>((data: T) => [null, data]).catch<[U, null]>(err => [err, null]);
};

// 防止重复请求的Map集合
const requestMap = new Map();

// 防重复请求白名单：RPG 页/WS 会并发刷新 status 等 GET，不参与防抖（见 home-03-api-request-contract.mdc）
const DEBOUNCE_WHITELIST: string[] = ['/rpg/'];

function shouldSkipRequestDebounce(url: string, body: unknown, method = 'GET'): boolean {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    return true;
  }
  if (DEBOUNCE_WHITELIST.some(prefix => url.includes(prefix))) {
    return true;
  }
  // FormData 无法稳定序列化，同 URL 并发上传（如文章多图）不应被误判为重复请求
  return isMultipartBody(body);
}

/**
 * 根据HTTP状态码和响应信息生成用户友好的错误提示
 * @param status HTTP状态码
 * @param message 服务器返回的错误信息
 * @param url 请求URL
 * @returns 用户友好的错误提示信息
 */
const getErrorMessage = (status: number, message: string, url: string): string => {
  // 如果服务器返回了具体错误信息，优先使用
  if (message && message.trim()) {
    return message;
  }

  // 根据状态码提供默认错误提示
  switch (status) {
    case 400:
      return '请求参数错误，请检查输入信息';
    case 401:
      return '登录已过期，请重新登录';
    case 403:
      return '没有权限访问该资源';
    case 404:
      return '请求的资源不存在';
    case 405:
      return '请求方法不允许';
    case 408:
      return '请求超时，请稍后重试';
    case 409:
      return '请求冲突，请检查数据';
    case 422:
      return '请求数据验证失败';
    case 429:
      return '请求过于频繁，请稍后重试';
    case 500:
      return '服务器内部错误，请稍后重试';
    case 502:
      return '网关错误，请稍后重试';
    case 503:
      return '服务暂时不可用，请稍后重试';
    case 504:
      return '网关超时，请稍后重试';
    default:
      // 对于其他状态码，提供通用提示
      if (status >= 400 && status < 500) {
        return '客户端请求错误，请检查网络连接';
      }
      else if (status >= 500) {
        return '服务器错误，请稍后重试';
      }
      else {
        return '网络请求失败，请稍后重试';
      }
  }
};

/**
 * 检测是否为网络连接错误
 * @param error 错误对象
 * @returns 是否为网络错误
 */
const isNetworkError = (error: any): boolean => {
  const isOffline = import.meta.client ? !navigator.onLine : false;
  return (
    error.name === 'TypeError'
    || error.message?.includes('fetch')
    || error.message?.includes('network')
    || error.message?.includes('Failed to fetch')
    || isOffline
  );
};

/**
 * 获取网络错误提示信息
 * @param error 错误对象
 * @returns 网络错误提示信息
 */
const getNetworkErrorMessage = (error: any): string => {
  if (import.meta.client && !navigator.onLine) {
    return '网络连接已断开，请检查网络设置';
  }

  if (error.name === 'TypeError' || error.message?.includes('fetch')) {
    return '网络请求失败，请检查网络连接';
  }

  if (error.message?.includes('timeout')) {
    return '请求超时，请稍后重试';
  }

  return '网络连接异常，请稍后重试';
};

/**
 * 加密请求体
 * 如果URL包含'encrypt'关键字，则对请求体进行AES加密
 * @param body 请求体数据
 * @param url 请求URL
 * @returns 加密后的请求体或原始请求体
 */
const isMultipartBody = (body: unknown): body is FormData => {
  return typeof FormData !== 'undefined' && body instanceof FormData;
};

const encryptMsg = (body: any, url: string) => {
  const bool = url.includes('encrypt');
  // FormData 不能 JSON 序列化，加密会破坏 multipart 文件上传
  if (bool && body && isMultipartBody(body)) {
    return body;
  }
  if (bool && body) {
    // console.log('encryptMsg-body====>', JSON.stringify(body))
    body = aesEncrypt(JSON.stringify(body));
    // console.log('encryptMsg-body====>', body)
    // console.log('encryptMsg-body====>', { content: body, })
    return {
      content: body,
    };
  }
  else {
    return body;
  }
};

/**
 * 解密响应体
 * 如果URL包含'encrypt'关键字，则对响应体进行AES解密
 * @param body 响应体数据
 * @param url 请求URL
 * @returns 解密后的响应体或原始响应体
 */
const decryptMsg = (body: any, url: string) => {
  const bool = url.includes('encrypt');
  if (bool && body && body.content) {
    // console.log('decryptMsg-body', body)
    body = aesDecrypt(body.content);
    body = JSON.parse(body);
    // console.log('decryptMsg-body', body)
    return body;
  }
  else {
    return body;
  }
};

// 创建fetch实例，设置基础URL
const apiFetch = $fetch.create({ baseURL: baseUrl });

/**
 * 核心HTTP请求函数
 * 处理请求发送、响应处理、错误处理、token刷新等逻辑
 * @param url 请求URL
 * @param options 请求配置选项，支持 {@link RequestHttpOptions.silent}
 * @returns Promise<ApiResponse>
 */
const $http = async (url: string, options: any & RequestHttpOptions): Promise<ApiResponse> => {
  const { method = 'GET', params = {}, headers, silent = false } = options;

  // 如果开启加密且不是外部URL，则在URL前添加'/encrypt'前缀
  const openEncrypt = isEncryptEnabled();
  if (openEncrypt && !url.includes('http')) {
    url = '/encrypt' + url;
  }

  // 加密请求体
  const body = encryptMsg(options.body, url);

  // 默认请求配置
  const defaultConfig: any = {
    headers: {
      ...headers,
    },
    credentials: 'include', // 携带cookie，用于session管理
    method,
    /* fetch中 params和body不能同时存在 */
    params: ['GET', 'DELETE'].includes(method.toUpperCase()) ? params : undefined,
    body: ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) ? body : undefined,
    onRequest(ctx: any) {
      // ctx.options.headers.Authorization = 'Bearer ' + getToken()
    },
  };

  return await new Promise((resolve, reject) => {
    // ofetch 在 4xx 时除 onResponseError 外仍会 reject 其返回 Promise；
    // 用 settled + safeResolve/safeReject 避免重复结算，并用 .catch 消除 SSR unhandledRejection
    let settled = false;
    const safeResolve = (value: ApiResponse) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(value);
    };
    const safeReject = (reason: unknown) => {
      if (settled) {
        return;
      }
      settled = true;
      reject(reason);
    };

    // 生成请求唯一标识，用于防重复请求
    const requestId = `${url}_${JSON.stringify(options)}`;
    log(`请求开始 req --------------> ${url}`);

    try {
      // 白名单 / multipart 上传跳过防重检测
      const skipDebounce = shouldSkipRequestDebounce(url, options.body, method);
      // 检查是否正在请求中，防止重复请求
      if (!skipDebounce && requestMap.has(requestId)) {
        log(`防抖，禁止重复请求！--------------> ${url}`, 'warn');
        safeReject(new Error('防抖，禁止重复请求！'));
        return;
      }
      else if (!skipDebounce) {
        requestMap.set(requestId, options);
      }
    }
    catch (error) {}

    /**
     * 获取当前token
     * @returns Bearer token字符串
     */
    const getTk = () => {
      const token = getToken();
      return token ? 'Bearer ' + token : '';
    };

    /**
     * 获取带token的请求配置
     * @returns 包含Authorization头的配置
     */
    const getDTconfig = () => {
      const config = defaultConfig;
      config.headers.Authorization = getTk();
      return config;
    };

    // 发送请求
    apiFetch<ApiResponse>(url, {
      ...getDTconfig(),

      /**
       * 请求发送前错误处理
       */
      onRequestError(ctx) {
        log(`请求发送失败 onRequestError --------------> ${url}`, 'error');
        requestMap.delete(requestId);

        let errorMessage: string;
        if (isNetworkError(ctx.error)) {
          errorMessage = getNetworkErrorMessage(ctx.error);
        }
        else {
          errorMessage = '请求发送失败，请检查网络连接';
        }

        if (!silent) {
          // silent 时由调用方展示页面级错误（如 Cyber 404），不在 SSR 弹 toast
          messageDanger(errorMessage);
        }
        safeReject(ctx.error);
      },

      /**
       * 响应成功回调
       */
      onResponse(ctx) {
        log(`请求结束 res --------------> ${url}`);
        requestMap.delete(requestId); // 清除请求记录

        const status: number = ctx.response.status;
        const body = decryptMsg(ctx.response._data, url); // 解密响应数据

        // 处理所有成功的状态码
        if (status >= 200 && status < 300) {
          safeResolve(body);
        }
        // else {
        //   // 对于非2xx状态码，也应该走错误处理
        //   const errorMessage = getErrorMessage(status, body.message || '', url);
        //   // messageDanger(errorMessage);
        //   reject(body);
        // }
      },

      /**
       * 响应错误回调
       * 处理401未授权、token刷新等逻辑
       */
      async onResponseError(ctx: any) {
        const { url } = ctx.response;
        log(`请求结束 fail onResponseError --------------> ${url}`);
        requestMap.delete(requestId);

        const body = decryptMsg(ctx.response._data, url);
        const status: number = ctx.response.status;

        // 如果正在刷新token，将请求加入队列
        if (refreshing) {
          queue.push({
            config: getDTconfig(),
            url,
            // 作用是把当前状态为pending的promise放进全局数组中
            // 刷新完token之后再把对应的promise状态改为fulfilled，
            // 这样之前报401响应的请求没有变更状态，刷新token再变为fulfilled响应后执行等待的相关操作
            fn: safeResolve,
          });
          // return为关键，不执行下面代码，不然下面resolve变更promise状态，
          // 造成每个promise都会执行foreach请求多个
          return;
        }

        try {
          // 处理401未授权错误，尝试刷新token
          if (status === 401 && !url.includes('/user/refresh')) {
            refreshing = true;
            const res = await refreshToken();
            refreshing = false;

            if (res) {
              // token刷新成功，重新执行队列中的请求
              queue.forEach(({ config, url, fn }) => {
                // 需动态重装config 查询获取本地的token
                config.headers.Authorization = getTk();
                fn(apiFetch(url, config));
              });
              console.log('queue', queue);
              queue = [];

              // 重新执行当前请求
              safeResolve((await apiFetch(url, getDTconfig())) as ApiResponse);
            }
            else {
              // token刷新失败，清除本地token
              const token = useToken();
              token.value = '';
              removeToken(TokenKey);
              const err = new Error(body?.message || '登录已过期，请重新登录');
              if (!silent) {
                messageDanger(err.message);
              }
              safeReject(err);
            }
          }
          else {
            // 全局错误提示处理；reject 时附带 statusCode 供上层区分 404 等场景
            const errorMessage = getErrorMessage(status, body?.message, url);
            if (!silent) {
              messageDanger(errorMessage);
            }
            safeReject(body ?? { statusCode: status, message: errorMessage });
          }
        }
        catch (error) {
          // 处理刷新token过程中的错误
          let errorMessage: string;

          if (isNetworkError(error)) {
            errorMessage = getNetworkErrorMessage(error);
          }
          else {
            errorMessage = '网络请求异常，请稍后重试';
          }
          if (!silent) {
            messageDanger(errorMessage);
          }
          safeReject(error);
        }
      },
      // 兜底捕获 ofetch 抛出的 FetchError（如 HTTP 404），与 onResponseError 中的 safeReject 互斥
    }).catch(safeReject);
  });
};

/**
 * GET请求方法
 * @param url 请求URL
 * @param params 查询参数
 * @param reqOptions 可选行为，如 `{ silent: true }` 静默失败不弹 toast
 * @returns Promise<any>
 */
const get = async (url: string, params = {}, reqOptions: RequestHttpOptions = {}): Promise<any> => {
  return await $http(url, { method: 'GET', params, ...reqOptions }).then(res => res.data);
};

/**
 * DELETE请求方法
 * @param url 请求URL
 * @param params 查询参数
 * @returns Promise<any>
 */
const del = async (url: string, params = {}): Promise<any> => {
  return await $http(url, { method: 'DELETE', params }).then(res => res.data);
};

/**
 * POST请求方法
 * @param url 请求URL
 * @param params 请求体数据
 * @returns Promise<any>
 */
const post = async (url: string, params = {}): Promise<any> => {
  return await $http(url, { method: 'POST', body: params }).then(res => res.data);
};

/**
 * PUT请求方法
 * @param url 请求URL
 * @param params 请求体数据
 * @returns Promise<any>
 */
const put = async (url: string, params = {}): Promise<any> => {
  return await $http(url, { method: 'PUT', body: params }).then(res => res.data);
};

/**
 * PATCH请求方法
 * @param url 请求URL
 * @param params 请求体数据
 * @returns Promise<any>
 */
const patch = async (url: string, params = {}): Promise<any> => {
  return await $http(url, { method: 'PATCH', body: params }).then(res => res.data);
};

/**
 * 刷新token函数
 * 使用refreshToken获取新的accessToken和refreshToken
 * 同时更新本地存储和状态管理
 */
async function refreshToken() {
  const token = useToken();
  const userInfo = useUserInfo();
  const refreshToken = getToken(RefreshTokenKey);

  // 调用刷新token接口
  const res = await get('/user/refresh', { token: refreshToken });

  // 更新本地存储的token
  setToken(TokenKey, res.accessToken);
  setToken(RefreshTokenKey, res.refreshToken, '', 7);

  // 更新状态管理中的token
  token.value = res.accessToken;

  // 更新用户信息
  const { nickname, homepage, intro, avatar, id: uid, role } = res.user;
  userInfo.value = {
    nickname,
    homepage,
    intro,
    avatar,
    uid,
    role,
  };

  return res;
}

// 导出所有方法
export default { http: $http, get, post, put, patch, del, awaitWrap };
