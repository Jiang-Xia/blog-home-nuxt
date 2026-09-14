/**
 * Welcome Featured：组装文章 / RPG / 项目橱窗幻灯片。
 * 数据来源：POST /article/list、GET /rpg/leaderboard；项目为 constants 静态 Demo。
 * 欢迎页无 RpgGlobalInit，RPG 用公开榜首，避免未登录打 /rpg/status 弹 toast。
 */
import { getArticleList } from '@/api/article';
import { getRpgLeaderboard } from '@/api/rpg';
import type { WelcomeFeaturedSlide } from '~/constants/welcome-featured';
import {
  WELCOME_FEATURED_FALLBACK_SLIDE,
  WELCOME_PROJECT_SLIDES,
  WELCOME_RPG_FALLBACK_SLIDE,
} from '~/constants/welcome-featured';

const ROTATE_MS = 5500;

/** 摘要过长不进玻璃副文，避免打碎留白 */
function shortDescription(raw: unknown): string {
  const desc = typeof raw === 'string' ? raw.trim() : '';
  if (desc && desc.length <= 90) {
    return desc;
  }
  return '';
}

/** 拉取最新公开文 → Featured 幻灯片；无文返回 null */
async function fetchArticleSlide(): Promise<WelcomeFeaturedSlide | null> {
  try {
    const res = await getArticleList({
      page: 1,
      pageSize: 1,
      client: true,
      sort: 'DESC',
      category: '',
      tags: [],
      title: '',
      description: '',
      content: '',
    });
    const item = res?.list?.[0];
    if (!item?.id || !item?.title) {
      return null;
    }
    return {
      id: `article-${item.id}`,
      kind: 'article',
      eyebrow: 'Featured',
      title: String(item.title),
      body: shortDescription(item.description),
      cta: '阅读全文',
      to: `/detail/${item.id}`,
    };
  }
  catch {
    return null;
  }
}

/**
 * 公开排行榜榜首作 RPG 橱窗；失败用静态冒险文案。
 * 欢迎页访客未登录时也能看到「站里正在玩什么」。
 */
async function fetchRpgSlide(): Promise<WelcomeFeaturedSlide> {
  try {
    const board = await getRpgLeaderboard('level', 1, 'total');
    const top = Array.isArray(board) ? board[0] : null;
    if (!top?.nickname) {
      return WELCOME_RPG_FALLBACK_SLIDE;
    }
    const level = Number(top.level) || 0;
    const signDays = Number(top.totalSignDays) || 0;
    const parts = [`Lv.${level}`];
    if (signDays > 0) {
      parts.push(`累计签到 ${signDays} 天`);
    }
    return {
      id: `rpg-top-${top.uid ?? top.rank ?? 0}`,
      kind: 'rpg',
      eyebrow: 'Adventure',
      title: String(top.nickname),
      body: `当前榜首 · ${parts.join(' · ')}`,
      cta: '进入冒险',
      to: '/rpg',
    };
  }
  catch {
    return WELCOME_RPG_FALLBACK_SLIDE;
  }
}

/**
 * SSR 组装幻灯片列表；至少含 RPG 兜底或完全失败时的 fallback。
 */
export function useWelcomeFeaturedSlides() {
  const { data: slides } = useAsyncData(
    'welcome_featured_slides',
    async (): Promise<WelcomeFeaturedSlide[]> => {
      const [article, rpg] = await Promise.all([fetchArticleSlide(), fetchRpgSlide()]);
      const list: WelcomeFeaturedSlide[] = [];
      if (article) {
        list.push(article);
      }
      list.push(rpg);
      list.push(...WELCOME_PROJECT_SLIDES);
      return list.length > 0 ? list : [WELCOME_FEATURED_FALLBACK_SLIDE];
    },
    {
      default: () => [WELCOME_FEATURED_FALLBACK_SLIDE],
    },
  );

  const index = ref(0);
  const paused = ref(false);

  const current = computed(() => {
    const list = slides.value ?? [];
    if (list.length === 0) {
      return WELCOME_FEATURED_FALLBACK_SLIDE;
    }
    return list[index.value % list.length] ?? WELCOME_FEATURED_FALLBACK_SLIDE;
  });

  const count = computed(() => slides.value?.length ?? 0);

  /** 圆点 / 程序跳到指定幻灯片 */
  const go = (i: number) => {
    const n = count.value;
    if (n <= 0) {
      return;
    }
    index.value = ((i % n) + n) % n;
  };

  /** 下一张；单张时 no-op */
  const next = () => {
    if (count.value <= 1) {
      return;
    }
    go(index.value + 1);
  };

  /**
   * 自动轮播：多张且未开 reduce-motion；悬停 paused 时停表。
   */
  onMounted(() => {
    if (count.value <= 1) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const timer = window.setInterval(() => {
      if (!paused.value) {
        next();
      }
    }, ROTATE_MS);
    onBeforeUnmount(() => window.clearInterval(timer));
  });

  return {
    slides,
    current,
    index,
    count,
    paused,
    go,
    next,
  };
}
