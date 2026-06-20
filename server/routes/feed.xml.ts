/**
 * RSS 订阅 feed.xml
 * 数据源：POST /x-blog/api/v1/article/list 最近 50 篇；供搜索引擎与 RSS 阅读器抓取
 */
import { getRequestURL } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const origin = config.public.siteOrigin || getRequestURL(event).origin;
  const apiPrefix = process.env.VITE_NUXT_API_PREFIX || '/x-blog/api/v1';
  const apiBase = `${origin}${apiPrefix}`;

  let articles: Array<{
    id: number;
    title: string;
    description?: string;
    createTime?: string;
    uTime?: string;
  }> = [];

  try {
    const res = await $fetch<any>(`${apiBase}/article/list`, {
      method: 'POST',
      body: { page: 1, pageSize: 50, client: true, sort: 'DESC' },
    });
    articles = res?.data?.list ?? res?.list ?? [];
  }
  catch {
    articles = [];
  }

  const escapeXml = (str: string) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const items = articles
    .map((a) => {
      const link = `${origin}/detail/${a.id}`;
      const pubDate = new Date(a.uTime || a.createTime || Date.now()).toUTCString();
      return `<item>
  <title>${escapeXml(a.title)}</title>
  <link>${link}</link>
  <guid isPermaLink="true">${link}</guid>
  <description>${escapeXml(a.description || a.title)}</description>
  <pubDate>${pubDate}</pubDate>
</item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>江夏的个人博客</title>
  <link>${origin}</link>
  <description>技术分享与生活记录</description>
  <language>zh-CN</language>
  ${items}
</channel>
</rss>`;

  event.node.res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  return xml;
});
