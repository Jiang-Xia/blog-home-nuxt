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
}

/** 他人公开主页数据（SSR：await useAsyncData 后服务端再输出 HTML） */
export async function usePublicProfile(uid: Ref<number | string | undefined>) {
  const { data, pending, error, refresh } = await useAsyncData(
    () => `publicProfile_${uid.value}`,
    async (): Promise<PublicProfilePayload> => {
      const id = uid.value;
      if (!id) {
        return { profile: null, articles: [], collects: [], likes: [] };
      }

      const profile = await getPublicProfile(id);
      if (!profile) {
        return { profile: null, articles: [], collects: [], likes: [] };
      }

      const [articlesRes, collectsRes, likesRes] = await Promise.all([
        getPublicArticles(id),
        getPublicCollects(id),
        getPublicLikes(id),
      ]);

      return {
        profile,
        articles: articlesRes?.list ?? [],
        collects: collectsRes?.list ?? [],
        likes: likesRes?.list ?? [],
      };
    },
    { watch: [uid] },
  );

  const profile = computed(() => data.value?.profile ?? null);
  const articles = computed(() => data.value?.articles ?? []);
  const collects = computed(() => data.value?.collects ?? []);
  const likes = computed(() => data.value?.likes ?? []);
  const loading = computed(() => pending.value);

  return {
    profile,
    articles,
    collects,
    likes,
    loading,
    error,
    refresh,
    fetchProfile: refresh,
    fetchArticles: refresh,
    fetchCollects: refresh,
    fetchLikes: refresh,
  };
}
