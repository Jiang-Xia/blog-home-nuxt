import { useState } from '#app';
import { getPublicRpgStatus } from '~~/api/profile';

interface AuthorRpgBrief {
  level: number;
  reputation: number;
}

/**
 * 批量缓存作者 RPG 等级（文章列表等场景）
 */
export function useAuthorRpgLevels() {
  const levelCache = useState<Record<number, AuthorRpgBrief>>('author-rpg-levels', () => ({}));
  const loadingSet = useState<Record<number, boolean>>('author-rpg-loading', () => ({}));

  const getAuthorLevel = (uid?: number | null): number | null => {
    if (!uid) return null;
    return levelCache.value[uid]?.level ?? null;
  };

  const fetchLevelsForUids = async (uids: number[]) => {
    if (!import.meta.client) return;

    const unique = [...new Set(uids.filter(Boolean))];
    const pending = unique.filter(
      uid => levelCache.value[uid] === undefined && !loadingSet.value[uid],
    );
    if (pending.length === 0) return;

    pending.forEach((uid) => {
      loadingSet.value = { ...loadingSet.value, [uid]: true };
    });

    await Promise.all(
      pending.map(async (uid) => {
        try {
          const res = await getPublicRpgStatus(uid);
          levelCache.value = {
            ...levelCache.value,
            [uid]: {
              level: res?.level ?? 1,
              reputation: res?.reputation ?? 0,
            },
          };
        }
        catch {
          levelCache.value = {
            ...levelCache.value,
            [uid]: { level: 1, reputation: 0 },
          };
        }
        finally {
          const { [uid]: _loading, ...rest } = loadingSet.value;
          loadingSet.value = rest;
        }
      }),
    );
  };

  return {
    levelCache,
    getAuthorLevel,
    fetchLevelsForUids,
  };
}
