import { staticBaseUrl } from '~/config';

/** 将 /static 路径解析为可访问的完整 URL */
export const resolveStaticUrl = (path = ''): string => {
  if (!path) return '';
  if (path.startsWith('http') || path.includes('base64')) return path;
  if (path.startsWith('/static')) {
    return `${staticBaseUrl}${path}`;
  }
  return path;
};
