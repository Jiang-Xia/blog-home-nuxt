import { getPublicProfile, getPublicArticles } from '~~/api/profile';

export function usePublicProfile(uid: Ref<number | string | undefined>) {
  const profile = ref<any>(null);
  const articles = ref<any[]>([]);
  const loading = ref(false);

  const fetchProfile = async () => {
    if (!uid.value) return;
    loading.value = true;
    try {
      profile.value = await getPublicProfile(uid.value);
    }
    catch (e) {
      console.error('[usePublicProfile]', e);
    }
    finally {
      loading.value = false;
    }
  };

  const fetchArticles = async (page = 1) => {
    if (!uid.value) return;
    try {
      const res = await getPublicArticles(uid.value, page);
      articles.value = res.list || [];
    }
    catch (e) {
      console.error('[usePublicProfile] articles', e);
    }
  };

  watch(
    uid,
    () => {
      fetchProfile();
      fetchArticles();
    },
    { immediate: true },
  );

  return { profile, articles, loading, fetchProfile, fetchArticles };
}
