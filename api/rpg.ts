import request from '~~/api/request';
import { afterRpgMutation, afterRpgMutationWithPrefixes, rpgDedupedGet } from '~~/api/rpg-inflight';

/**
 * RPG 接口封装
 * GET 经 rpgDedupedGet 合并并发 in-flight；POST/PATCH mutation 成功后清除相关 key，避免 refresh 读到旧 Promise。
 */
const CORE_STATUS_KEYS = ['status', 'sign-info', 'ban-status', 'lottery/tickets'] as const;

/** 每日签到 */
export const rpgSignIn = () =>
  afterRpgMutation([...CORE_STATUS_KEYS, 'my-quests'], () => request.post('/rpg/sign'));

/** 获取签到信息 */
export const getRpgSignInfo = () => rpgDedupedGet('sign-info', () => request.get('/rpg/sign-info'));

/** 获取RPG完整状态 */
export const getRpgStatus = () => rpgDedupedGet('status', () => request.get('/rpg/status'));

/** 获取敏感词命中记录 */
export const getRpgHitRecords = (page = 1, pageSize = 10) =>
  rpgDedupedGet(`hit-records:${page}:${pageSize}`, () =>
    request.get('/rpg/hit-records', { page, pageSize }),
  );

/** 获取所有等级奖励配置 */
export const getRpgLevelRewards = () =>
  rpgDedupedGet('level-rewards', () => request.get('/rpg/level-rewards'));

/** 获取RPG排行榜 */
export const getRpgLeaderboard = (
  type: 'exp' | 'signDays' | 'level' | 'reputation' | 'currency' = 'exp',
  limit = 10,
  period: 'total' | 'week' | 'month' | 'season' = 'total',
) =>
  rpgDedupedGet(`leaderboard:${type}:${limit}:${period}`, () =>
    request.get('/rpg/leaderboard', { type, limit, period }),
  );

/** 获取禁言状态 */
export const getRpgBanStatus = () =>
  rpgDedupedGet('ban-status', () => request.get('/rpg/ban-status'));

/** 获取我的成就进度（需登录） */
export const getMyAchievements = () =>
  rpgDedupedGet('my-achievements', () => request.get('/rpg/my-achievements'));

/** 获取每日任务列表（公开） */
export const getQuests = () => rpgDedupedGet('quests', () => request.get('/rpg/quests'));

/** 获取我的任务进度（需登录） */
export const getMyQuests = () => rpgDedupedGet('my-quests', () => request.get('/rpg/my-quests'));

/** 领取任务奖励（需登录） */
export const claimQuestReward = (questCode: string) =>
  afterRpgMutation(['my-quests', 'status'], () => request.post('/rpg/quest/claim', { questCode }));

/** 获取我的Buff列表（需登录） */
export const getMyBuffs = () => rpgDedupedGet('my-buffs', () => request.get('/rpg/my-buffs'));

/** 获取抽奖奖池（公开） */
export const getLotteryPool = () =>
  rpgDedupedGet('lottery/pool', () => request.get('/rpg/lottery/pool'));

/** 执行抽奖（需登录） */
export const lotteryDraw = (count = 1, currency: 'ticket' | 'currency' = 'ticket') =>
  afterRpgMutationWithPrefixes([...CORE_STATUS_KEYS, 'my-buffs', 'loadout'], ['inventory:'], () =>
    request.post('/rpg/lottery/draw', { count, currency }),
  );

/** 获取抽奖记录（需登录） */
export const getLotteryHistory = (page = 1, pageSize = 20) =>
  rpgDedupedGet(`lottery/history:${page}:${pageSize}`, () =>
    request.get('/rpg/lottery/history', { page, pageSize }),
  );

/** 获取抽奖券数量（需登录） */
export const getLotteryTickets = () =>
  rpgDedupedGet('lottery/tickets', () => request.get('/rpg/lottery/tickets'));

/** 背包 */
export const getRpgInventory = (itemType?: string) =>
  rpgDedupedGet(`inventory:${itemType ?? ''}`, () =>
    request.get('/rpg/inventory', itemType ? { itemType } : {}),
  );

/** 穿戴详情 */
export const getRpgLoadout = () => rpgDedupedGet('loadout', () => request.get('/rpg/loadout'));

/** 穿戴 */
export const equipLoadout = (data: { slot: string; itemCode?: string; petId?: number }) =>
  afterRpgMutationWithPrefixes(['loadout', 'status'], ['inventory:'], () =>
    request.post('/rpg/loadout/equip', data),
  );

/** 卸下 */
export const unequipLoadout = (slot: string) =>
  afterRpgMutationWithPrefixes(['loadout', 'status'], ['inventory:'], () =>
    request.post('/rpg/loadout/unequip', { slot }),
  );

/** 宠物 */
export const getMyPets = () => rpgDedupedGet('pets', () => request.get('/rpg/pets'));

/** 宠物图鉴（可兑换宠物模板列表，公开接口） */
export const getPetCatalog = () =>
  rpgDedupedGet('pets/catalog', () => request.get('/rpg/pets/catalog'));

export const summonPet = (itemCode: string) =>
  afterRpgMutationWithPrefixes(['pets', 'loadout'], ['inventory:'], () =>
    request.post('/rpg/pets/summon', { itemCode }),
  );

export const exchangePet = (petCode: string) =>
  afterRpgMutation(['pets', 'status'], () => request.post('/rpg/pets/exchange', { petCode }));

export const renamePet = (id: number, nickname: string) =>
  afterRpgMutation(['pets'], () => request.patch(`/rpg/pets/${id}/rename`, { nickname }));

/** 活动 */
export const getCurrentActivity = () =>
  rpgDedupedGet('activities/current', () => request.get('/rpg/activities/current'));

export const shareSeasonPoster = () =>
  afterRpgMutation(['activities/current'], () => request.post('/rpg/activities/share-poster'));

export const getWeatherBuff = (city?: string) =>
  rpgDedupedGet(`weather-buff:${city ?? ''}`, () => request.get('/rpg/weather-buff', { city }));

/** 公会 */
export const getMyGuild = () => rpgDedupedGet('guild/my', () => request.get('/rpg/guild/my'));

export const listGuilds = (page = 1, keyword?: string) =>
  rpgDedupedGet(`guilds:${page}:${keyword ?? ''}`, () =>
    request.get('/rpg/guilds', { page, pageSize: 20, keyword }),
  );

export const getGuildDetail = (id: number) =>
  rpgDedupedGet(`guild:${id}`, () => request.get(`/rpg/guild/${id}`));

export const createGuild = (name: string, announcement?: string) =>
  afterRpgMutationWithPrefixes(['guild/my'], ['guilds:'], () =>
    request.post('/rpg/guild/create', { name, announcement }),
  );

export const joinGuild = (guildId: number) =>
  afterRpgMutationWithPrefixes(['guild/my'], ['guilds:'], () =>
    request.post('/rpg/guild/join', { guildId }),
  );

export const leaveGuild = () =>
  afterRpgMutationWithPrefixes(['guild/my'], ['guilds:'], () => request.post('/rpg/guild/leave'));

/** 打赏 */
export const tipArticle = (articleId: number, amount: number) =>
  afterRpgMutation(['status'], () => request.post('/rpg/article/tip', { articleId, amount }));

/** 社交 */
export const socialCheer = (targetUid: number) =>
  afterRpgMutation(['status'], () => request.post('/rpg/social/cheer', { targetUid }));

export const socialEgg = (targetUid: number) =>
  afterRpgMutation(['status'], () => request.post('/rpg/social/egg', { targetUid }));

export const socialFlower = (targetUid: number) =>
  afterRpgMutation(['status'], () => request.post('/rpg/social/flower', { targetUid }));

/** Buff 激活 */
export const activateBuff = (id: number) =>
  afterRpgMutation(['my-buffs'], () => request.post(`/rpg/buff/${id}/activate`));

export const deactivateBuff = (id: number) =>
  afterRpgMutation(['my-buffs'], () => request.post(`/rpg/buff/${id}/deactivate`));
