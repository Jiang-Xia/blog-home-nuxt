import {
  getPublicProfile,
  getPublicArticles,
  getPublicCollects,
  getPublicLikes,
} from '~~/api/profile';

export function usePublicProfile(uid: Ref<number | string | undefined>) {
  const profile = ref<any>(null);
  const articles = ref<any[]>([]);
  const collects = ref<any[]>([]);
  const likes = ref<any[]>([]);
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

  const fetchCollects = async (page = 1) => {
    if (!uid.value) return;
    try {
      const res = await getPublicCollects(uid.value, page);
      collects.value = res.list || [];
    }
    catch (e) {
      console.error('[usePublicProfile] collects', e);
    }
  };

  const fetchLikes = async (page = 1) => {
    if (!uid.value) return;
    try {
      const res = await getPublicLikes(uid.value, page);
      likes.value = res.list || [];
    }
    catch (e) {
      console.error('[usePublicProfile] likes', e);
    }
  };

  const fetchAll = () => {
    fetchProfile();
    fetchArticles();
    fetchCollects();
    fetchLikes();
  };

  watch(uid, fetchAll, { immediate: true });

  return {
    profile,
    articles,
    collects,
    likes,
    loading,
    fetchProfile,
    fetchArticles,
    fetchCollects,
    fetchLikes,
  };
}
