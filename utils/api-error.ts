/** 判断 API 响应是否为 404（资源不存在） */
export function isNotFoundError(err: unknown): boolean {
  if (!err || typeof err !== 'object') {
    return false;
  }

  const e = err as Record<string, unknown>;
  const status = e.statusCode ?? e.status ?? e.code;
  if (status === 404 || status === '404') {
    return true;
  }

  const response = e.response as { status?: number } | undefined;
  if (response?.status === 404) {
    return true;
  }

  const message = String(e.message ?? e.statusMessage ?? '');
  return message.includes('404') || message.includes('Not Found') || message.includes('找不到');
}
