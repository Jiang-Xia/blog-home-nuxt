<script setup lang="ts">
/**
   * RPG 全屏弹窗本地预览（不依赖 WebSocket / 登录）
   * 覆盖 RpgGlobalInit 挂载的各类 Animation 与充值弹窗
   */
import type { RpgMasterpiecePayload } from '~~/composables/use-realtime-socket';
import type { LevelUpResult, RpgSocialFeedbackData, RpgSocialFeedbackKind } from '~~/types/rpg';

const levelUpVisible = ref(false);
const levelUpData = ref<LevelUpResult | null>(null);

const achievementVisible = ref(false);
const achievementName = ref('');
const achievementExpReward = ref(0);

const masterpieceVisible = ref(false);
const masterpieceData = ref<RpgMasterpiecePayload | null>(null);

const socialFeedbackVisible = ref(false);
const socialFeedbackData = ref<RpgSocialFeedbackData | null>(null);

const { visible: rechargeVisible, openRechargeModal, closeRechargeModal } = useRpgRecharge();

const MOCK_LEVEL_UP: LevelUpResult = {
  oldLevel: 4,
  newLevel: 5,
  unlockedRewards: [
    {
      level: 5,
      currencyReward: 50,
      currencyName: '钻石',
      avatarFrame: { code: 'frame_bronze', name: '中级头像框', rarity: 'rare' },
      title: { code: 'title_bronze', name: '青铜达人', rarity: 'rare' },
    },
  ],
};

const MOCK_MASTERPIECE: RpgMasterpiecePayload = {
  articleId: 42,
  articleTitle: '从零搭建全栈博客系统',
};

interface PreviewItem {
  label: string;
  icon?: string;
  btnClass?: string;
  run: () => void;
}

interface PreviewGroup {
  title: string;
  desc?: string;
  items: PreviewItem[];
}

const showLevelUp = () => {
  levelUpData.value = MOCK_LEVEL_UP;
  levelUpVisible.value = true;
};

const showAchievement = () => {
  achievementName.value = '评论达人';
  achievementExpReward.value = 120;
  achievementVisible.value = true;
};

const showMasterpiece = () => {
  masterpieceData.value = MOCK_MASTERPIECE;
  masterpieceVisible.value = true;
};

const showSocial = (kind: RpgSocialFeedbackKind) => {
  const base = { kind, fromNickname: '测试冒险者' };
  const data: RpgSocialFeedbackData
    = kind === 'cheer'
      ? { ...base, hpDelta: 10 }
      : kind === 'egg'
        ? { ...base, hpDelta: -5 }
        : kind === 'flower'
          ? { ...base, reputationDelta: 3 }
          : {
              ...base,
              amount: 50,
              articleTitle: '测试文章：RPG 弹窗预览',
            };
  socialFeedbackData.value = data;
  socialFeedbackVisible.value = true;
};

const previewGroups: PreviewGroup[] = [
  {
    title: '经济与充值',
    desc: '钻石不足时引导充值（支付宝小程序码）',
    items: [
      { label: '钻石不足充值', icon: '💎', btnClass: 'btn-accent', run: openRechargeModal },
    ],
  },
  {
    title: '成长反馈',
    desc: '升级 / 成就 / 神作晋升全屏动画',
    items: [
      { label: '升级动画', icon: '⬆️', btnClass: 'btn-warning', run: showLevelUp },
      { label: '成就达成', icon: '🏆', btnClass: 'btn-warning', run: showAchievement },
      { label: '神作晋升', icon: '✨', btnClass: 'btn-warning', run: showMasterpiece },
    ],
  },
  {
    title: '社交互动（收到）',
    desc: 'WebSocket socialReceived / tipReceived 对应弹框',
    items: [
      { label: '收到加油', icon: '💪', run: () => showSocial('cheer') },
      { label: '收到鸡蛋', icon: '🥚', btnClass: 'btn-warning', run: () => showSocial('egg') },
      {
        label: '收到鲜花',
        icon: '🌸',
        btnClass: 'btn-secondary',
        run: () => showSocial('flower'),
      },
      { label: '收到打赏', icon: '💎', btnClass: 'btn-accent', run: () => showSocial('tip') },
    ],
  },
];
</script>

<template>
  <div class="rpg-modal-lab rpg-theme space-y-5">
    <section v-for="group in previewGroups" :key="group.title" class="lab-group">
      <div class="lab-group-head">
        <h3 class="lab-group-title">
          {{ group.title }}
        </h3>
        <p v-if="group.desc" class="lab-group-desc">
          {{ group.desc }}
        </p>
      </div>
      <div class="lab-actions">
        <button
          v-for="item in group.items"
          :key="item.label"
          type="button"
          class="btn btn-sm btn-outline lab-btn"
          :class="item.btnClass"
          @click="item.run()"
        >
          <span v-if="item.icon" class="lab-btn-icon">{{ item.icon }}</span>
          {{ item.label }}
        </button>
      </div>
    </section>

    <ClientOnly>
      <RpgLevelUpAnimation
        :visible="levelUpVisible"
        :level-up-data="levelUpData"
        @close="
          levelUpVisible = false;
          levelUpData = null;
        "
      />
      <RpgAchievementAnimation
        :visible="achievementVisible"
        :name="achievementName"
        :exp-reward="achievementExpReward"
        @close="achievementVisible = false"
      />
      <RpgMasterpieceAnimation
        :visible="masterpieceVisible"
        :data="masterpieceData"
        @close="
          masterpieceVisible = false;
          masterpieceData = null;
        "
      />
      <RpgSocialFeedbackAnimation
        :visible="socialFeedbackVisible"
        :data="socialFeedbackData"
        @close="
          socialFeedbackVisible = false;
          socialFeedbackData = null;
        "
      />
      <RpgRechargeModal :visible="rechargeVisible" @close="closeRechargeModal" />
    </ClientOnly>
  </div>
</template>

<style scoped>
  .lab-group {
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid var(--rpg-border-subtle, oklch(var(--bc) / 0.12));
    background: color-mix(in oklch, var(--color-base-200, oklch(var(--b2))) 40%, transparent);
  }

  .lab-group-head {
    margin-bottom: 10px;
  }

  .lab-group-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--rpg-text-heading, inherit);
  }

  .lab-group-desc {
    margin-top: 2px;
    font-size: 12px;
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.55));
    line-height: 1.45;
  }

  .lab-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .lab-btn {
    gap: 4px;
  }

  .lab-btn-icon {
    line-height: 1;
  }
</style>
