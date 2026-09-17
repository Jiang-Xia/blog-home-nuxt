/**
 * Welcome Featured 橱窗：类型、兜底文案；项目幻灯片由 project-stories 单源生成。
 */
import { getProjectStory, WELCOME_FEATURED_PROJECT_SLUGS } from '~/constants/project-stories';

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

/** RPG 无排行 / 无登录态数据时的静态橱窗 */
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
 * 从 PROJECT_STORIES 生成 Featured 项目幻灯片（锚点 /projects#slug）。
 * 标题/短句只维护项目叙事一处，避免与 Welcome 双写漂移。
 */
export function buildWelcomeProjectSlides(): WelcomeFeaturedSlide[] {
  const slides: WelcomeFeaturedSlide[] = [];
  for (const slug of WELCOME_FEATURED_PROJECT_SLUGS) {
    const story = getProjectStory(slug);
    if (!story) {
      continue;
    }
    slides.push({
      id: `project-${story.slug}`,
      kind: 'project',
      eyebrow: 'Project',
      title: story.title,
      body: story.tagline,
      cta: '查看项目',
      to: `/projects#${story.slug}`,
    });
  }
  return slides;
}
