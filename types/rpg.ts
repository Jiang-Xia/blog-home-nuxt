/**
 * RPG 前端类型定义
 *
 * 物品展示约定（与后端 rpg_item_config 对齐）：
 * - 称号/头像框/背包/抽奖等：只用 API 返回的 name、icon、itemTypeLabel、rarityColor 等字段
 * - 禁止新增 AVATAR_FRAME_MAP、RARITY_MAP、ITEM_TYPE_MAP 等本地物品 map
 * - 详见 blog-home-nuxt/.cursor/rules/home-15-rpg-item-display.mdc
 */

/** 稀有度展示字段（后端 item-display 下发） */
export interface RarityDisplayFields {
  rarity?: string;
  rarityLabel?: string;
  rarityColor?: string;
  rarityIcon?: string;
}

/** 装扮物品摘要（由后端 rpg_item_config 查询返回） */
export interface CosmeticItemSummary extends RarityDisplayFields {
  code: string;
  name: string;
  rarity: string;
  icon?: string;
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

/** 等级奖励（展示字段由 GET /rpg/level-rewards 从 rpg_item_config enrich 后返回） */
export interface LevelReward {
  level: number;
  currencyReward?: number;
  currencyName?: string;
  avatarFrame?: CosmeticItemSummary | null;
  title?: CosmeticItemSummary | null;
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

/** 头像框展示信息（评论 userInfo / 头像组件共用） */
export interface AvatarFrameInfo {
  code?: string;
  name?: string;
  color?: string | null;
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

/** 物品 config（含后端下发的 itemTypeLabel、rarityColor 等，前端直接渲染） */
export interface ItemConfigView {
  code: string;
  name: string;
  itemType: string;
  rarity: string;
  description?: string;
  icon?: string;
  category?: string;
  effectJson?: Record<string, any> | null;
  itemTypeLabel?: string;
  itemTypeIcon?: string;
  rarityLabel?: string;
  rarityColor?: string;
  rarityIcon?: string;
}

/** 稀有度展示（后端下发） */
export interface RarityDisplay {
  rarityLabel?: string;
  rarityColor?: string;
  rarityIcon?: string;
}

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

/** 手动经验 Buff 运行时快照（与后端 effectJson 一致） */
export interface ManualExpBuffMeta {
  durationMinutes: number;
  activated: boolean;
  /** 停用后冻结剩余效果时长 */
  paused?: boolean;
  remainingMs?: number;
}

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
  /** auto=获得即生效；manual=需手动激活（经验类） */
  triggerMode?: 'auto' | 'manual' | 'passive';
  /** manual 类型须 isActive=true 才参与加成 */
  isActive?: boolean;
  /** 手动经验 Buff：durationMinutes + activated */
  effectJson?: ManualExpBuffMeta | Record<string, unknown> | null;
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

/** 抽奖奖池（rarityLabel/Color/Icon 由后端 attachRarityDisplay 下发） */
export interface LotteryPoolItem {
  id: number;
  itemCode: string;
  name: string;
  description: string;
  grantType: string;
  probability: number;
  rarity: string;
  active: boolean;
  sort: number;
  icon?: string;
  itemTypeIcon?: string;
  rarityLabel?: string;
  rarityColor?: string;
  rarityIcon?: string;
}

/** 抽奖结果 */
export interface DrawResult {
  item: {
    code: string;
    name: string;
    description: string;
    rarity: string;
    type: string;
    icon?: string;
    itemTypeIcon?: string;
    rarityLabel?: string;
    rarityColor?: string;
    rarityIcon?: string;
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
  icon?: string;
  itemTypeIcon?: string;
  rarityLabel?: string;
  rarityColor?: string;
  rarityIcon?: string;
}

/** 背包条目（config、sourceLabel 均由后端格式化，勿本地 map） */
export interface InventoryItem {
  id: number;
  itemCode: string;
  quantity: number;
  source: string;
  sourceLabel?: string;
  config: ItemConfigView | null;
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

/** 公会成员角色中文名（非 rpg_item_config 数据，保留本地映射） */
export const GUILD_ROLE_MAP: Record<string, string> = {
  leader: '会长',
  officer: '官员',
  member: '成员',
};

/** 获取公会角色中文名 */
export function getGuildRoleLabel(role: string): string {
  return GUILD_ROLE_MAP[role] ?? role;
}

/** 格式化后端奖励详情文案（替换残留英文） */
export function formatRewardDetail(detail: string): string {
  return detail.replace(/Buff/g, '增益').replace(/EXP/g, '经验').replace(/HP/g, '生命');
}

/** 收到社交互动 / 打赏弹框类型（WebSocket socialReceived、tipReceived） */
export type RpgSocialFeedbackKind = 'cheer' | 'egg' | 'flower' | 'tip';

export interface RpgSocialFeedbackData {
  kind: RpgSocialFeedbackKind;
  fromNickname: string;
  hpDelta?: number;
  reputationDelta?: number;
  amount?: number;
  articleTitle?: string;
}

/** 赛季/限时活动摘要（GET /rpg/activities/current） */
export interface RpgActivitySummary {
  id: number;
  code: string;
  name: string;
  description: string;
  activityType: string;
  startTime: string;
  endTime: string;
  expBuffRate: number;
  posterUrl: string;
  active: boolean;
}

/** 当前活动概览：赛季主位 + 限时 tag + 实际生效倍率 */
export interface CurrentActivitiesOverview {
  season: RpgActivitySummary | null;
  limitedTime: RpgActivitySummary[];
  effectiveExpBuffRate: number;
}

/** 活动海报分享结果 */
export interface SharePosterResult {
  posterUrl: string;
  activityCode: string;
  activityName: string;
  activityType: string;
  description: string;
  expBuffRate: number;
  shareUrl: string;
}
