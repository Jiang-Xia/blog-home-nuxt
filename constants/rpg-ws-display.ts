/**
 * RPG WebSocket 反馈文案（非 rpg_item_config 数据）
 * 社交 action、经验来源等 UI 标签
 */

/** 社交互动 action → 中文标签（与 SocialReceivedPayload.action 对齐） */
export const SOCIAL_ACTION_LABEL: Record<string, string> = {
  cheer: '加油', // HP+
  egg: '扔鸡蛋', // HP-
  flower: '送鲜花', // 声望+
};

/** 经验来源 → 中文标签（与后端 ExpReason / ws-events EXP_REASON_LABEL 对齐，供前端兜底） */
export const EXP_REASON_LABEL: Record<string, string> = {
  sign_in: '签到',
  comment: '评论',
  msgboard: '留言',
  reply: '回复',
  article: '发文',
  like: '点赞',
  collect: '收藏',
  quest: '任务',
  achievement: '成就',
  lottery: '抽奖',
};

/** 排行榜 period → 中文标签（与 RankChangePayload.period 对齐） */
export const LEADERBOARD_PERIOD_LABEL: Record<string, string> = {
  week: '周榜',
  month: '月榜',
  season: '赛季榜',
};

/** 公会事件 type → 中文文案（GuildEventPayload.type） */
export function formatGuildEventMessage(
  type: 'memberJoined' | 'memberLeft' | 'guildCreated',
  nickname: string,
  guildName: string,
): string {
  switch (type) {
    case 'memberJoined':
      return `👥 ${nickname} 加入了公会「${guildName}」`;
    case 'memberLeft':
      return `👋 ${nickname} 退出了公会「${guildName}」`;
    case 'guildCreated':
      return `🏰 公会「${guildName}」已创建`;
    default:
      return `公会「${guildName}」有变动`;
  }
}
