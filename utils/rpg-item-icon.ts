/**
 * rpg_item_config.icon 键 → emoji 展示映射
 * 非物品名称 map：仅将 API 下发的 icon 键转为 UI emoji，展示名仍用 config.name
 * 有静态资产时优先走 rpg-item-asset.ts，此处为最终回退
 */
export const ITEM_ICON_MAP: Record<string, string> = {
  'pet_slime': '🫧',
  'pet_fox': '🦊',
  'pet_dragon': '🐉',
  'pet_phoenix': '🐦‍🔥',
  'pet_owl': '🦉',
  'pet_kirin': '🦄',
  'slime': '🫧',
  'fox': '🦊',
  'dragon': '🐉',
  'phoenix': '🐦‍🔥',
  'owl': '🦉',
  'kirin': '🦄',
  'egg': '🥚',
  'frame-green': '💚',
  'frame-blue': '💙',
  'frame-purple': '💜',
  'frame-gold': '💛',
  'starburst': '💫',
  'sun': '☀️',
  'rainbow': '🌈',
  'moon': '🌙',
  'medal-bronze': '🥉',
  'medal-silver': '🥈',
  'medal-gold': '🥇',
  'crown': '👑',
  'shield': '🛡️',
  'quill': '✒️',
  'cat': '🐱',
  'exp': '✨',
  'gem': '🔮',
  'ticket': '🎟️',
  'scroll': '📜',
  'diamond': '💎',
  'pen': '✒️',
  'books': '📚',
  'library': '📖',
  'chat': '💬',
  'megaphone': '📣',
  'reply': '↩️',
  'board': '📋',
  'calendar': '📅',
  'calendar-check': '✅',
  'trophy': '🏆',
  'fire': '🔥',
  'flame': '🔥',
  'heart': '❤️',
  'hearts': '💕',
  'bookmark': '🔖',
  'bookmarks': '🔖',
  'star': '⭐',
  'stars': '✨',
  'crown-star': '👑',
  'share': '🔗',
  'default': '📦',
};

/** 物品 icon 解析入参（icon 键来自 API config.icon） */
export interface RpgItemIconSource {
  icon?: string | null;
  itemTypeIcon?: string | null;
}

/** 将 API icon 键解析为 emoji；优先 config.icon，其次 itemTypeIcon，最后 📦 */
export function resolveRpgItemEmoji(source?: RpgItemIconSource | null): string {
  if (!source) return ITEM_ICON_MAP.default;
  const key = source.icon?.trim();
  if (key && key !== 'default') {
    const mapped = ITEM_ICON_MAP[key];
    if (mapped) return mapped;
  }
  if (source.itemTypeIcon) return source.itemTypeIcon;
  return ITEM_ICON_MAP.default;
}

/** 稀有度着色底：优先 rarityColor，头像框可用 frameColor */
export function resolveRpgItemTint(
  source?: { rarityColor?: string | null; color?: string | null } | null,
): string | undefined {
  return source?.rarityColor || source?.color || undefined;
}
