/** 装扮物品摘要（由后端物品配置返回） */
export interface CosmeticItemSummary {
  code: string;
  name: string;
  rarity: string;
  color?: string | null;
}

/** RPG状态完整响应 */
export interface RpgStatus {
  level: number;
  exp: number;
  lifeValue: number;
  unlockedAvatarFrames: CosmeticItemSummary[];
  unlockedTitles: CosmeticItemSummary[];
  totalSignDays: number;
  consecutiveSignDays: number;
  lastSignDate: string | null;
  sensitiveHitsCount: number;
  zeroLifeCount: number;
  banStartTime: string | null;
  banEndTime: string | null;
  roleReward: RoleReward | null;
  equippedTitle?: string | null;
  equippedAvatarFrame?: string | null;
  equippedPetId?: number | null;
  currency?: number;
  reputation?: number;
  lotteryPityCounter?: number;
  lotteryTickets?: number;
}

/** 签到结果 */
export interface SignInResult {
  success: boolean;
  message: string;
  exp: number;
  level: number;
  totalSignDays: number;
  consecutiveSignDays: number;
  lifeRecovered: number;
  bonusExp: number;
  bonusLabel: string;
  levelUp: LevelUpResult | null;
}

/** 升级结果 */
export interface LevelUpResult {
  oldLevel: number;
  newLevel: number;
  unlockedRewards: LevelReward[];
}

/** 等级奖励配置 */
export interface LevelReward {
  level: number;
  avatarFrame?: string;
  title?: string;
  titleName?: string;
  currencyReward?: number;
}

/** 角色专属奖励配置 */
export interface RoleReward {
  roleId: number;
  roleName: string;
  avatarFrame: string;
  title: string;
  titleName: string;
  avatarFrameName?: string;
  avatarFrameColor?: string | null;
}

/** 签到信息 */
export interface SignInfo {
  signedToday: boolean;
  totalSignDays: number;
  consecutiveSignDays: number;
  lastSignDate: string | null;
  nextBonusAt: number | null;
}

/** 禁言状态 */
export interface BanStatus {
  banned: boolean;
  banEndTime: string | null;
  remainingMs: number;
}

/** 敏感词命中记录 */
export interface SensitiveHitRecord {
  id: number;
  sourceType: 'comment' | 'msgboard' | 'reply';
  sourceId: string;
  content: string;
  hitWords: string;
  uid: number | null;
  ip: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createTime: string;
}

/** 命中记录分页响应 */
export interface HitRecordsResponse {
  list: SensitiveHitRecord[];
  pagination: {
    total: number;
    pageSize: number;
    page: number;
    totalPages: number;
  };
}

/** 头像框样式映射 */
export const AVATAR_FRAME_MAP: Record<string, { name: string; color: string }> = {
  frame_a: { name: '初级头像框', color: '#4ade80' },
  frame_b: { name: '中级头像框', color: '#60a5fa' },
  frame_c: { name: '高级头像框', color: '#c084fc' },
  frame_d: { name: '稀有头像框', color: '#fbbf24' },
  frame_super_admin: { name: '至尊站长框', color: '#ef4444' },
  frame_admin: { name: '管理员专属框', color: '#f97316' },
  lottery_frame_star: { name: '抽奖头像框·星芒', color: '#8b5cf6' },
};

/** 称号显示名称映射 */
export const TITLE_NAME_MAP: Record<string, string> = {
  bronze_master: '青铜达人',
  silver_master: '白银大师',
  gold_legend: '黄金传说',
  super_admin: '站长',
  admin: '守护者',
  lottery_title_writer: '抽奖称号·作家',
};

/** 公会成员角色 */
export const GUILD_ROLE_MAP: Record<string, string> = {
  leader: '会长',
  officer: '官员',
  member: '成员',
};

/** 排行榜条目 */
export interface LeaderboardEntry {
  rank: number;
  uid: number;
  nickname: string;
  avatar: string;
  level: number;
  exp: number;
  totalSignDays: number;
  consecutiveSignDays: number;
}

/** 排行榜类型 */
export type LeaderboardType = 'exp' | 'signDays' | 'level';

/** 成就定义 */
export interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string;
  category: 'creation' | 'social' | 'exploration' | 'sign' | 'special';
  icon: string;
  maxProgress: number;
  expReward: number;
  badge: { color: string } | null;
  sort: number;
}

/** 用户成就进度（合并了成就定义与用户进度） */
export interface UserAchievementProgress extends Achievement {
  progress: number;
  completed: boolean;
  completedAt: string | null;
}

/** 成就分类显示名称 */
export const ACHIEVEMENT_CATEGORY_MAP: Record<string, string> = {
  creation: '创作系',
  social: '社交系',
  exploration: '探索系',
  sign: '签到系',
  special: '特殊系',
};

/** 成就图标映射 */
export const ACHIEVEMENT_ICON_MAP: Record<string, string> = {
  'pen': '✍️',
  'books': '📚',
  'library': '🏛️',
  'crown': '👑',
  'chat': '💬',
  'megaphone': '📢',
  'reply': '↩️',
  'board': '📝',
  'calendar': '📅',
  'calendar-check': '🗓️',
  'trophy': '🏆',
  'fire': '🔥',
  'flame': '🔥',
  'heart': '❤️',
  'hearts': '💕',
  'bookmark': '🔖',
  'bookmarks': '📑',
  'star': '⭐',
  'stars': '✨',
  'crown-star': '👑',
};

/** 每日任务定义 */
export interface Quest {
  id: number;
  code: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly';
  targetAction: string;
  targetCount: number;
  expReward: number;
  active: boolean;
}

/** 用户任务进度（合并了任务定义与用户进度） */
export interface UserQuestProgress extends Quest {
  progress: number;
  completed: boolean;
  claimed: boolean;
}

/** 任务统计 */
export interface QuestStats {
  total: number;
  completed: number;
  claimed: number;
}

/** Buff类型 */
export type BuffType = 'exp_boost' | 'hp_regen' | 'ban_reduction' | 'shield' | 'lucky';

/** 用户Buff实例 */
export interface UserBuff {
  id: number;
  uid: number;
  buffCode: string;
  buffType: BuffType;
  name: string;
  description: string;
  value: number;
  expireAt: string;
  remainingUses: number;
  createTime: string;
}

/** Buff类型显示配置 */
export const BUFF_TYPE_MAP: Record<BuffType, { icon: string; color: string; label: string }> = {
  exp_boost: { icon: '✨', color: '#8b5cf6', label: '经验加成' },
  hp_regen: { icon: '❤️‍🔥', color: '#ef4444', label: '生命恢复' },
  ban_reduction: { icon: '🛡️', color: '#3b82f6', label: '禁言减免' },
  shield: { icon: '🔰', color: '#10b981', label: '护盾' },
  lucky: { icon: '⭐', color: '#f59e0b', label: '幸运' },
};

/** 抽奖奖池物品 */
export interface LotteryPoolItem {
  id: number;
  code: string;
  name: string;
  description: string;
  type: 'exp' | 'buff' | 'achievement' | 'ticket';
  rewardData: Record<string, any>;
  probability: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  active: boolean;
  sort: number;
}

/** 抽奖结果 */
export interface DrawResult {
  item: {
    code: string;
    name: string;
    description: string;
    rarity: string;
    type: string;
  };
  rewardDetail?: string;
}

/** 抽奖记录 */
export interface LotteryRecord {
  id: number;
  uid: number;
  poolCode: string;
  poolName: string;
  poolRarity: string;
  rewardData: Record<string, any>;
  createTime: string;
}

/** 背包物品 */
export interface InventoryItem {
  id: number;
  itemCode: string;
  quantity: number;
  source: string;
  config: {
    code: string;
    name: string;
    itemType: string;
    rarity: string;
    description: string;
  } | null;
}

/** 公开主页 */
export interface PublicProfile {
  uid: number;
  nickname: string;
  avatar: string;
  intro: string;
  level: number;
  reputation: number;
  loadout: any;
  completedAchievements: any[];
}

/** 排行榜 period/type 扩展 */
export type LeaderboardPeriod = 'total' | 'week' | 'month' | 'season';
export type LeaderboardScoreType = 'exp' | 'signDays' | 'level' | 'reputation' | 'currency';

/** 系统物品类型（与后端 RpgItemType 一致） */
export type RpgItemType
  = | 'title'
    | 'avatar_frame'
    | 'pet'
    | 'equipment'
    | 'achievement'
    | 'buff'
    | 'currency'
    | 'consumable';

/** 物品类型显示配置 */
export const ITEM_TYPE_MAP: Record<string, { label: string; icon: string }> = {
  title: { label: '称号', icon: '🏅' },
  avatar_frame: { label: '头像框', icon: '🖼️' },
  pet: { label: '宠物', icon: '🐾' },
  equipment: { label: '装备', icon: '⚔️' },
  achievement: { label: '成就', icon: '🏆' },
  buff: { label: '增益', icon: '✨' },
  currency: { label: '钻石', icon: '💎' },
  consumable: { label: '消耗品', icon: '🧪' },
};

/** 抽奖奖池类型显示名称 */
export const LOTTERY_TYPE_MAP: Record<string, string> = {
  exp: '经验',
  buff: '增益',
  ticket: '抽奖券',
  achievement: '成就',
};

/** 背包物品来源显示名称 */
export const ITEM_SOURCE_MAP: Record<string, string> = {
  level_up: '等级奖励',
  lottery: '抽奖',
  lottery_reward: '抽奖奖励',
  quest: '任务',
  admin: '管理员发放',
  system: '系统',
  reward: '奖励',
  egg: '扔鸡蛋',
  flower: '送鲜花',
  cheer: '加油',
  tip: '打赏',
};

/** 稀有度显示配置 */
export const RARITY_MAP: Record<string, { color: string; label: string; icon: string }> = {
  common: { color: '#94a3b8', label: '普通', icon: '⚪' },
  rare: { color: '#3b82f6', label: '稀有', icon: '🔵' },
  epic: { color: '#8b5cf6', label: '史诗', icon: '🟣' },
  legendary: { color: '#f59e0b', label: '传说', icon: '🟡' },
};

/** 获取物品类型中文名 */
export function getItemTypeLabel(type: string): string {
  return ITEM_TYPE_MAP[type]?.label ?? type;
}

/** 获取稀有度中文名 */
export function getRarityLabel(rarity: string): string {
  return RARITY_MAP[rarity]?.label ?? rarity;
}

/** 获取抽奖类型中文名 */
export function getLotteryTypeLabel(type: string): string {
  return LOTTERY_TYPE_MAP[type] ?? type;
}

/** 获取物品来源中文名 */
export function getItemSourceLabel(source: string): string {
  return ITEM_SOURCE_MAP[source] ?? source;
}

/** 获取头像框中文名 */
export function getAvatarFrameName(code: string): string {
  return AVATAR_FRAME_MAP[code]?.name ?? code;
}

/** 获取称号中文名 */
export function getTitleName(code: string): string {
  return TITLE_NAME_MAP[code] ?? code;
}

/** 获取公会角色中文名 */
export function getGuildRoleLabel(role: string): string {
  return GUILD_ROLE_MAP[role] ?? role;
}

/** 格式化后端奖励详情文案（替换残留英文） */
export function formatRewardDetail(detail: string): string {
  return detail.replace(/Buff/g, '增益').replace(/EXP/g, '经验').replace(/HP/g, '生命');
}
