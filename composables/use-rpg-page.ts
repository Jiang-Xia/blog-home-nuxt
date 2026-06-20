import {
  getRpgStatus,
  getRpgSignInfo,
  rpgSignIn,
  getRpgHitRecords,
  getRpgBanStatus,
  getRpgLeaderboard,
  getRpgLevelRewards,
  getMyAchievements,
  getMyQuests,
  claimQuestReward,
  getMyBuffs,
  getLotteryPool,
  lotteryDraw,
  getLotteryHistory,
  getLotteryTickets,
  getRpgInventory,
  getRpgLoadout,
  equipLoadout,
  unequipLoadout,
  getMyPets,
  getPetCatalog,
  summonPet,
  exchangePet,
  renamePet,
  getMyGuild,
  listGuilds,
  createGuild,
  joinGuild,
  leaveGuild,
  getCurrentActivity,
  getWeatherBuff,
  activateBuff,
  deactivateBuff,
} from '~~/api/rpg';
import type {
  BanStatus,
  DrawResult,
  LeaderboardPeriod,
  LeaderboardScoreType,
  LevelReward,
  LotteryPoolItem,
  LotteryRecord,
  RpgStatus,
  SensitiveHitRecord,
  SignInfo,
  SignInResult,
  UserAchievementProgress,
  UserBuff,
  UserQuestProgress,
  InventoryItem,
} from '~~/types/rpg';

/**
 * RPG 冒险页数据层：仅由 pages/rpg/index.vue 调用。
 * 子组件通过 props 渲染，mutation 在本 composable 内完成并 refresh 对应 ref。
 */
export function useRpgPage() {
  const token = useToken();
  const rpgStatus = ref<RpgStatus | null>(null);
  const signInfo = ref<SignInfo | null>(null);
  const banStatus = ref<BanStatus | null>(null);
  const achievements = ref<UserAchievementProgress[]>([]);
  const questGroups = ref<{
    daily: UserQuestProgress[];
    bounty: UserQuestProgress[];
    special: UserQuestProgress[];
  }>({ daily: [], bounty: [], special: [] });
  const buffs = ref<UserBuff[]>([]);
  const levelRewards = ref<LevelReward[]>([]);
  const lotteryPool = ref<LotteryPoolItem[]>([]);
  const lotteryTickets = ref(0);
  const lotteryHistory = ref<LotteryRecord[]>([]);
  const hitRecords = ref<SensitiveHitRecord[]>([]);
  const hitRecordsTotal = ref(0);
  const activity = ref<any>(null);
  const weatherBuff = ref<any>(null);

  const inventoryItems = ref<InventoryItem[]>([]);
  const loadout = ref<any>(null);
  const pets = ref<any[]>([]);
  const petEggs = ref<any[]>([]);
  const petCatalog = ref<any[]>([]);
  const equippedPetId = ref<number | null>(null);
  const myGuild = ref<any>(null);
  const guildList = ref<any[]>([]);
  const leaderboard = ref<any[]>([]);

  const statusLoading = ref(false);
  const inventoryLoading = ref(false);
  const petLoading = ref(false);
  const guildLoading = ref(false);
  const leaderboardLoading = ref(false);
  const signingIn = ref(false);
  const drawing = ref(false);

  const leaderboardType = ref<LeaderboardScoreType>('exp');
  const leaderboardPeriod = ref<LeaderboardPeriod>('total');

  /** 已加载过的 Tab，避免切换回来时重复请求静态数据 */
  const loadedTabs = ref(new Set<string>());

  /** 将接口返回的任务数据归一化为 daily/bounty/special 三组 */
  const parseQuestGroups = (data: any) => {
    if (Array.isArray(data)) {
      questGroups.value = { daily: data, bounty: [], special: [] };
    }
    else {
      questGroups.value = {
        daily: data.daily || [],
        bounty: data.bounty || [],
        special: data.special || [],
      };
    }
  };

  /**
   * 冒险状态 Tab 首屏数据：各接口只请求一次，写入页面级 ref 供子组件 props 渲染。
   * 副作用：请求 11 个 RPG 接口，更新 status 相关 ref，标记 loadedTabs.status。
   */
  const loadStatusTab = async () => {
    if (loadedTabs.value.has('status')) return;

    statusLoading.value = true;
    try {
      // 合并并发，避免 ProfileCard / LotteryBox / SeasonBanner 等子组件重复打相同接口
      const [status, sign, ban, ach, quests, buffList, ticketsRes, rewards, pool, act, weather]
        = await Promise.all([
          getRpgStatus(),
          getRpgSignInfo(),
          getRpgBanStatus(),
          getMyAchievements(),
          getMyQuests(),
          getMyBuffs(),
          getLotteryTickets(),
          getRpgLevelRewards(),
          getLotteryPool(),
          getCurrentActivity().catch(() => null),
          getWeatherBuff().catch(() => null),
        ]);
      rpgStatus.value = status;
      signInfo.value = sign;
      banStatus.value = ban;
      achievements.value = ach;
      parseQuestGroups(quests);
      buffs.value = buffList;
      lotteryTickets.value = ticketsRes.tickets || 0;
      levelRewards.value = rewards;
      lotteryPool.value = pool;
      activity.value = act;
      weatherBuff.value = weather;
      loadedTabs.value.add('status');
    }
    finally {
      statusLoading.value = false;
    }
  };

  /** mutation 后刷新：等级/签到/禁言/抽奖券等核心状态（并发调用自动合并） */
  let reloadStatusCoreTask: Promise<void> | null = null;
  const reloadStatusCore = async () => {
    if (reloadStatusCoreTask) return reloadStatusCoreTask;
    reloadStatusCoreTask = (async () => {
      const [status, sign, ban, ticketsRes] = await Promise.all([
        getRpgStatus(),
        getRpgSignInfo(),
        getRpgBanStatus(),
        getLotteryTickets(),
      ]);
      rpgStatus.value = status;
      signInfo.value = sign;
      banStatus.value = ban;
      lotteryTickets.value = ticketsRes.tickets || 0;
    })().finally(() => {
      reloadStatusCoreTask = null;
    });
    return reloadStatusCoreTask;
  };

  /** 刷新成就列表（WebSocket 推送或领奖后） */
  const reloadAchievements = async () => {
    achievements.value = await getMyAchievements();
  };

  /** 刷新任务分组（签到/领奖/WebSocket 后） */
  const reloadQuests = async () => {
    parseQuestGroups(await getMyQuests());
  };

  /** 刷新 Buff 列表（手动激活/停用或 WebSocket 后） */
  const reloadBuffs = async () => {
    buffs.value = await getMyBuffs();
  };

  /** 懒加载敏感词命中记录（用户展开面板时由父组件触发） */
  const loadHitRecords = async () => {
    const res = await getRpgHitRecords(1, 10);
    hitRecords.value = res.list || [];
    hitRecordsTotal.value = res.pagination?.total ?? 0;
  };

  /** 懒加载抽奖历史（用户展开记录面板时触发） */
  const loadLotteryHistory = async () => {
    const res = await getLotteryHistory(1);
    lotteryHistory.value = res.list || [];
  };

  /**
   * 背包 Tab 首屏：物品列表 + 当前穿戴。
   * 副作用：请求 inventory/loadout，标记 loadedTabs.inventory。
   */
  const loadInventoryTab = async () => {
    if (loadedTabs.value.has('inventory')) return;

    inventoryLoading.value = true;
    try {
      const [inv, lo] = await Promise.all([getRpgInventory(), getRpgLoadout()]);
      inventoryItems.value = inv.items || [];
      loadout.value = lo;
      loadedTabs.value.add('inventory');
    }
    finally {
      inventoryLoading.value = false;
    }
  };

  /** 背包穿戴/卸下后刷新物品与 loadout */
  const reloadInventory = async () => {
    const [inv, lo] = await Promise.all([getRpgInventory(), getRpgLoadout()]);
    inventoryItems.value = inv.items || [];
    loadout.value = lo;
  };

  /**
   * 宠物 Tab 首屏：已拥有宠物、可孵化蛋、兑换目录、出战状态。
   * 副作用：请求 pets/inventory/catalog/loadout，标记 loadedTabs.pet。
   */
  const loadPetTab = async () => {
    const isFirstLoad = !loadedTabs.value.has('pet');
    if (isFirstLoad) petLoading.value = true;

    try {
      // 图鉴为公开接口，单独拉取，避免被需登录接口失败拖累
      const cat = await getPetCatalog();
      petCatalog.value = cat || [];

      if (isFirstLoad) {
        const [p, inv, lo] = await Promise.all([
          getMyPets().catch(() => []),
          getRpgInventory('consumable').catch(() => ({ items: [] })),
          getRpgLoadout().catch(() => null),
        ]);
        pets.value = p || [];
        petEggs.value = (inv?.items || []).filter(
          (i: any) => i.config?.effectJson?.grantType === 'pet',
        );
        equippedPetId.value = lo?.petId ?? null;
        loadedTabs.value.add('pet');
      }
    }
    catch (e) {
      console.error('[useRpgPage] loadPetTab failed:', e);
    }
    finally {
      if (isFirstLoad) petLoading.value = false;
    }
  };

  /** 宠物 mutation（孵化/兑换/改名）后全量刷新宠物 Tab 数据 */
  const reloadPetTab = async () => {
    const [p, inv, cat, lo] = await Promise.all([
      getMyPets().catch(() => []),
      getRpgInventory('consumable').catch(() => ({ items: [] })),
      getPetCatalog().catch(() => []),
      getRpgLoadout().catch(() => null),
    ]);
    pets.value = p || [];
    petEggs.value = (inv?.items || []).filter(
      (i: any) => i.config?.effectJson?.grantType === 'pet',
    );
    petCatalog.value = cat || [];
    equippedPetId.value = lo?.petId ?? null;
  };

  /**
   * 公会 Tab 首屏：先查我的公会，未加入时再拉公会列表。
   * 副作用：请求 guild 接口，标记 loadedTabs.guild。
   */
  const loadGuildTab = async () => {
    if (loadedTabs.value.has('guild')) return;

    guildLoading.value = true;
    try {
      myGuild.value = await getMyGuild();
      if (!myGuild.value) {
        const res = await listGuilds(1);
        guildList.value = res.list || [];
      }
      loadedTabs.value.add('guild');
    }
    finally {
      guildLoading.value = false;
    }
  };

  /** 公会 mutation（创建/加入/退出）后刷新公会视图 */
  const reloadGuildTab = async () => {
    myGuild.value = await getMyGuild();
    if (!myGuild.value) {
      const res = await listGuilds(1);
      guildList.value = res.list || [];
    }
    else {
      guildList.value = [];
    }
  };

  /**
   * 排行榜 Tab：按当前 type/period 拉榜（切换筛选时会重复调用）。
   * 副作用：更新 leaderboard ref。
   */
  const loadLeaderboardTab = async () => {
    leaderboardLoading.value = true;
    try {
      leaderboard.value = await getRpgLeaderboard(
        leaderboardType.value as any,
        50,
        leaderboardPeriod.value,
      );
      loadedTabs.value.add('leaderboard');
    }
    finally {
      leaderboardLoading.value = false;
    }
  };

  /** Tab 切换入口：按 tab 名分发到对应 load*Tab（未登录时不请求） */
  const loadTab = async (tab: string) => {
    if (!token.value) return;
    if (tab === 'status') await loadStatusTab();
    else if (tab === 'inventory') await loadInventoryTab();
    else if (tab === 'pet') await loadPetTab();
    else if (tab === 'guild') await loadGuildTab();
    else if (tab === 'leaderboard') await loadLeaderboardTab();
  };

  /**
   * 签到 mutation：提交签到后刷新核心状态与任务进度。
   * @returns 签到结果（含升级信息），失败返回 null
   */
  const handleSignIn = async (): Promise<SignInResult | null> => {
    signingIn.value = true;
    try {
      const result = await rpgSignIn();
      await Promise.all([reloadStatusCore(), reloadQuests()]);
      return result;
    }
    catch (e) {
      console.error('[useRpgPage] 签到失败:', e);
      return null;
    }
    finally {
      signingIn.value = false;
    }
  };

  /** 领取任务奖励后刷新任务与核心状态 */
  const handleClaimQuest = async (questCode: string) => {
    await claimQuestReward(questCode);
    await Promise.all([reloadQuests(), reloadStatusCore()]);
  };

  /** 穿戴称号/头像框后刷新核心状态 */
  const handleEquipLoadout = async (slot: 'title' | 'avatar_frame', itemCode: string) => {
    await equipLoadout({ slot, itemCode });
    await reloadStatusCore();
  };

  /** 卸下称号/头像框后刷新核心状态 */
  const handleUnequipLoadout = async (slot: 'title' | 'avatar_frame') => {
    await unequipLoadout(slot);
    await reloadStatusCore();
  };

  /**
   * 抽奖 mutation：扣券/钻石后刷新核心状态（含券数、保底计数）。
   * @returns 抽奖结果列表
   */
  const handleDraw = async (
    count: number,
    currency: 'ticket' | 'currency',
  ): Promise<DrawResult[]> => {
    drawing.value = true;
    try {
      return await lotteryDraw(count, currency);
    }
    finally {
      drawing.value = false;
    }
  };

  /** 抽奖动画结束后刷新券数/背包等（避免动画期间多次重复请求） */
  let lotteryDrawSessionActive = false;

  /** 抽奖动画进行中：抑制 WebSocket 触发的 status/inventory 重复刷新 */
  const beginLotteryDrawSession = () => {
    lotteryDrawSessionActive = true;
  };

  const LOTTERY_INVENTORY_GRANT_TYPES = new Set([
    'item',
    'cosmetic',
    'consumable',
    'pet',
    'avatar_frame',
    'title',
  ]);

  const refreshAfterDraw = async (results: DrawResult[] = []) => {
    try {
      await reloadStatusCore();

      const needsInventory = results.some(r => LOTTERY_INVENTORY_GRANT_TYPES.has(r.item.type));
      const needsBuffs = results.some(r => r.item.type === 'buff');
      const reloads: Promise<unknown>[] = [];
      if (needsInventory && loadedTabs.value.has('inventory')) {
        reloads.push(reloadInventory());
      }
      if (needsBuffs) {
        reloads.push(reloadBuffs());
      }
      if (reloads.length) {
        await Promise.all(reloads);
      }
    }
    finally {
      lotteryDrawSessionActive = false;
    }
  };

  /** 手动激活/停用 Buff（仅 triggerMode=manual 生效） */
  const handleToggleBuff = async (
    buff: UserBuff & { triggerMode?: string; isActive?: boolean },
  ) => {
    if (buff.triggerMode !== 'manual') return;
    if (buff.isActive) await deactivateBuff(buff.id);
    else await activateBuff(buff.id);
    await reloadBuffs();
  };

  /** 背包内穿戴后刷新背包数据 */
  const handleInventoryEquip = async (slot: string, itemCode: string) => {
    await equipLoadout({ slot, itemCode });
    await reloadInventory();
  };

  /** 背包内卸下后刷新背包数据 */
  const handleInventoryUnequip = async (slot: string) => {
    await unequipLoadout(slot);
    await reloadInventory();
  };

  /** 孵化宠物蛋后刷新宠物 Tab */
  const handleHatchPet = async (itemCode: string) => {
    await summonPet(itemCode);
    await reloadPetTab();
  };

  /** 钻石兑换宠物后刷新宠物 Tab */
  const handleBuyPet = async (petCode: string) => {
    await exchangePet(petCode);
    await reloadPetTab();
  };

  /** 宠物出战：仅更新 loadout，本地同步 equippedPetId */
  const handleDeployPet = async (petId: number) => {
    await equipLoadout({ slot: 'pet', petId });
    equippedPetId.value = petId;
  };

  /** 宠物休息：卸下出战位 */
  const handleRestPet = async () => {
    await unequipLoadout('pet');
    equippedPetId.value = null;
  };

  /** 宠物改名后刷新列表 */
  const handleRenamePet = async (id: number, nickname: string) => {
    await renamePet(id, nickname);
    await reloadPetTab();
  };

  /** 创建公会后刷新公会 Tab */
  const handleCreateGuild = async (name: string) => {
    await createGuild(name);
    await reloadGuildTab();
  };

  /** 加入公会后刷新公会 Tab */
  const handleJoinGuild = async (guildId: number) => {
    await joinGuild(guildId);
    await reloadGuildTab();
  };

  /** 退出公会后刷新公会 Tab */
  const handleLeaveGuild = async () => {
    await leaveGuild();
    await reloadGuildTab();
  };

  /**
   * WebSocket 推送后按 scope 增量刷新，避免全量 reloadStatusTab。
   * scope 由 use-rpg-realtime-handlers 的 notifyDataRefresh 上报。
   */
  const handleSocketRefresh = async (
    scope: import('~~/composables/use-realtime-socket').RpgRefreshScope,
  ) => {
    if (!token.value) return;
    if (lotteryDrawSessionActive && (scope === 'status' || scope === 'inventory')) {
      return;
    }
    if (scope === 'status') await reloadStatusCore();
    else if (scope === 'achievements') await reloadAchievements();
    else if (scope === 'quests') await reloadQuests();
    else if (scope === 'buffs') await reloadBuffs();
    else if (scope === 'inventory') await reloadInventory();
    else if (scope === 'pets') await reloadPetTab();
    else if (scope === 'guild') await reloadGuildTab();
    // 用户未打开排行榜 Tab 时不请求，避免无效 API
    else if (scope === 'leaderboard' && loadedTabs.value.has('leaderboard')) {
      await loadTab('leaderboard');
    }
  };

  return {
    rpgStatus,
    signInfo,
    banStatus,
    achievements,
    questGroups,
    buffs,
    levelRewards,
    lotteryPool,
    lotteryTickets,
    lotteryHistory,
    hitRecords,
    hitRecordsTotal,
    activity,
    weatherBuff,
    inventoryItems,
    loadout,
    pets,
    petEggs,
    petCatalog,
    equippedPetId,
    myGuild,
    guildList,
    leaderboard,
    statusLoading,
    inventoryLoading,
    petLoading,
    guildLoading,
    leaderboardLoading,
    signingIn,
    drawing,
    leaderboardType,
    leaderboardPeriod,
    loadTab,
    loadHitRecords,
    loadLotteryHistory,
    handleSignIn,
    handleClaimQuest,
    handleEquipLoadout,
    handleUnequipLoadout,
    handleDraw,
    beginLotteryDrawSession,
    refreshAfterDraw,
    handleToggleBuff,
    handleInventoryEquip,
    handleInventoryUnequip,
    handleHatchPet,
    handleBuyPet,
    handleDeployPet,
    handleRestPet,
    handleRenamePet,
    handleCreateGuild,
    handleJoinGuild,
    handleLeaveGuild,
    handleSocketRefresh,
    reloadStatusCore,
    reloadAchievements,
    reloadQuests,
    reloadBuffs,
  };
}
