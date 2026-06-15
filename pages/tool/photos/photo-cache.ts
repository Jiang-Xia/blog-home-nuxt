export type DisposeFn<V> = (value: V) => void;

export class LRUCache<K, V> {
  private map = new Map<K, V>();

  constructor(
    private maxSize: number,
    private onEvict?: DisposeFn<V>,
  ) {}

  get(key: K): V | undefined {
    const value = this.map.get(key);
    if (value === undefined) return undefined;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key: K, value: V) {
    if (this.map.has(key)) {
      this.map.delete(key);
    }
    else if (this.map.size >= this.maxSize) {
      const oldest = this.map.keys().next().value as K;
      const evicted = this.map.get(oldest);
      this.map.delete(oldest);
      if (evicted !== undefined) this.onEvict?.(evicted);
    }
    this.map.set(key, value);
  }

  has(key: K) {
    return this.map.has(key);
  }

  delete(key: K) {
    const value = this.map.get(key);
    if (value !== undefined) {
      this.onEvict?.(value);
      this.map.delete(key);
    }
  }

  clear() {
    for (const value of this.map.values()) {
      this.onEvict?.(value);
    }
    this.map.clear();
  }
}
