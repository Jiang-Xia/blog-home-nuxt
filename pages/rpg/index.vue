<script setup lang="ts">
/**
   * RPG 冒险模块 - 冒险状态、等级奖励、抽奖与排行榜
   * 所有接口请求在本页统一发起，子组件仅负责渲染
   */
import { ref, watch, computed, onMounted } from 'vue';
import { messageError, messageSuccess } from '~~/utils/toast';
import { handleRpgCurrencyError } from '~~/utils/rpg-currency-error';
import { useRpgPage } from '~~/composables/use-rpg-page';
import { useRealtimeSocket } from '~~/composables/use-realtime-socket';
import type { DrawResult } from '~~/types/rpg';
import { triggerMockAfterLotteryDraw } from '~~/utils/rpg-dev-mock';

const route = useRoute();
const router = useRouter();
const { playBgm, stopBgm, initAudio, playSfx, muted, bgmVolume, sfxVolume, toggleMute }
  = useRpgAudio();
const profileCardRef = ref<{ setSignInResult: (_result: any) => void } | null>(null);
const lotteryBoxRef = ref<{
  showDrawResults: (_results: any[]) => void;
  cancelDrawAnimation: () => void;
} | null>(null);
const onboardingRef = ref<{ open: () => void } | null>(null);

const token = useToken();
const isLoggedIn = computed(() => !!token.value);

const activeTab = ref<'status' | 'inventory' | 'pet' | 'guild' | 'leaderboard'>('status');

const isDev = import.meta.dev;

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
  activityOverview,
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
} = useRpgPage();

const { onDataRefresh } = useRealtimeSocket();
onDataRefresh(handleSocketRefresh);

definePageMeta({
  layout: 'default',
});

useHead({
  title: 'RPG 冒险',
});

onMounted(() => {
  // 冒险页进入：初始化音频引擎；BGM 默认关闭，由工具条滑条手动开启
  void initAudio();
});

/** BGM 滑条 > 0 且未静音时播放，归零或静音时停止 */
watch([bgmVolume, muted], ([vol, isMuted]) => {
  if (!isMuted && vol > 0) void playBgm('adventure');
  else void stopBgm();
});

/** 离开冒险页时淡出 BGM，避免其他页面残留背景音乐 */
onBeforeUnmount(() => {
  void stopBgm();
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

/** Tab 切换时由父组件统一 loadTab，未登录时不请求接口 */
watch(
  activeTab,
  (tab) => {
    if (!isLoggedIn.value) return;
    loadTab(tab);
  },
  { immediate: true },
);

/** 登录成功后加载当前 Tab 数据 */
watch(isLoggedIn, (loggedIn) => {
  if (loggedIn) loadTab(activeTab.value);
});

/** 切换 Tab 并同步 URL（status 时不带 query） */
const switchTab = (tab: typeof activeTab.value) => {
  if (tab !== activeTab.value) void playSfx('tabSwitch');
  activeTab.value = tab;
  const q = tab === 'status' ? {} : { tab };
  router.replace({ query: q });
};

/** 排行榜筛选变更时重新拉榜（仅在已登录且排行 Tab 激活时） */
watch([leaderboardType, leaderboardPeriod], () => {
  if (!isLoggedIn.value) return;
  if (activeTab.value === 'leaderboard') loadTab('leaderboard');
});

/** 子组件 emit sign-in → 调 API → 回填签到结果给 ProfileCard 展示升级动画 */
const onSignIn = async () => {
  try {
    const result = await handleSignIn();
    profileCardRef.value?.setSignInResult(result);
    void playSfx('signIn');
    if (result?.message) {
      messageSuccess(result.message);
    }
    return result;
  }
  catch (e: any) {
    messageError(e?.message || '签到失败');
    return null;
  }
};

/** 领取任务奖励：Toast 由 WebSocket questReward 统一反馈 */
const onClaimQuest = async (questCode: string) => {
  try {
    await handleClaimQuest(questCode);
  }
  catch (e: any) {
    messageError(e?.message || '领取失败');
  }
};

/** 穿戴称号/头像框 */
const onEquipLoadout = async (slot: 'title' | 'avatar_frame', code: string) => {
  try {
    await handleEquipLoadout(slot, code);
    void playSfx('equip');
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
    void playSfx('unequip');
  }
  catch (e: any) {
    messageError(e?.message || '卸下失败');
  }
};

/** 抽奖动画结束后按结果增量刷新 */
const onDrawFinished = (results: DrawResult[]) => {
  void refreshAfterDraw(results);
};

/** 抽奖：API 完成后把结果交给 LotteryBox 展示动画 */
const onDraw = async (count: number, currency: 'ticket' | 'currency') => {
  beginLotteryDrawSession();
  try {
    const results = await handleDraw(count, currency);
    // dev：抽奖 API 后延迟注入 WS 挡板，测与 DrawOverlay 层叠
    triggerMockAfterLotteryDraw(rpgStatus.value);
    lotteryBoxRef.value?.showDrawResults(results);
    return results;
  }
  catch (e: any) {
    lotteryBoxRef.value?.cancelDrawAnimation();
    handleRpgCurrencyError(e, '抽奖失败');
    return [];
  }
};

/** 手动激活/停用 Buff */
const onToggleBuff = async (buff: any) => {
  try {
    const wasActive = buff.isActive;
    await handleToggleBuff(buff);
    void playSfx(wasActive ? 'buffDeactivate' : 'buffActivate');
    messageSuccess(wasActive ? '已暂停' : '已激活');
  }
  catch (e: any) {
    messageError(e?.message || '操作失败');
  }
};

/** 背包 Tab：穿戴物品 */
const onInventoryEquip = async (slot: string, itemCode: string) => {
  try {
    await handleInventoryEquip(slot, itemCode);
    void playSfx('equip');
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
    void playSfx('unequip');
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
    void playSfx('petBuy');
    messageSuccess('兑换成功');
  }
  catch (e: any) {
    handleRpgCurrencyError(e, '兑换失败');
  }
};

/** 宠物 Tab：出战 */
const onDeployPet = async (petId: number) => {
  try {
    await handleDeployPet(petId);
    void playSfx('petDeploy');
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
    void playSfx('petRest');
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
    void playSfx('petRename');
  }
  catch (e: any) {
    messageError(e?.message || '改名失败');
  }
};

/** 公会 Tab：创建 */
const onCreateGuild = async (name: string) => {
  try {
    await handleCreateGuild(name);
    void playSfx('guildCreate');
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
    void playSfx('guildJoin');
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
    void playSfx('guildLeave');
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
    <div class="rpg-theme">
      <RpgOnboarding ref="onboardingRef" />

      <div v-if="!isLoggedIn" class="mb-6 space-y-4">
        <RpgPreviewDemo />
        <div
          class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--rpg-border)] bg-[var(--rpg-bg-alt)] px-4 py-3"
        >
          <p class="text-sm text-[var(--rpg-text-body)]">
            登录后即可保存冒险进度、签到升级、领取任务奖励
          </p>
          <div class="flex gap-2">
            <CyberButton variant="primary" to="/login" class="!px-4 !py-2 text-sm">
              登录开启冒险
            </CyberButton>
            <CyberButton variant="secondary" to="/register" class="!px-4 !py-2 text-sm">
              注册
            </CyberButton>
          </div>
        </div>
      </div>

      <div v-else class="rpg-page-toolbar">
        <button
          type="button"
          class="rpg-page-toolbar__mute"
          :title="muted ? '开启音效' : '静音'"
          :aria-label="muted ? '开启音效' : '静音'"
          @click="toggleMute"
        >
          {{ muted ? '🔇' : '🔊' }}
        </button>
        <template v-if="!muted">
          <label class="rpg-page-toolbar__vol">
            <span>BGM</span>
            <input
              v-model.number="bgmVolume" type="range" min="0"
              max="1"
              step="0.05"
            >
          </label>
          <label class="rpg-page-toolbar__vol">
            <span>SFX</span>
            <input
              v-model.number="sfxVolume" type="range" min="0"
              max="1"
              step="0.05"
            >
          </label>
        </template>
        <button type="button" class="rpg-page-toolbar__guide" @click="onboardingRef?.open()">
          📖 新手引导
        </button>
      </div>

      <RpgSeasonBanner :activity-overview="activityOverview" :weather-buff="weatherBuff" />

      <div v-if="isLoggedIn" class="rpg-page-tabs mb-4" role="tablist">
        <button
          type="button"
          role="tab"
          class="rpg-page-tab"
          :class="{ active: activeTab === 'status' }"
          :aria-selected="activeTab === 'status'"
          @click="switchTab('status')"
        >
          冒险状态
        </button>
        <button
          type="button"
          role="tab"
          class="rpg-page-tab"
          :class="{ active: activeTab === 'inventory' }"
          :aria-selected="activeTab === 'inventory'"
          @click="switchTab('inventory')"
        >
          背包
        </button>
        <button
          type="button"
          role="tab"
          class="rpg-page-tab"
          :class="{ active: activeTab === 'pet' }"
          :aria-selected="activeTab === 'pet'"
          @click="switchTab('pet')"
        >
          宠物
        </button>
        <button
          type="button"
          role="tab"
          class="rpg-page-tab"
          :class="{ active: activeTab === 'guild' }"
          :aria-selected="activeTab === 'guild'"
          @click="switchTab('guild')"
        >
          公会
        </button>
        <button
          type="button"
          role="tab"
          class="rpg-page-tab"
          :class="{ active: activeTab === 'leaderboard' }"
          :aria-selected="activeTab === 'leaderboard'"
          @click="switchTab('leaderboard')"
        >
          排行
        </button>
      </div>

      <client-only>
        <div
          v-if="!isLoggedIn"
          class="cyber-glass-card p-8 text-center text-[var(--rpg-text-muted)]"
        >
          请先登录以查看冒险数据
        </div>

        <template v-else>
          <div v-if="activeTab === 'status'">
            <div class="cyber-glass-card p-3 sm:p-5">
              <div class="card-body p-2 sm:p-5">
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
                  @toggle-buff="onToggleBuff"
                />
                <RpgPanelLoading v-else compact />
              </div>
            </div>
            <div class="cyber-glass-card mt-5 p-3 sm:p-5">
              <div class="card-body p-2 sm:p-5">
                <RpgLevelRewardsPanel
                  :rpg-status="rpgStatus"
                  :level-rewards="levelRewards"
                  :loading="statusLoading"
                />
              </div>
            </div>
            <div class="cyber-glass-card mt-5 p-3 sm:p-5">
              <div class="card-body p-2 sm:p-5">
                <RpgDevEventPanel v-if="isDev" compact :context="{ status: rpgStatus }" />
                <RpgLotteryDrawMockBar v-if="isDev" :status="rpgStatus" />
                <RpgLotteryBox
                  ref="lotteryBoxRef"
                  :lottery-pool="lotteryPool"
                  :lottery-tickets="lotteryTickets"
                  :rpg-status="rpgStatus"
                  :lottery-history="lotteryHistory"
                  :drawing="drawing"
                  @draw="onDraw"
                  @finished="onDrawFinished"
                  @load-history="loadLotteryHistory"
                />
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'inventory'">
            <div class="cyber-glass-card p-3 sm:p-5">
              <div class="card-body p-2 sm:p-5">
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
            <div class="cyber-glass-card p-3 sm:p-5">
              <div class="card-body p-2 sm:p-5">
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
            <div class="cyber-glass-card p-3 sm:p-5">
              <div class="card-body p-2 sm:p-5">
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
            <div class="cyber-glass-card p-3 sm:p-5">
              <div class="card-body p-2 sm:p-5">
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
        </template>
      </client-only>
    </div>
  </CyberPageContainer>
</template>

<style scoped>
  .rpg-page-toolbar {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 8px;
    min-height: 0;
    margin-bottom: 6px;
  }

  .rpg-page-toolbar__mute,
  .rpg-page-toolbar__guide {
    border: none;
    background: transparent;
    padding: 0;
    line-height: 1;
    font-size: 13px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.65));
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .rpg-page-toolbar__guide {
    margin-left: auto;
    font-size: 11px;
  }

  .rpg-page-toolbar__mute:hover,
  .rpg-page-toolbar__guide:hover {
    color: var(--rpg-text-body, oklch(var(--bc)));
  }

  .rpg-page-toolbar__vol {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    line-height: 1;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.65));
    font-weight: 600;
    flex-shrink: 1;
    min-width: 0;
  }

  .rpg-page-toolbar__vol span {
    flex-shrink: 0;
  }

  .rpg-page-toolbar__vol input[type='range'] {
    width: 56px;
    height: 12px;
    margin: 0;
    accent-color: var(--rpg-violet, oklch(var(--p)));
  }

  .rpg-page-tabs {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 6px;
    padding: 6px;
    border-radius: 12px;
    border: 1px solid var(--rpg-border, oklch(var(--b3)));
    background: var(--rpg-surface, oklch(var(--b1)));
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .rpg-page-tabs::-webkit-scrollbar {
    display: none;
  }

  .rpg-page-tab {
    flex: 1 1 auto;
    min-width: 0;
    padding: 8px 10px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    color: var(--rpg-text-secondary, oklch(var(--bc) / 0.72));
    cursor: pointer;
    transition:
      background-color 0.2s,
      color 0.2s,
      border-color 0.2s;
  }

  .rpg-page-tab:hover {
    background: var(--rpg-bg-alt, oklch(var(--b2)));
    color: var(--rpg-text-heading, oklch(var(--bc)));
  }

  .rpg-page-tab.active {
    background: var(--rpg-violet-bg, oklch(var(--p) / 0.12));
    color: var(--rpg-violet, oklch(var(--p)));
    font-weight: 700;
    border-color: color-mix(in oklch, var(--rpg-violet, oklch(var(--p))) 45%, transparent);
    box-shadow: inset 0 0 0 1px
      color-mix(in oklch, var(--rpg-violet, oklch(var(--p))) 35%, transparent);
  }

  @media (max-width: 639px) {
    .rpg-page-tabs {
      gap: 4px;
      padding: 5px;
    }

    .rpg-page-tab {
      flex: 0 0 auto;
      min-width: auto;
      padding: 7px 11px;
      font-size: 12px;
    }
  }

  :global(html.tech-shell[data-theme='cyber-light']) .rpg-page-tab:not(.active) {
    color: var(--rpg-text-label, #475569);
    background: var(--rpg-bg-alt, #f1f5f9);
    border-color: var(--rpg-border, #e2e8f0);
  }

  :global(html.tech-shell[data-theme='cyber-light']) .rpg-page-tab.active {
    background: rgb(139 92 246 / 0.1);
    color: #6d28d9;
    border-color: rgb(139 92 246 / 0.45);
    box-shadow: inset 0 0 0 1px rgb(139 92 246 / 0.28);
  }
</style>
