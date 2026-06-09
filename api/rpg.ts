import request from '~~/api/request';

/** 每日签到 */
export const rpgSignIn = () => {
  return request.post('/rpg/sign');
};

/** 获取签到信息 */
export const getRpgSignInfo = () => {
  return request.get('/rpg/sign-info');
};

/** 获取RPG完整状态 */
export const getRpgStatus = () => {
  return request.get('/rpg/status');
};

/** 获取敏感词命中记录 */
export const getRpgHitRecords = (page = 1, pageSize = 10) => {
  return request.get('/rpg/hit-records', { page, pageSize });
};

/** 获取所有等级奖励配置 */
export const getRpgLevelRewards = () => {
  return request.get('/rpg/level-rewards');
};

/** 获取角色专属奖励配置 */
export const getRpgRoleRewards = () => {
  return request.get('/rpg/role-rewards');
};

/** 获取RPG排行榜 */
export const getRpgLeaderboard = (type: 'exp' | 'signDays' | 'level' = 'exp', limit = 10) => {
  return request.get('/rpg/leaderboard', { type, limit });
};

/** 获取禁言状态 */
export const getRpgBanStatus = () => {
  return request.get('/rpg/ban-status');
};

/** 获取成就列表（公开） */
export const getAchievements = () => {
  return request.get('/rpg/achievements');
};

/** 获取我的成就进度（需登录） */
export const getMyAchievements = () => {
  return request.get('/rpg/my-achievements');
};

/** 获取每日任务列表（公开） */
export const getQuests = () => {
  return request.get('/rpg/quests');
};

/** 获取我的任务进度（需登录） */
export const getMyQuests = () => {
  return request.get('/rpg/my-quests');
};

/** 领取任务奖励（需登录） */
export const claimQuestReward = (questCode: string) => {
  return request.post('/rpg/quest/claim', { questCode });
};

/** 获取任务统计（需登录） */
export const getQuestStats = () => {
  return request.get('/rpg/quest-stats');
};

/** 获取我的Buff列表（需登录） */
export const getMyBuffs = () => {
  return request.get('/rpg/my-buffs');
};

/** 获取抽奖奖池（公开） */
export const getLotteryPool = () => {
  return request.get('/rpg/lottery/pool');
};

/** 执行抽奖（需登录） */
export const lotteryDraw = (count = 1) => {
  return request.post('/rpg/lottery/draw', { count });
};

/** 获取抽奖记录（需登录） */
export const getLotteryHistory = (page = 1, pageSize = 20) => {
  return request.get('/rpg/lottery/history', { page, pageSize });
};

/** 获取抽奖券数量（需登录） */
export const getLotteryTickets = () => {
  return request.get('/rpg/lottery/tickets');
};
