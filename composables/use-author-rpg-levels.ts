import { useState } from '#app';
import { getPublicRpgLevelsBatch } from '~~/api/profile';

interface AuthorRpgBrief {
  level: number;
}

/**
 * 批量缓存作者 RPG 等级（文章列表等场景）
 */
export function useAuthorRpgLevels() {
  const levelCache = useState<Record<number, AuthorRpgBrief>>('author-rpg-levels', () => ({}));
  const batchInflight = useState<Promise<void> | null>('author-rpg-batch-inflight', () => null);
  const pendingUids = useState<number[]>('author-rpg-pending-uids', () => []);

  const getAuthorLevel = (uid?: number | null): number | null => {
    if (!uid) return null;
    return levelCache.value[uid]?.level ?? null;
  };

  const applyBatchResult = (uids: number[], data: Record<string, { level?: number }>) => {
    const next = { ...levelCache.value };
    for (const uid of uids) {
      const brief = data[String(uid)];
      next[uid] = { level: brief?.level ?? 1 };
    }
    levelCache.value = next;
  };

  const flushPendingBatch = async () => {
    while (pendingUids.value.length) {
      const batch = [...new Set(pendingUids.value)].filter(
        uid => levelCache.value[uid] === undefined,
      );
      pendingUids.value = [];
      if (!batch.length) return;

      try {
        const res = await getPublicRpgLevelsBatch(batch);
        applyBatchResult(batch, res);
      }
      catch {
        applyBatchResult(batch, {});
      }
    }
  };

  const fetchLevelsForUids = async (uids: number[]) => {
    if (!import.meta.client) return;

    const unique = [...new Set(uids.map(uid => Number(uid)).filter(id => id > 0))];
    const need = unique.filter(uid => levelCache.value[uid] === undefined);
    if (!need.length) return;

    pendingUids.value = [...new Set([...pendingUids.value, ...need])];

    if (!batchInflight.value) {
      batchInflight.value = flushPendingBatch().finally(() => {
        batchInflight.value = null;
      });
    }

    await batchInflight.value;
  };

  return {
    levelCache,
    getAuthorLevel,
    fetchLevelsForUids,
  };
}
