<script setup lang="ts">
/**
   * RPG 冒险状态首屏 · 英雄面板（美术改版 v3 ①）
   * 三轴数值（EXP / HP / 签到里程）+ 称号徽章 + 今日待办胶囊串
   * 数据全部来自父页现有接口聚合，零后端成本
   */
import type { RpgStatus, SignInfo } from '~~/types/rpg';
import { resolveStaticUrl } from '@/utils/static-url';

const props = defineProps<{
  rpgStatus: RpgStatus;
  signInfo: SignInfo | null;
  questClaimable: number;
  eggCount: number;
  lotteryTickets: number;
  loadout: any | null;
}>();

const emit = defineEmits<{
  todo: [key: 'sign' | 'quests' | 'hatch' | 'lottery' | 'hp'];
}>();

const { playSfx } = useRpgAudio();
const userInfo = useUserInfo();

/** 等级经验阈值（与后端 level.service 同曲线：level*(level-1)*50） */
const getLevelThreshold = (level: number): number => {
  if (level <= 1) return 0;
  return level * (level - 1) * 50;
};

const expProgress = computed(() => {
  const { level, exp } = props.rpgStatus;
  const cur = getLevelThreshold(level);
  const next = getLevelThreshold(level + 1);
  const current = Math.max(0, exp - cur);
  const required = Math.max(1, next - cur);
  return { current, required, percent: Math.min(100, Math.round((current / required) * 100)) };
});

const hpPercent = computed(() => Math.min(100, props.rpgStatus.lifeValue ?? 100));
const hpLow = computed(() => hpPercent.value < 50);

/** 签到里程：距下一里程碑（3/7/14/30）的进度 */
const signMilestone = computed(() => {
  const target = props.signInfo?.nextBonusAt ?? 7;
  const cur = props.rpgStatus.consecutiveSignDays ?? 0;
  return { cur, target, percent: Math.min(100, Math.round((cur / target) * 100)) };
});

/** 已穿戴称号（loadout.title 为格式化后的物品配置） */
const titleItem = computed(() => props.loadout?.title || null);

const myAvatar = computed(() => {
  const a = userInfo.value?.avatar;
  return a ? resolveStaticUrl(a) : '';
});

/** 已穿戴头像框信息（交给 AvatarWithFrame 渲染，art 开启图片框） */
const heroFrameInfo = computed(() => {
  const f = props.loadout?.avatarFrame;
  if (!f) return null;
  return {
    code: f.code ?? '',
    name: f.name ?? '',
    color: f.color ?? null,
    icon: f.icon ?? null,
    iconUrl: (f as { iconUrl?: string | null }).iconUrl ?? null,
  };
});

interface TodoChip {
  key: 'sign' | 'quests' | 'hatch' | 'lottery' | 'hp';
  icon: string;
  label: string;
  badge?: string;
  done?: boolean;
}

const todoChips = computed<TodoChip[]>(() => {
  const chips: TodoChip[] = [
    {
      key: 'sign',
      icon: 'calendar-check',
      label: '签到',
      done: props.signInfo?.signedToday ?? false,
    },
  ];
  if (props.questClaimable > 0) {
    chips.push({
      key: 'quests',
      icon: 'library',
      label: '任务',
      badge: `${props.questClaimable} 可领`,
    });
  }
  if (props.eggCount > 0) {
    chips.push({ key: 'hatch', icon: 'egg', label: '孵化', badge: `${props.eggCount} 蛋` });
  }
  chips.push({
    key: 'lottery',
    icon: 'gift',
    label: '抽奖',
    badge: props.lotteryTickets > 0 ? `券 ×${props.lotteryTickets}` : undefined,
  });
  if (hpLow.value) {
    chips.push({ key: 'hp', icon: 'heart', label: '恢复 HP', badge: '偏低' });
  }
  return chips;
});

const onTodo = (key: TodoChip['key']) => {
  void playSfx('uiClick');
  emit('todo', key);
};
</script>

<template>
  <div class="rpg-hero">
    <div class="rpg-hero__top">
      <CommonAvatarWithFrame
        class="rpg-hero__avatar-box"
        :avatar="myAvatar"
        :alt="userInfo?.nickname || '冒险者'"
        :size="64"
        :frame="heroFrameInfo"
        art
      >
        <template #fallback>
          <span class="rpg-hero__avatar-fallback">{{
            (userInfo?.nickname || '冒').charAt(0)
          }}</span>
        </template>
      </CommonAvatarWithFrame>
      <div class="rpg-hero__title">
        <b>
          {{ userInfo?.nickname || '冒险者' }}
          <span class="rpg-hero__lv">Lv.{{ rpgStatus.level }}</span>
        </b>
        <div class="rpg-hero__sub">
          连续签到 {{ rpgStatus.consecutiveSignDays ?? 0 }} 天 · 距下一级还差
          {{ Math.max(0, expProgress.required - expProgress.current).toLocaleString() }} EXP
        </div>
      </div>
      <div class="rpg-hero__chips">
        <div v-if="titleItem" class="rpg-hero__chip rpg-hero__chip--gold">
          <img :src="titleItem.iconUrl || '/rpg/icons/crown.png'" alt="" loading="lazy">
          <small>称号 · {{ titleItem.name }}</small>
        </div>
        <div class="rpg-hero__chip">
          <img src="/rpg/icons/diamond.png" alt="" loading="lazy">
          <small>钻石 · {{ (rpgStatus.currency ?? 0).toLocaleString() }}</small>
        </div>
      </div>
    </div>

    <div class="rpg-hero__bars">
      <div class="rpg-hbar rpg-hbar--exp">
        <small><span>EXP 经验</span><span>{{ expProgress.current.toLocaleString() }} /
          {{ expProgress.required.toLocaleString() }}</span></small>
        <div class="rpg-hbar__track">
          <i :style="{ width: expProgress.percent + '%' }" />
        </div>
      </div>
      <div class="rpg-hbar rpg-hbar--hp">
        <small><span><img class="hbar-art" src="/rpg/icons/heart.png" alt=""> 生命 HP</span><span>{{ rpgStatus.lifeValue ?? 100 }} / 100</span></small>
        <div class="rpg-hbar__track">
          <i :style="{ width: hpPercent + '%' }" />
        </div>
      </div>
      <div class="rpg-hbar rpg-hbar--sign">
        <small><span>签到里程</span><span>{{ signMilestone.cur }} / {{ signMilestone.target }} 天</span></small>
        <div class="rpg-hbar__track">
          <i :style="{ width: signMilestone.percent + '%' }" />
        </div>
      </div>
    </div>

    <div class="rpg-hero__todos">
      <button
        v-for="chip in todoChips"
        :key="chip.key"
        type="button"
        class="rpg-todo"
        :class="{ 'rpg-todo--done': chip.done }"
        @click="onTodo(chip.key)"
      >
        <img :src="`/rpg/icons/${chip.icon}.png`" alt="" loading="lazy">
        {{ chip.label }}
        <span v-if="chip.badge" class="rpg-todo__n">{{ chip.badge }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
  .rpg-hero {
    position: relative;
    overflow: hidden;
    border-radius: 20px;
    color: #fff;
    background:
      radial-gradient(90% 120% at 85% -10%, rgb(217 161 60 / 0.4), transparent 55%),
      radial-gradient(120% 140% at 0% 110%, rgb(124 92 240 / 0.5), transparent 60%),
      linear-gradient(160deg, #241538, #17102a);
    box-shadow: 0 14px 34px rgb(40 20 80 / 0.28);
  }

  :global(html.tech-shell[data-theme='cyber-light']) .rpg-hero {
    box-shadow: 0 14px 30px rgb(92 63 214 / 0.22);
  }

  .rpg-hero__top {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 22px 22px 16px;
  }

  .rpg-hero__avatar-box {
    flex-shrink: 0;
  }

  .rpg-hero__avatar-fallback {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    font-size: 24px;
    font-weight: 800;
    background: linear-gradient(135deg, #7c5cf0, #5b3fd6);
  }

  .rpg-hero__title {
    min-width: 0;
  }

  .rpg-hero__title b {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    line-height: 1.3;
  }

  .rpg-hero__lv {
    font-size: 12px;
    font-weight: 800;
    background: linear-gradient(135deg, #e8b04b, #d9a13c);
    color: #3a2408;
    border-radius: 999px;
    padding: 2px 10px;
  }

  .rpg-hero__sub {
    font-size: 12px;
    opacity: 0.78;
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rpg-hero__chips {
    margin-left: auto;
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .rpg-hero__chip {
    text-align: center;
    background: rgb(255 255 255 / 0.08);
    border: 1px solid rgb(255 255 255 / 0.18);
    border-radius: 14px;
    padding: 8px 14px;
    min-width: 0;
  }

  .rpg-hero__chip--gold {
    background: linear-gradient(160deg, rgb(217 161 60 / 0.28), rgb(255 255 255 / 0.06));
    border-color: rgb(217 161 60 / 0.55);
  }

  .rpg-hero__chip img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }

  .rpg-hero__chip small {
    display: block;
    font-size: 10.5px;
    opacity: 0.85;
    margin-top: 3px;
    white-space: nowrap;
  }

  .rpg-hero__bars {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    padding: 0 22px 16px;
  }

  .rpg-hbar small {
    display: flex;
    justify-content: space-between;
    gap: 6px;
    font-size: 11px;
    opacity: 0.88;
    margin-bottom: 5px;
    white-space: nowrap;
  }

  /* v6/G：条内美术小图 */
  .hbar-art {
    width: 12px;
    height: 12px;
    object-fit: contain;
    vertical-align: -1px;
    margin-right: 2px;
  }

  .rpg-hbar__track {
    height: 9px;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.14);
    overflow: hidden;
  }

  .rpg-hbar__track i {
    display: block;
    height: 100%;
    border-radius: 999px;
    transition: width 0.4s ease;
  }

  .rpg-hbar--exp .rpg-hbar__track i {
    background: linear-gradient(90deg, #a78bfa, #7c5cf0);
  }

  .rpg-hbar--hp .rpg-hbar__track i {
    background: linear-gradient(90deg, #ff8a8a, #e05555);
  }

  .rpg-hbar--sign .rpg-hbar__track i {
    background: linear-gradient(90deg, #e8b04b, #d9a13c);
  }

  .rpg-hero__todos {
    display: flex;
    gap: 8px;
    padding: 2px 22px 20px;
    flex-wrap: wrap;
  }

  .rpg-todo {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    background: rgb(255 255 255 / 0.08);
    border: 1px solid rgb(255 255 255 / 0.16);
    border-radius: 999px;
    padding: 6px 14px 6px 7px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .rpg-todo:hover {
    background: rgb(255 255 255 / 0.16);
  }

  .rpg-todo img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
  }

  .rpg-todo__n {
    background: #e05555;
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    border-radius: 999px;
    padding: 1px 7px;
  }

  .rpg-todo--done {
    opacity: 0.55;
  }

  .rpg-todo--done::after {
    content: '✓';
    color: #7de3a8;
    font-weight: 800;
  }

  @media (max-width: 639px) {
    .rpg-hero__top {
      flex-wrap: wrap;
      padding: 18px 16px 12px;
      gap: 12px;
    }

    .rpg-hero__chips {
      margin-left: 0;
      width: 100%;
    }

    .rpg-hero__chip {
      flex: 1;
    }

    .rpg-hero__bars {
      grid-template-columns: 1fr;
      gap: 10px;
      padding: 0 16px 12px;
    }

    .rpg-hero__todos {
      padding: 0 16px 16px;
    }
  }
</style>
