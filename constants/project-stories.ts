/**
 * 项目叙事配置：问题 → 方案 → Demo（页面内 iframe）→ 相关文章。
 * 文章 id/title 为编辑精选（与站内已发文对应）；改链时请同步校验 /detail/{id} 仍有效。
 */
export interface ProjectStoryArticle {
  id: number;
  /** 展示用标题（与文章页一致，便于无请求渲染） */
  title: string;
  /** 为何链这篇：读者预期 */
  note: string;
}

export interface ProjectStory {
  /** URL 锚点，如 /projects#blog-uniapp */
  slug: string;
  title: string;
  /** 一句话定位 */
  tagline: string;
  problem: string;
  solution: string;
  /** true：展示完整四段；false：仅问题+方案短卡，文章可空 */
  full: boolean;
  articles: ProjectStoryArticle[];
}

/**
 * 与 /projects 区块一一对应。
 * Blog UniApp 为完整示范；其余先短叙事，文章可后续补。
 */
export const PROJECT_STORIES: ProjectStory[] = [
  {
    slug: 'zone',
    title: 'Zone',
    tagline: '多端生活/内容 H5 与扫码入口',
    problem:
      '除了博客，还需要一块能快速触达 App / H5 / 小程序的「生活区」展示，又不必和博客首页抢注意力。',
    solution:
      '独立 Zone 站点 + 项目页手机框预览；旁侧放各端二维码，扫码即达，博客只负责导流与说明。',
    full: false,
    articles: [],
  },
  {
    slug: 'blog-uniapp',
    title: 'Blog UniApp',
    tagline: '同一套博客 API 的 H5 / 小程序前台',
    problem:
      '博客长期只有 PC 向的 Nuxt 站：手机阅读、小程序分发都偏弱，若再维护一套完全不同的接口与交互，成本会翻倍。',
    solution:
      '用 uni-app 复用 blog-server（及 Go 网关）同一套 API，对齐登录、文章、RPG 等能力；H5 部署在 go.jiang-xia.top，小程序按端适配样式与 Socket，和 Nuxt 端形成「四端」之一。',
    full: true,
    articles: [
      {
        id: 140,
        title: '博客系统自文档 · 四端架构与请求链路',
        note: 'Nuxt / UniApp / Admin / Server 如何串在一起',
      },
      {
        id: 112,
        title: '博客系统自文档 · 认证与登录',
        note: '多端共用的登录与 token 约定',
      },
      {
        id: 118,
        title: '博客系统自文档 · 部署与增量发布',
        note: 'H5 与相关服务怎么上线、怎么增量',
      },
      {
        id: 139,
        title: '博客系统自文档 · 导读：这个系统是什么',
        note: '先建立全貌，再下钻各端实现',
      },
    ],
  },
  {
    slug: 'blog-admin',
    title: 'Blog Admin',
    tagline: '内容、权限与 RPG 运营后台',
    problem: '前台再完整，没有后台也难以运营文章、用户、支付与冒险数值。',
    solution:
      'Vue3 管理端对接同一后端：RBAC、内容审核、数据大屏与 RPG 配置集中在此，项目页可直接 iframe 预览。',
    full: false,
    articles: [
      {
        id: 111,
        title: '博客系统自文档 · 管理后台能力地图',
        note: '后台模块总览',
      },
      {
        id: 124,
        title: '管理端使用手册 · 导读：作者也要会用后台',
        note: '从作者视角上手后台',
      },
    ],
  },
  {
    slug: 'data-screen',
    title: 'Data Screen',
    tagline: '运营向数据大屏',
    problem: '列表和表格看不清站点整体走势，演示与巡检时需要一块「一眼概况」。',
    solution: '管理端同域下的数据大屏页，项目页嵌入预览；指标与后台工作台同源。',
    full: false,
    articles: [
      {
        id: 125,
        title: '管理端使用手册 · 工作台与数据大屏',
        note: '大屏与工作台怎么用',
      },
    ],
  },
  {
    slug: 'zone-admin',
    title: 'Zone Admin',
    tagline: 'Zone 侧管理入口',
    problem: 'Zone 内容与权限不宜和博客后台完全混在同一套菜单里，需要独立运营入口。',
    solution: '独立 Zone Admin 地址，项目页提供登录预览；与 Zone H5 成对出现。',
    full: false,
    articles: [],
  },
];

/** 按文章 id 查找「出自哪些项目」（详情页回链） */
export function findProjectsByArticleId(articleId: string | number): ProjectStory[] {
  const id = String(articleId);
  return PROJECT_STORIES.filter(story => story.articles.some(a => String(a.id) === id));
}

/** 按 slug 取叙事（页面组装用） */
export function getProjectStory(slug: string): ProjectStory | undefined {
  return PROJECT_STORIES.find(s => s.slug === slug);
}
