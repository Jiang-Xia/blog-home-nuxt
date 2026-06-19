/** 博客三端仓库与站点开源/合作说明（开源页、README 引流共用） */

export const OPEN_SOURCE_PAGE_URL = 'https://jiang-xia.top/open-source';

export const GITHUB_REPOS = {
  home: {
    name: 'Blog Home Nuxt',
    label: '博客前台',
    url: 'https://github.com/Jiang-Xia/blog-home-nuxt',
    license: 'MIT',
    open: true,
  },
  admin: {
    name: 'Blog Admin',
    label: '博客后台管理',
    url: 'https://github.com/Jiang-Xia/blog-admin',
    license: 'MIT',
    open: true,
  },
  server: {
    name: 'Blog Server',
    label: '博客服务端',
    url: '',
    license: '闭源',
    open: false,
  },
} as const;

export const CONTACT = {
  email: '963798512@qq.com',
  wechat: 'jiangxia2066',
} as const;

export const OPEN_SOURCE_NOTICE
  = '本博客前台与管理端 MIT 开源；后端 API 服务（blog-server）闭源，不提供公开仓库。';

/** 开源 / 闭源边界说明 */
export const BOUNDARY_ITEMS = [
  {
    title: 'MIT 开源范围（blog-home-nuxt、blog-admin）',
    items: [
      '可 Fork、修改 UI/交互、学习前端架构，商用需保留 MIT 版权声明。',
      '欢迎 Star、Issue 与前端 PR；不包含后端源码与生产环境密钥。',
      '前台 API 封装仅描述接口契约，不代表后端实现可随意复刻上线。',
    ],
  },
  {
    title: '后端闭源（blog-server）',
    items: [
      '不提供公开 GitHub 仓库；源码、SQL 全量脚本、部署细节需购买授权或定制。',
      '禁止逆向接口批量复刻 RPG 经济、支付、RBAC 等核心逻辑并对外售卖。',
      '线上 Demo 仅供体验，不可作为后端替代品爬取或压测。',
    ],
  },
  {
    title: '赞赏 vs 付费咨询',
    items: [
      '关于页的支付宝赞赏：自愿支持作者，不含技术答疑与源码交付。',
      '付费套餐：明确交付物、次数与范围；付款前微信/邮件确认清单。',
      '未开始的答疑/未发放的源码，协商一致可全额退款。',
    ],
  },
] as const;

export const OPEN_SOURCE_FAQ = [
  {
    q: '只 Fork 前台和管理端，能跑起来吗？',
    a: '可以改 UI、对接 mock 或自建简易 API，但线上同款能力（RPG、支付、RBAC、实时推送等）依赖 blog-server。完整三端请选「源码授权」或「定制二开」。',
  },
  {
    q: '「¥199 起」「¥999 起」具体包含什么？',
    a: '起价对应各档最低交付：部署入门 = 1 次约 60 分钟文字/语音答疑；源码授权 = 单站点个人学习授权 + 源码包 + 1 次架构导读。超出范围（多站点、商用、二开）另议。',
  },
  {
    q: '需要先签协议才能咨询吗？',
    a: '不需要。咨询阶段只需说明场景与期望档位；选购「源码授权」并确认价格与交付清单后，作者再发送《源码授权协议》模板，双方确认后交付源码。',
  },
  {
    q: '源码授权后可以二次开源吗？',
    a: '不可以。授权仅限被授权人按约定用途使用，不得将 blog-server 源码再发布、转售或以 SaaS 形式对外提供。',
  },
  {
    q: '购买后是否含后续大版本更新？',
    a: '源码授权含交付日起 6 个月内的小版本同步（同 major 内）；大版本重构或新模块属于定制范畴。部署入门不含源码，自然不含版本更新。',
  },
] as const;

export interface PaidPlan {
  id: string;
  name: string;
  price: string;
  /** 起价对应的具体交付，用于心理锚点 */
  priceNote: string;
  /** 对比锚点（可选） */
  compareNote?: string;
  desc: string;
  features: string[];
  deliverables: string[];
  notIncluded: string[];
  highlight?: boolean;
  badge?: string;
}

/** 付费套餐：价格与交付以 OPEN_SOURCE_PAGE_URL 页面为准，线下确认后成交 */
export const PAID_PLANS: PaidPlan[] = [
  {
    id: 'deploy',
    name: '部署入门',
    price: '¥199 起',
    priceNote: '起价 = 1 次答疑（约 60 分钟，文字/语音二选一）',
    compareNote: '不含后端源码，适合「先跑起来」',
    desc: '适合已有服务器、想把前台+管理端+后端服务联调跑通的同学。',
    features: [
      'Node / MySQL / Redis 环境核对',
      'Docker Compose 或 PM2 部署路径讲解',
      '跨域、静态资源、Nginx 反代常见问题',
    ],
    deliverables: [
      '《部署检查清单》PDF（交付前发送）',
      '1 次集中答疑（约 60 分钟，需提前预约）',
      '答疑后 7 日内同类问题文字追问（≤3 条）',
    ],
    notIncluded: ['blog-server 源码', '代客上传服务器、代运维', '功能二开与性能调优'],
  },
  {
    id: 'source',
    name: '源码授权',
    price: '¥999 起',
    priceNote: '起价 = 单站点个人学习授权 + 完整源码包 + 1 次导读',
    compareNote: '完整三端 · 含 RPG / RBAC / 支付模块',
    desc: '适合想深入后端实现、在自有域名部署一套完整博客系统的开发者。',
    features: [
      'blog-server 完整源码（Git 只读邀请或加密压缩包）',
      '数据库初始化脚本 + patches 增量说明',
      'RBAC 菜单权限与 RPG 模块导读',
    ],
    deliverables: [
      '成交时发送《源码授权协议》模板（确认域名与档位后交付源码）',
      '源码交付 + `.env.example` 配置说明',
      '1 次架构导读（约 90 分钟，模块地图 + 联调要点）',
      '6 个月内同 major 小版本更新包（不含大版本重构）',
    ],
    notIncluded: ['多站点 / 团队商用（需升级授权）', '源码二次开源或转售', '无限次答疑与代部署'],
    highlight: true,
    badge: '推荐',
  },
  {
    id: 'custom',
    name: '定制二开',
    price: '¥3,000 起',
    priceNote: '起价 = 需求评估 + 方案报价（小型改造）',
    compareNote: '团队商用 · 功能定制 · 长期顾问',
    desc: '适合公司站点、品牌改造、新模块开发或安全加固。',
    features: [
      '需求梳理与工时评估',
      '功能开发 / 接口扩展 / 管理端联调',
      '上线 checklist 与运维建议',
    ],
    deliverables: [
      '《需求与报价确认单》（里程碑 + 验收标准）',
      '按里程碑交付代码与演示环境',
      '可选：商用源码授权、私有化部署协助',
      '可选：季度技术顾问（另议）',
    ],
    notIncluded: ['未在确认单内的需求变更（需增补报价）', '第三方云服务、域名、SSL 等费用'],
  },
];

/** 源码授权协议：成交时发送，页面仅说明流程（模板见 docs/source-license-agreement.md） */
export const LICENSE_AGREEMENT_NOTE = {
  title: '关于源码授权协议',
  body: '选购「源码授权」档位、确认交付清单与价格后再付款。付款后作者通过微信/邮件发送协议模板，填写被授权人、站点域名等信息，双方确认后交付源码。部署入门不含源码，通常无需签署本协议；定制二开以《需求与报价确认单》为准。',
  docUrl:
    'https://github.com/Jiang-Xia/blog-home-nuxt/blob/master/docs/source-license-agreement.md',
  docLabel: '协议模板预览（GitHub）',
} as const;
