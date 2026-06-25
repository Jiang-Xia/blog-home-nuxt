/**
 * Sitemap 动态 URL 源：博客文章详情页
 * 数据源：POST {origin}{apiPrefix}/article/list；供 @nuxtjs/sitemap sources 拉取
 */
export default defineSitemapEventHandler(async () => {
  const originUrl = process.env.VITE_NUXT_ORIGIN_URL || 'https://jiang-xia.top';
  const apiPrefix = process.env.VITE_NUXT_API_PREFIX || '/x-blog/api/v1';
  const apiBase = `${originUrl}${apiPrefix}`;

  const res: any = await $fetch(`${apiBase}/article/list`, {
    method: 'POST',
    body: {
      page: 1,
      pageSize: 500,
      category: '',
      tags: [],
      title: '',
      description: '',
      content: '',
      client: true,
      sort: 'DESC',
    },
  });
  const articleIds = res.data.list.map((v: any) => v.id);
  return articleIds.map((id: string) => `/detail/${id}`);
});
