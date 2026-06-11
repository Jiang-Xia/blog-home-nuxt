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
export const getRpgLeaderboard = (
  type: 'exp' | 'signDays' | 'level' | 'reputation' | 'fragments' = 'exp',
  limit = 10,
  period: 'total' | 'week' | 'month' | 'season' = 'total',
) => {
  return request.get('/rpg/leaderboard', { type, limit, period });
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
export const lotteryDraw = (count = 1, currency: 'ticket' | 'fragments' = 'ticket') => {
  return request.post('/rpg/lottery/draw', { count, currency });
};

/** 获取抽奖记录（需登录） */
export const getLotteryHistory = (page = 1, pageSize = 20) => {
  return request.get('/rpg/lottery/history', { page, pageSize });
};

/** 获取抽奖券数量（需登录） */
export const getLotteryTickets = () => {
  return request.get('/rpg/lottery/tickets');
};

/** 背包 */
export const getRpgInventory = (itemType?: string) => {
  return request.get('/rpg/inventory', itemType ? { itemType } : {});
};

/** 穿戴详情 */
export const getRpgLoadout = () => request.get('/rpg/loadout');

/** 穿戴 */
export const equipLoadout = (data: { slot: string; itemCode?: string; petId?: number }) =>
  request.post('/rpg/loadout/equip', data);

/** 卸下 */
export const unequipLoadout = (slot: string) => request.post('/rpg/loadout/unequip', { slot });

/** 宠物 */
export const getMyPets = () => request.get('/rpg/pets');
export const getPetCatalog = () => request.get('/rpg/pets/catalog');
export const summonPet = (itemCode: string) => request.post('/rpg/pets/summon', { itemCode });
export const renamePet = (id: number, nickname: string) =>
  request.patch(`/rpg/pets/${id}/rename`, { nickname });

/** 活动 */
export const getCurrentActivity = () => request.get('/rpg/activities/current');
export const getActivities = () => request.get('/rpg/activities');

/** 公会 */
export const getMyGuild = () => request.get('/rpg/guild/my');
export const listGuilds = (page = 1, keyword?: string) =>
  request.get('/rpg/guilds', { page, pageSize: 20, keyword });
export const getGuildDetail = (id: number) => request.get(`/rpg/guild/${id}`);
export const createGuild = (name: string, announcement?: string) =>
  request.post('/rpg/guild/create', { name, announcement });
export const joinGuild = (guildId: number) => request.post('/rpg/guild/join', { guildId });
export const leaveGuild = () => request.post('/rpg/guild/leave');

/** 打赏 */
export const tipArticle = (articleId: number, amount: number) =>
  request.post('/rpg/article/tip', { articleId, amount });

/** 社交 */
export const socialCheer = (targetUid: number) => request.post('/rpg/social/cheer', { targetUid });
export const socialEgg = (targetUid: number) => request.post('/rpg/social/egg', { targetUid });
export const socialFlower = (targetUid: number) =>
  request.post('/rpg/social/flower', { targetUid });

/** Buff 激活 */
export const activateBuff = (id: number) => request.post(`/rpg/buff/${id}/activate`);
export const deactivateBuff = (id: number) => request.post(`/rpg/buff/${id}/deactivate`);
