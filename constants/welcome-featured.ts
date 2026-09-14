/**
 * Welcome Featured 橱窗轮播条目与项目 Demo 常量。
 * 项目文案为站内展示用静态配置（与 /projects 对应），不接 API。
 */
export interface WelcomeFeaturedSlide {
  /** 稳定 key，供 Transition / 圆点 */
  id: string;
  kind: 'article' | 'rpg' | 'project' | 'fallback';
  eyebrow: string;
  /** 主句；fallback 可为空，仅展示 body */
  title: string;
  body: string;
  cta: string;
  to: string;
}

/** 接口全挂时的单卡兜底（保持原 Asme 文案） */
export const WELCOME_FEATURED_FALLBACK_SLIDE: WelcomeFeaturedSlide = {
  id: 'fallback',
  kind: 'fallback',
  eyebrow: 'Our Approach',
  title: '',
  body: '从一篇文章、一个工具到一场冒险。先提问，再动手；每一次回答，都打开下一扇门。',
  cta: '探索更多',
  to: '/',
};

/** RPG 无排行数据时的静态橱窗 */
export const WELCOME_RPG_FALLBACK_SLIDE: WelcomeFeaturedSlide = {
  id: 'rpg-fallback',
  kind: 'rpg',
  eyebrow: 'Adventure',
  title: '冒险中心',
  body: '签到、任务、抽奖与装扮——打开即可继续你的进度。',
  cta: '进入冒险',
  to: '/rpg',
};

/**
 * 项目 Demo 橱窗（链到 /projects，避免外链打断沉浸）。
 * 顺序即轮播顺序。
 */
export const WELCOME_PROJECT_SLIDES: WelcomeFeaturedSlide[] = [
  {
    id: 'project-uniapp',
    kind: 'project',
    eyebrow: 'Project',
    title: 'Blog UniApp',
    body: 'H5 / 小程序多端博客，扫码即可体验。',
    cta: '查看项目',
    to: '/projects',
  },
  {
    id: 'project-zone',
    kind: 'project',
    eyebrow: 'Project',
    title: 'Zone',
    body: 'Zone H5 与管理端 Demo，嵌在项目页里可点开预览。',
    cta: '查看项目',
    to: '/projects',
  },
  {
    id: 'project-datascreen',
    kind: 'project',
    eyebrow: 'Project',
    title: 'Data Screen',
    body: '数据大屏展示页，和后台同一套部署入口。',
    cta: '查看项目',
    to: '/projects',
  },
];
