import request from '~~/api/request';
import { resolveStaticUrl } from '@/utils/static-url';

export type UploadCategory = 'avatar' | 'cover' | 'article';

/** 上传图片到资源库（按 category 写入对应目录并压缩） */
export const uploadImage = (file: File, category: UploadCategory) => {
  const form = new FormData();
  form.append('fileContents', file);
  form.append('category', category);
  return request.post(`/resources/uploadFile?category=${category}`, form);
};

/** 注册页上传头像（无需登录） */
export const uploadRegisterAvatar = (file: File) => {
  const form = new FormData();
  form.append('fileContents', file);
  form.append('category', 'avatar');
  return request.post('/resources/upload-register-avatar?category=avatar', form);
};

/** 从上传接口响应中解析 /static 相对路径 */
export const parseUploadedPath = (res: unknown): string => {
  if (!res) return '';
  // home 端 request.post 已 unwrap，可能直接是 FileStore[]
  if (Array.isArray(res)) {
    return (res[0] as { url?: string })?.url || '';
  }
  const wrapped = res as { data?: unknown; url?: string };
  if (Array.isArray(wrapped.data)) {
    return (wrapped.data[0] as { url?: string })?.url || '';
  }
  if (wrapped.data && typeof wrapped.data === 'object' && 'url' in (wrapped.data as object)) {
    return (wrapped.data as { url?: string }).url || '';
  }
  return wrapped.url || '';
};

/** 上传完成后写入表单：拼接域名后的完整 URL */
export const parseUploadedUrl = (res: unknown): string => {
  return resolveStaticUrl(parseUploadedPath(res));
};
