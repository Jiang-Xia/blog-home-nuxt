<script setup lang="ts">
/**
   * RPG 冒险模块 - 冒险状态、等级奖励、抽奖与排行榜
   * 所有接口请求在本页统一发起，子组件仅负责渲染
   */
import { ref, watch } from 'vue';
import { messageError, messageSuccess } from '~~/utils/toast';
import { useRpgPage } from '~~/composables/use-rpg-page';

const route = useRoute();
const router = useRouter();
const profileCardRef = ref<{ setSignInResult: (result: any) => void } | null>(null);
const lotteryBoxRef = ref<{ showDrawResults: (results: any[]) => void } | null>(null);

const activeTab = ref<'status' | 'inventory' | 'pet' | 'guild' | 'leaderboard'>('status');

const {
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
} = useRpgPage();

definePageMeta({
  layout: 'default',
});

useHead({
  title: 'RPG 冒险',
});

/** 从 URL query.tab 同步 Tab 状态（支持深链进入背包/排行等） */
watch(
  () => route.query.tab,
  (tab) => {
    if (tab === 'leaderboard') activeTab.value = 'leaderboard';
    else if (tab === 'inventory') activeTab.value = 'inventory';
    else if (tab === 'pet') activeTab.value = 'pet';
    else if (tab === 'guild') activeTab.value = 'guild';
  },
  { immediate: true },
);

/** Tab 切换时由父组件统一 loadTab，子组件不再各自 onMounted 请求 */
watch(
  activeTab,
  (tab) => {
    loadTab(tab);
  },
  { immediate: true },
);

/** 切换 Tab 并同步 URL（status 时不带 query） */
const switchTab = (tab: typeof activeTab.value) => {
  activeTab.value = tab;
  const q = tab === 'status' ? {} : { tab };
  router.replace({ query: q });
};

/** 排行榜筛选变更时重新拉榜（仅在排行 Tab 激活时） */
watch([leaderboardType, leaderboardPeriod], () => {
  if (activeTab.value === 'leaderboard') loadTab('leaderboard');
});

/** 子组件 emit sign-in → 调 API → 回填签到结果给 ProfileCard 展示升级动画 */
const onSignIn = async () => {
  try {
    const result = await handleSignIn();
    profileCardRef.value?.setSignInResult(result);
    return result;
  }
  catch (e: any) {
    messageError(e?.message || '签到失败');
    return null;
  }
};

/** 领取任务奖励：toast 反馈，数据 refresh 在 useRpgPage 内完成 */
const onClaimQuest = async (questCode: string) => {
  try {
    await handleClaimQuest(questCode);
    messageSuccess('领取成功');
  }
  catch (e: any) {
    messageError(e?.message || '领取失败');
  }
};

/** 穿戴称号/头像框 */
const onEquipLoadout = async (slot: 'title' | 'avatar_frame', code: string) => {
  try {
    await handleEquipLoadout(slot, code);
    messageSuccess('穿戴成功');
  }
  catch (e: any) {
    messageError(e?.message || '穿戴失败');
  }
};

/** 卸下称号/头像框 */
const onUnequipLoadout = async (slot: 'title' | 'avatar_frame') => {
  try {
    await handleUnequipLoadout(slot);
  }
  catch (e: any) {
    messageError(e?.message || '卸下失败');
  }
};

/** 抽奖：API 完成后把结果交给 LotteryBox 展示动画 */
const onDraw = async (count: number, currency: 'ticket' | 'currency') => {
  try {
    const results = await handleDraw(count, currency);
    lotteryBoxRef.value?.showDrawResults(results);
    return results;
  }
  catch (e: any) {
    messageError(e?.message || '抽奖失败');
    return [];
  }
};

/** 手动激活/停用 Buff */
const onToggleBuff = async (buff: any) => {
  try {
    await handleToggleBuff(buff);
    messageSuccess(buff.isActive ? '已停用' : '已激活');
  }
  catch (e: any) {
    messageError(e?.message || '操作失败');
  }
};

/** 背包 Tab：穿戴物品 */
const onInventoryEquip = async (slot: string, itemCode: string) => {
  try {
    await handleInventoryEquip(slot, itemCode);
    messageSuccess('穿戴成功');
  }
  catch (e: any) {
    messageError(e?.message || '穿戴失败');
  }
};

/** 背包 Tab：卸下物品 */
const onInventoryUnequip = async (slot: string) => {
  try {
    await handleInventoryUnequip(slot);
  }
  catch (e: any) {
    messageError(e?.message || '卸下失败');
  }
};

/** 宠物 Tab：孵化 */
const onHatchPet = async (itemCode: string) => {
  try {
    await handleHatchPet(itemCode);
    messageSuccess('孵化成功');
  }
  catch (e: any) {
    messageError(e?.message || '孵化失败');
  }
};

/** 宠物 Tab：钻石兑换 */
const onBuyPet = async (petCode: string) => {
  try {
    await handleBuyPet(petCode);
    messageSuccess('兑换成功');
  }
  catch (e: any) {
    messageError(e?.message || '兑换失败');
  }
};

/** 宠物 Tab：出战 */
const onDeployPet = async (petId: number) => {
  try {
    await handleDeployPet(petId);
    messageSuccess('宠物已出战');
  }
  catch (e: any) {
    messageError(e?.message || '出战失败');
  }
};

/** 宠物 Tab：休息下架 */
const onRestPet = async () => {
  try {
    await handleRestPet();
    messageSuccess('宠物已休息');
  }
  catch (e: any) {
    messageError(e?.message || '操作失败');
  }
};

/** 宠物 Tab：改名 */
const onRenamePet = async (id: number, nickname: string) => {
  try {
    await handleRenamePet(id, nickname);
  }
  catch (e: any) {
    messageError(e?.message || '改名失败');
  }
};

/** 公会 Tab：创建 */
const onCreateGuild = async (name: string) => {
  try {
    await handleCreateGuild(name);
    messageSuccess('公会创建成功');
  }
  catch (e: any) {
    messageError(e?.message || '创建失败');
  }
};

/** 公会 Tab：加入 */
const onJoinGuild = async (guildId: number) => {
  try {
    await handleJoinGuild(guildId);
    messageSuccess('加入成功');
  }
  catch (e: any) {
    messageError(e?.message || '加入失败');
  }
};

/** 公会 Tab：退出 */
const onLeaveGuild = async () => {
  try {
    await handleLeaveGuild();
    messageSuccess('已退出公会');
  }
  catch (e: any) {
    messageError(e?.message || '退出失败');
  }
};
</script>

<template>
  <CyberPageContainer
    label="RPG"
    title="RPG 冒险"
    subtitle="签到升级、完成任务，在博客世界里不断冒险"
    back-to="/user/profile"
    back-label="返回个人中心"
  >
    <RpgSeasonBanner :activity="activity" :weather-buff="weatherBuff" />

    <div role="tablist" class="tabs tabs-border mb-4 flex-wrap">
      <a
        role="tab"
        class="tab"
        :class="{ 'tab-active': activeTab === 'status' }"
        @click="switchTab('status')"
      >冒险状态</a>
      <a
        role="tab"
        class="tab"
        :class="{ 'tab-active': activeTab === 'inventory' }"
        @click="switchTab('inventory')"
      >背包</a>
      <a
        role="tab"
        class="tab"
        :class="{ 'tab-active': activeTab === 'pet' }"
        @click="switchTab('pet')"
      >宠物</a>
      <a
        role="tab"
        class="tab"
        :class="{ 'tab-active': activeTab === 'guild' }"
        @click="switchTab('guild')"
      >公会</a>
      <a
        role="tab"
        class="tab"
        :class="{ 'tab-active': activeTab === 'leaderboard' }"
        @click="switchTab('leaderboard')"
      >排行</a>
    </div>

    <client-only>
      <div v-if="activeTab === 'status'">
        <div class="cyber-glass-card p-5">
          <div class="card-body p-4 sm:p-5">
            <RpgProfileCard
              v-if="!statusLoading && rpgStatus"
              ref="profileCardRef"
              :rpg-status="rpgStatus"
              :sign-info="signInfo"
              :ban-status="banStatus"
              :achievements="achievements"
              :quest-groups="questGroups"
              :buffs="buffs"
              :hit-records="hitRecords"
              :hit-records-total="hitRecordsTotal"
              :signing-in="signingIn"
              @sign-in="onSignIn"
              @equip="onEquipLoadout"
              @unequip="onUnequipLoadout"
              @claim-quest="onClaimQuest"
              @load-hit-records="loadHitRecords"
              @refresh="handleSocketRefresh"
              @toggle-buff="onToggleBuff"
            />
            <div v-else class="text-center text-base-content/50 py-8">
              加载中...
            </div>
          </div>
        </div>
        <div class="cyber-glass-card mt-5 p-5">
          <div class="card-body p-5">
            <RpgLevelRewardsPanel
              :rpg-status="rpgStatus"
              :level-rewards="levelRewards"
              :loading="statusLoading"
            />
          </div>
        </div>
        <div class="cyber-glass-card mt-5 p-5">
          <div class="card-body p-5">
            <RpgLotteryBox
              ref="lotteryBoxRef"
              :lottery-pool="lotteryPool"
              :lottery-tickets="lotteryTickets"
              :rpg-status="rpgStatus"
              :lottery-history="lotteryHistory"
              :drawing="drawing"
              @draw="onDraw"
              @load-history="loadLotteryHistory"
            />
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'inventory'">
        <div class="cyber-glass-card p-5">
          <div class="card-body p-5">
            <RpgInventoryPanel
              :items="inventoryItems"
              :loadout="loadout"
              :loading="inventoryLoading"
              @equip="onInventoryEquip"
              @unequip="onInventoryUnequip"
            />
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'pet'">
        <div class="cyber-glass-card p-5">
          <div class="card-body p-5">
            <RpgPetPanel
              :pets="pets"
              :eggs="petEggs"
              :catalog="petCatalog"
              :equipped-pet-id="equippedPetId"
              :loading="petLoading"
              @hatch="onHatchPet"
              @buy="onBuyPet"
              @deploy="onDeployPet"
              @rest="onRestPet"
              @rename="onRenamePet"
            />
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'guild'">
        <div class="cyber-glass-card p-5">
          <div class="card-body p-5">
            <RpgGuildPanel
              :my-guild="myGuild"
              :guild-list="guildList"
              :loading="guildLoading"
              @create="onCreateGuild"
              @join="onJoinGuild"
              @leave="onLeaveGuild"
            />
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'leaderboard'">
        <div class="cyber-glass-card p-5">
          <div class="card-body p-5">
            <h3 class="card-title text-base mb-3">
              冒险排行榜
            </h3>
            <RpgLeaderboardPanel
              v-model:active-type="leaderboardType"
              v-model:active-period="leaderboardPeriod"
              :leaderboard="leaderboard"
              :loading="leaderboardLoading"
            />
          </div>
        </div>
      </div>
    </client-only>
  </CyberPageContainer>
</template>
