<script setup lang="ts">
/**
   * RPG v8 改版预览（mock 数据 · 仅 /tool/test 本地验证用，勿接业务）
   * 覆盖：分层舞台背景 / 四面板头图 / 传说流光（背包+抽奖）/ 宠物动效 / 排行榜 myRank 口径
   */
definePageMeta({
  layout: 'default',
});

useHead({
  title: 'RPG v8 预览',
});

/* ── 排行榜（未上榜 + myRank=57：验证 offBoardTip 只在 exp/total 出现）── */
const lbType = ref('exp');
const lbPeriod = ref('total');
const lbEntries = [
  {
    uid: 101,
    rank: 1,
    nickname: '青云客',
    avatar: '',
    level: 42,
    exp: 128400,
    reputation: 2100,
    currency: 3200,
    totalSignDays: 128,
  },
  {
    uid: 102,
    rank: 2,
    nickname: '墨白',
    avatar: '',
    level: 38,
    exp: 102350,
    reputation: 1850,
    currency: 2760,
    totalSignDays: 101,
  },
  {
    uid: 103,
    rank: 3,
    nickname: '星野',
    avatar: '',
    level: 35,
    exp: 98120,
    reputation: 1602,
    currency: 2410,
    totalSignDays: 96,
  },
  {
    uid: 104,
    rank: 4,
    nickname: '临江仙',
    avatar: '',
    level: 31,
    exp: 76400,
    reputation: 1240,
    currency: 1980,
    totalSignDays: 74,
  },
  {
    uid: 105,
    rank: 5,
    nickname: '拾光者',
    avatar: '',
    level: 28,
    exp: 64100,
    reputation: 1010,
    currency: 1544,
    totalSignDays: 61,
  },
];
const lbStatus = { level: 12, exp: 8600, reputation: 320, currency: 460, totalSignDays: 23 };
const lbMyRank = { rank: 57, score: 8600 };

/* ── 成就 ── */
const mkAch = (
  id: number,
  name: string,
  category: any,
  icon: string,
  rarity: string,
  rarityLabel: string,
  rarityColor: string,
  progress: number,
  max: number,
) => ({
  id,
  code: `ach-${id}`,
  name,
  description: '',
  category,
  icon,
  rarity,
  rarityLabel,
  rarityColor,
  rarityIcon: '',
  maxProgress: max,
  expReward: 50,
  badge: null,
  sort: id,
  progress,
  completed: progress >= max,
  completedAt: null,
});
const achievements = [
  mkAch(1, '初出茅庐', 'creation', 'pen', 'common', '普通', '#94a3b8', 1, 1),
  mkAch(2, '笔耕不辍', 'creation', 'books', 'rare', '稀有', '#8d7bf5', 1, 1),
  mkAch(3, '广结善缘', 'social', 'chat', 'epic', '史诗', '#b8842c', 1, 1),
  mkAch(4, '百签长老', 'sign', 'calendar', 'legendary', '传说', '#d9a13c', 1, 1),
  mkAch(5, '挥金如土', 'economy', 'gem', 'epic', '史诗', '#b8842c', 0.6 * 10, 10),
  mkAch(6, '万物有灵', 'pet', 'paw', 'legendary', '传说', '#d9a13c', 0.4 * 12, 12),
];

/* ── 背包（含 legendary 流光格）── */
const mkItem = (
  id: number,
  code: string,
  name: string,
  itemType: string,
  rarity: string,
  rarityLabel: string,
  rarityColor: string,
  icon: string,
  quantity = 1,
) => ({
  id,
  itemCode: code,
  quantity,
  source: '',
  sourceLabel: '抽奖获得',
  config: {
    code,
    name,
    itemType,
    rarity,
    icon,
    iconUrl: null,
    bgUrl: null,
    itemTypeLabel: rarityLabel,
    itemTypeIcon: '',
    rarityLabel,
    rarityColor,
    rarityIcon: '',
  },
});
const inventoryItems = [
  mkItem(1, 'title-legend', '苍穹之翼称号', 'title', 'legendary', '传说', '#d9a13c', 'crown'),
  mkItem(
    2,
    'frame-purple',
    '紫电头像框',
    'avatar_frame',
    'epic',
    '史诗',
    '#b8842c',
    'frame-purple',
  ),
  mkItem(3, 'exp-potion', '经验药水', 'consumable', 'rare', '稀有', '#8d7bf5', 'exp', 5),
  mkItem(4, 'ticket', '抽奖券', 'consumable', 'common', '普通', '#94a3b8', 'ticket', 3),
  mkItem(5, 'gem-pack', '钻石礼包', 'gift', 'legendary', '传说', '#d9a13c', 'gems'),
  mkItem(6, 'shield-charm', '守护符', 'consumable', 'rare', '稀有', '#8d7bf5', 'shield', 2),
];
const invLoadout = { titleCode: 'title-legend', avatarFrameCode: null };

/* ── 宠物（出战呼吸 / 仓库错峰 / 蛋摆动 / 图鉴头图）── */
const mkPetCfg = (code: string, name: string, icon: string, rarityColor: string) => ({
  code,
  name,
  itemType: 'pet',
  rarity: 'epic',
  icon,
  iconUrl: null,
  bgUrl: null,
  rarityColor,
  rarityLabel: '史诗',
  itemTypeIcon: '',
  itemTypeLabel: '宠物',
});
const pets = [
  {
    id: 1,
    petCode: 'pet-slime',
    nickname: '',
    level: 8,
    petExp: 320,
    petNextExp: 500,
    config: mkPetCfg('pet-slime', '果冻史莱姆', 'slime', '#8d7bf5'),
  },
  {
    id: 2,
    petCode: 'pet-fox',
    nickname: '小狐狸',
    level: 5,
    petExp: 120,
    petNextExp: 400,
    config: mkPetCfg('pet-fox', '灵狐', 'fox', '#d9a13c'),
  },
  {
    id: 3,
    petCode: 'pet-owl',
    nickname: '',
    level: 3,
    petExp: 40,
    petNextExp: 300,
    config: mkPetCfg('pet-owl', '夜枭', 'owl', '#8d7bf5'),
  },
];
const petEggs = [
  {
    itemCode: 'egg-phoenix',
    quantity: 1,
    config: { ...mkPetCfg('egg-phoenix', '凤凰蛋', 'egg-phoenix', '#d9a13c'), itemType: 'egg' },
  },
  {
    itemCode: 'egg-kirin',
    quantity: 2,
    config: { ...mkPetCfg('egg-kirin', '麒麟蛋', 'egg-kirin', '#8d7bf5'), itemType: 'egg' },
  },
];
const petCatalog = [
  { code: 'pet-slime', name: '果冻史莱姆', icon: 'slime', iconUrl: null },
  { code: 'pet-fox', name: '灵狐', icon: 'fox', iconUrl: null },
  { code: 'pet-owl', name: '夜枭', icon: 'owl', iconUrl: null },
  { code: 'pet-dragon', name: '幼龙', icon: 'dragon', iconUrl: null },
  { code: 'pet-kirin', name: '麒麟', icon: 'kirin', iconUrl: null },
  { code: 'pet-phoenix', name: '凤凰', icon: 'phoenix', iconUrl: null },
];

/* ── 公会 ── */
const myGuild = {
  id: 3,
  name: '星辉行会',
  announcement: '本周公会任务双倍贡献，大家踊跃参加！',
  memberCount: 18,
  leaderUid: 999,
  members: [
    { uid: 101, nickname: '青云客', level: 42, role: 'leader' },
    { uid: 102, nickname: '墨白', level: 38, role: 'member' },
    { uid: 103, nickname: '星野', level: 35, role: 'member' },
  ],
};
const guildList = [
  { id: 5, name: '月下吟游', memberCount: 9, announcement: '招募爱好写作的冒险者' },
  { id: 7, name: '拾荒者联盟', memberCount: 22, announcement: '' },
  { id: 9, name: '夜航星', memberCount: 14, announcement: '佛系公会，随缘签到' },
];

/* ── 抽奖 overlay（summary：2 传说 + 3 稀有；reveal：单传说）
      支持 ?overlay=summary|reveal 直接以打开状态渲染（截图/调试用）── */
const route = useRoute();
const showSummary = ref(route.query.overlay === 'summary');
const showReveal = ref(route.query.overlay === 'reveal');
/* reveal 卡的入场（revealReady）由 phase watch 触发——静态传 'reveal' 永远不会 ready，
   这里模拟真实流转：charging 600ms → reveal（phase watch 随即置 ready） */
const revealPhase = ref('charging');
onMounted(() => {
  if (showReveal.value) {
    setTimeout(() => {
      revealPhase.value = 'reveal';
    }, 600);
  }
});
const mkResult = (
  code: string,
  name: string,
  rarity: string,
  rarityLabel: string,
  rarityColor: string,
  icon: string,
  rewardDetail?: string,
) => ({
  item: {
    code,
    name,
    description: '一段装备描述文案',
    rarity,
    type: 'item',
    icon,
    iconUrl: null,
    bgUrl: null,
    itemTypeIcon: '',
    rarityLabel,
    rarityColor,
    rarityIcon: '',
  },
  rewardDetail,
});
const summaryResults = [
  mkResult('crown-gem', '龙魂宝冠', 'legendary', '传说', '#d9a13c', 'crown-gem'),
  mkResult('exp-potion', '经验药水×5', 'rare', '稀有', '#8d7bf5', 'exp', '获得 500 EXP'),
  mkResult('frame-gold', '鎏金头像框', 'legendary', '传说', '#d9a13c', 'frame-gold'),
  mkResult('ticket', '抽奖券×2', 'common', '普通', '#94a3b8', 'ticket'),
  mkResult('shield', '守护之盾', 'epic', '史诗', '#b8842c', 'shield', '防御 +8'),
];
const revealResults = [
  mkResult(
    'crown-gem',
    '龙魂宝冠',
    'legendary',
    '传说',
    '#d9a13c',
    'crown-gem',
    '全属性加成 +5%',
  ),
];
</script>

<template>
  <div class="rpg-theme rpg-v8-preview">
    <div class="rpg-stage-bg" aria-hidden="true">
      <span class="rpg-stage-bg__top" />
      <span class="rpg-stage-bg__tex" />
      <span class="rpg-stage-bg__vignette" />
    </div>

    <div class="space-y-6">
      <div class="rpg-v8-tip">
        RPG v8 改版预览 · mock 数据 ·
        亮/暗主题可从站内主题切换，动效（呼吸/摆动/流光）为动态请看录屏或真机
      </div>

      <!-- 抽奖 overlay 触发 -->
      <div class="rpg-v8-actions">
        <button class="rpg-v8-btn" @click="showSummary = true">
          五连汇总（2 传说流光）
        </button>
        <button class="rpg-v8-btn" @click="showReveal = true">
          单抽揭晓（传说）
        </button>
      </div>

      <div class="rpg-page-section p-3 sm:p-5">
        <div class="card-body p-2 sm:p-5">
          <h3 class="card-title text-base mb-3">
            冒险排行榜（myRank 口径：exp/total 显示“第 57 名”，切其他维度回退通用文案）
          </h3>
          <RpgLeaderboardPanel
            v-model:active-type="lbType"
            v-model:active-period="lbPeriod"
            :leaderboard="lbEntries"
            :rpg-status="lbStatus"
            :my-rank="lbMyRank"
            :loading="false"
          />
        </div>
      </div>

      <div class="rpg-page-section p-3 sm:p-5">
        <div class="card-body p-2 sm:p-5">
          <RpgPetPanel
            :pets="pets"
            :eggs="petEggs"
            :catalog="petCatalog"
            :equipped-pet-id="1"
            :loading="false"
          />
        </div>
      </div>

      <div class="rpg-page-section p-3 sm:p-5">
        <div class="card-body p-2 sm:p-5">
          <RpgInventoryPanel
            :items="inventoryItems"
            :loadout="invLoadout"
            :pets="pets"
            :equipped-pet-id="1"
            :loading="false"
          />
        </div>
      </div>

      <div class="rpg-page-section p-3 sm:p-5">
        <div class="card-body p-2 sm:p-5">
          <RpgAchievementPanel :achievements="achievements" />
        </div>
      </div>

      <div class="rpg-page-section p-3 sm:p-5">
        <div class="card-body p-2 sm:p-5">
          <RpgGuildPanel :my-guild="myGuild" :guild-list="guildList" :loading="false" />
        </div>
      </div>
    </div>

    <client-only>
      <RpgLotteryDrawOverlay
        :visible="showSummary"
        phase="summary"
        :pool="[]"
        :results="summaryResults"
        :draw-count="5"
        :can-redraw="true"
        @skip="showSummary = false"
        @close="showSummary = false"
        @redraw="showSummary = false"
      />
      <RpgLotteryDrawOverlay
        :visible="showReveal"
        :phase="revealPhase"
        :pool="[]"
        :results="revealResults"
        :draw-count="1"
        @skip="showReveal = false"
        @close="showReveal = false"
      />
    </client-only>
  </div>
</template>

<style scoped>
  .rpg-v8-preview {
    position: relative;
  }

  .rpg-theme > :not(.rpg-stage-bg):not(dialog):not(.rpg-bottom-tabs) {
    position: relative;
    z-index: 1;
  }

  .rpg-stage-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
    background: var(--rpg-stage-base, transparent);
  }

  .rpg-stage-bg__top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: clamp(300px, 44vh, 560px);
    background: var(--rpg-stage-top-image, transparent);
    -webkit-mask-image: linear-gradient(180deg, #000 28%, transparent 100%);
    mask-image: linear-gradient(180deg, #000 28%, transparent 100%);
  }

  .rpg-stage-bg__tex {
    position: absolute;
    inset: 0;
    background-image: var(--rpg-stage-tex-image, none);
    background-size: 140px 140px;
    opacity: var(--rpg-stage-tex-opacity, 0.5);
  }

  .rpg-stage-bg__vignette {
    position: fixed;
    inset: 0;
    background: var(--rpg-stage-vignette, none);
  }

  .rpg-v8-tip {
    border: 1.5px dashed var(--rpg-border, #e8e3f2);
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 12px;
    color: var(--rpg-text-secondary);
    background: var(--rpg-surface);
  }

  .rpg-v8-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .rpg-v8-btn {
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-size: 12.5px;
    padding: 9px 18px;
    border-radius: 10px;
    background: var(--rpg-art-violet-grad, linear-gradient(135deg, #7c5cf0, #5b3fd6));
    color: #fff;
    box-shadow: 0 4px 12px rgb(92 63 214 / 0.3);
  }
</style>
