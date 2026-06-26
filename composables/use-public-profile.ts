import {
  getPublicProfile,
  getPublicArticles,
  getPublicCollects,
  getPublicLikes,
} from '~~/api/profile';

export interface PublicProfilePayload {
  profile: Record<string, any> | null;
  articles: any[];
  collects: any[];
  likes: any[];
  tabTotals: {
    articles: number;
    collects: number;
    likes: number;
  };
}

/** Tab 列表请求失败时不拖垮 profile SSR（刷新时避免误报「用户不存在」） */
async function safePublicTabFetch<T>(
  fetcher: () => Promise<{ list?: T[]; pagination?: { total?: number } } | null | undefined>,
): Promise<{ list: T[]; total: number }> {
  try {
    const res = await fetcher();
    return {
      list: res?.list ?? [],
      total: res?.pagination?.total ?? 0,
    };
  }
  catch {
    return { list: [], total: 0 };
  }
}

/** 他人公开主页数据（SSR：await useAsyncData 后服务端再输出 HTML） */
export async function usePublicProfile(uid: Ref<number | string | undefined>) {
  const { data, pending, error, refresh } = await useAsyncData(
    () => `publicProfile_${uid.value}`,
    async (): Promise<PublicProfilePayload> => {
      const id = uid.value;
      if (!id) {
        return {
          profile: null,
          articles: [],
          collects: [],
          likes: [],
          tabTotals: { articles: 0, collects: 0, likes: 0 },
        };
      }

      const profile = await getPublicProfile(id);
      if (!profile) {
        return {
          profile: null,
          articles: [],
          collects: [],
          likes: [],
          tabTotals: { articles: 0, collects: 0, likes: 0 },
        };
      }

      const [articlesRes, collectsRes, likesRes] = await Promise.all([
        safePublicTabFetch(() => getPublicArticles(id)),
        safePublicTabFetch(() => getPublicCollects(id)),
        safePublicTabFetch(() => getPublicLikes(id)),
      ]);

      return {
        profile,
        articles: articlesRes.list,
        collects: collectsRes.list,
        likes: likesRes.list,
        tabTotals: {
          articles: articlesRes.total,
          collects: collectsRes.total,
          likes: likesRes.total,
        },
      };
    },
    { watch: [uid] },
  );

  const profile = computed(() => data.value?.profile ?? null);
  const articles = computed(() => data.value?.articles ?? []);
  const collects = computed(() => data.value?.collects ?? []);
  const likes = computed(() => data.value?.likes ?? []);
  const tabTotals = computed(() => data.value?.tabTotals ?? { articles: 0, collects: 0, likes: 0 });
  const loading = computed(() => pending.value);

  return {
    profile,
    articles,
    collects,
    likes,
    tabTotals,
    loading,
    error,
    refresh,
    fetchProfile: refresh,
    fetchArticles: refresh,
    fetchCollects: refresh,
    fetchLikes: refresh,
  };
}
