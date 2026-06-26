/**
 * Sitemap 动态 URL 源：博客文章详情 + 排行榜 Top50 用户公开主页
 * 数据源：POST {origin}{apiPrefix}/article/list、GET /rpg/leaderboard
 */
export default defineSitemapEventHandler(async () => {
  const originUrl = process.env.VITE_NUXT_ORIGIN_URL || 'https://jiang-xia.top';
  const apiPrefix = process.env.VITE_NUXT_API_PREFIX || '/x-blog/api/v1';
  const apiBase = `${originUrl}${apiPrefix}`;

  const [articleRes, leaderboardRes] = await Promise.all([
    $fetch<any>(`${apiBase}/article/list`, {
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
    }),
    $fetch<any>(`${apiBase}/rpg/leaderboard`, {
      query: { type: 'exp', limit: 50, period: 'total' },
    }).catch(() => null),
  ]);

  const articleIds = articleRes?.data?.list?.map((v: { id: string | number }) => v.id) ?? [];
  const articlePaths = articleIds
    .filter((id: unknown) => id != null && id !== '')
    .map((id: string | number) => `/detail/${id}`);

  const leaderboardEntries = leaderboardRes?.data ?? [];
  const userUids = (Array.isArray(leaderboardEntries) ? leaderboardEntries : [])
    .map((entry: { uid?: number | string }) => entry.uid)
    .filter((uid): uid is number | string => uid != null && uid !== '');
  const userPaths = [...new Set(userUids.map(uid => `/user/${uid}`))];

  return [...articlePaths, ...userPaths];
});
