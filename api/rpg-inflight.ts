/**
 * RPG GET 并发 in-flight 合并（方案 A）
 * 仅合并同一 key 进行中的 Promise，不做 TTL 缓存。
 * mutation 成功后应 clearRpgInflight，避免 refresh 搭 mutation 前的旧 in-flight。
 */
const inflight = new Map<string, Promise<unknown>>();

export function rpgDedupedGet<T>(key: string, task: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const pending = task().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, pending);
  return pending;
}

/** 清除指定 key 的 in-flight（mutation 后 refresh 前调用） */
export function clearRpgInflight(...keys: string[]) {
  for (const key of keys) inflight.delete(key);
}

/** 按前缀清除（如 inventory:、guilds:） */
export function clearRpgInflightByPrefix(prefix: string) {
  for (const key of inflight.keys()) {
    if (key.startsWith(prefix)) inflight.delete(key);
  }
}

/** mutation 成功后清除相关 GET in-flight，再返回结果 */
export function afterRpgMutation<T>(keys: string[], task: () => Promise<T>): Promise<T> {
  return task().then((result) => {
    clearRpgInflight(...keys);
    return result;
  });
}

export function afterRpgMutationWithPrefixes<T>(
  keys: string[],
  prefixes: string[],
  task: () => Promise<T>,
): Promise<T> {
  return task().then((result) => {
    clearRpgInflight(...keys);
    for (const prefix of prefixes) clearRpgInflightByPrefix(prefix);
    return result;
  });
}
