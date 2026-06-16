import request from '~~/api/request';
import { resolveStaticUrl } from '@/utils/static-url';
import { compressImageFile } from '@/utils/image-compress';

export type UploadMediaCategory = 'avatar' | 'cover' | 'article';

const postUploadMedia = async (file: File, category: UploadMediaCategory) => {
  const compressed = await compressImageFile(file, category);
  const form = new FormData();
  form.append('fileContents', compressed);
  form.append('category', category);
  return request.post(`/resources/upload-media?category=${category}`, form);
};

/** 注册页上传头像（无需登录） */
export const uploadRegisterAvatar = async (file: File) => {
  const compressed = await compressImageFile(file, 'avatar');
  const form = new FormData();
  form.append('fileContents', compressed);
  return request.post('/resources/upload-media/register-avatar', form);
};

/** 修改头像（需登录） */
export const uploadAvatar = (file: File) => postUploadMedia(file, 'avatar');

/** 文章封面上传（需登录） */
export const uploadCover = (file: File) => postUploadMedia(file, 'cover');

/** 文章正文图片上传（需登录） */
export const uploadArticleImage = (file: File) => postUploadMedia(file, 'article');

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
