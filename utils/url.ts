/** 拼接 base 与 path，避免重复或缺失斜杠 */
export function joinUrl(base: string, path = '') {
  const normalizedBase = base.replace(/\/$/, '');
  if (!path) {
    return normalizedBase;
  }
  return `${normalizedBase}/${path.replace(/^\//, '')}`;
}

/** 为 URL 追加时间戳参数，避免 iframe 文档缓存 */
export function withCacheBust(url: string, timestamp = Date.now()) {
  const hashIndex = url.indexOf('#');
  const base = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : '';
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}t=${timestamp}${hash}`;
}

/** 去掉 cache bust 参数，用于地址栏展示 */
export function stripCacheBust(url: string) {
  if (!url) {
    return '';
  }
  const [beforeHash, ...hashParts] = url.split('#');
  const hash = hashParts.length ? `#${hashParts.join('#')}` : '';
  const cleaned = beforeHash
    .replace(/([?&])t=\d+(&|$)/, (_, prefix, suffix) => {
      if (prefix === '?' && suffix === '&') {
        return '?';
      }
      if (prefix === '&' && suffix === '&') {
        return '&';
      }
      return '';
    })
    .replace(/[?&]$/, '');
  return `${cleaned}${hash}`;
}
