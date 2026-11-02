<script setup lang="ts">
/**
   * RPG 加成合计透视卡（美术改版 v3 ②）
   * 聚合 天气 + 出战宠物 effectJson + 经验 Buff + 称号效果，直出「+X%」合计与逐行来源
   * 纯前端聚合，零后端成本
   */
import type { RpgStatus, UserBuff } from '~~/types/rpg';

const props = defineProps<{
  weatherBuff: { label?: string; expBoost?: number } | null;
  buffs: UserBuff[];
  pets: any[];
  equippedPetId: number | null;
  loadout: any | null;
  rpgStatus: RpgStatus | null;
}>();

interface BoostRow {
  icon: string;
  source: string;
  detail: string;
  percent: number;
}

const pct = (v: number) => `+${Math.round(v * 100)}%`;

const rows = computed<BoostRow[]>(() => {
  const list: BoostRow[] = [];

  // ① 天气加成（全站，每日刷新）
  if (props.weatherBuff?.expBoost) {
    list.push({
      icon: 'fire',
      source: '天气 · 全站',
      detail: props.weatherBuff.label || '今日天气',
      percent: props.weatherBuff.expBoost,
    });
  }

  // ② 出战宠物 effectJson
  const pet = (props.pets || []).find((p: any) => p.id === props.equippedPetId);
  const petFx = pet?.config?.effectJson?.expBoost;
  if (petFx) {
    list.push({
      icon: 'dragon-pet',
      source: `出战宠物 · ${pet.nickname || pet.config?.name || ''}`,
      detail: `Lv${pet.level ?? '?'} · effectJson`,
      percent: petFx,
    });
  }

  // ③ 经验 Buff（manual 须 isActive，且未过期）
  const now = Date.now();
  for (const b of props.buffs || []) {
    if (b.buffType !== 'exp_boost' || !b.value) continue;
    if (b.triggerMode === 'manual' && !b.isActive) continue;
    if (b.expireAt && new Date(b.expireAt).getTime() < now) continue;
    const remainMin = b.expireAt
      ? Math.max(0, Math.round((new Date(b.expireAt).getTime() - now) / 60000))
      : null;
    list.push({
      icon: 'flame',
      source: b.name || '经验 Buff',
      detail:
          remainMin != null
            ? `剩 ${remainMin >= 60 ? `${Math.floor(remainMin / 60)} 时 ${remainMin % 60} 分` : `${remainMin} 分钟`}`
            : '生效中',
      percent: b.value,
    });
  }

  // ④ 称号效果（loadout.title 的 effectJson 若带 expBoost）
  const titleFx = props.loadout?.title?.effectJson?.expBoost;
  if (titleFx) {
    list.push({
      icon: 'crown',
      source: `称号 · ${props.loadout.title.name || ''}`,
      detail: '称号效果',
      percent: titleFx,
    });
  }

  return list;
});

const totalPercent = computed(() => rows.value.reduce((s, r) => s + r.percent, 0));

/** P1-5：面板默认折叠为一行摘要，点击展开加成明细（EXP 进度条与英雄面板重复，已移除） */
const expanded = ref(false);
</script>

<template>
  <div class="rpg-boost">
    <!-- P1-5：默认折叠为一行摘要，点击展开明细 -->
    <button
      type="button"
      class="rpg-boost__toggle"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <img class="rpg-boost__toggle-art" src="/rpg/icons/flame.png" alt="" loading="lazy">
      <b>+{{ Math.round(totalPercent * 100) }}% 总加成</b>
      <small>阅读 / 评论 EXP 加成明细</small>
      <span class="rpg-boost__chevron" :class="{ 'rpg-boost__chevron--open': expanded }" />
    </button>

    <div v-show="expanded" class="rpg-boost__total">
      <div class="rpg-boost__rows">
        <div v-for="(r, i) in rows" :key="i" class="rpg-boost__row">
          <img :src="`/rpg/icons/${r.icon}.png`" alt="" loading="lazy">
          <span class="rpg-boost__src">
            <b>{{ r.source }}</b>
            <small>{{ r.detail }}</small>
          </span>
          <b class="rpg-boost__val">{{ pct(r.percent) }}</b>
        </div>
        <p v-if="!rows.length" class="rpg-boost__none">
          暂无生效中的 EXP 加成 · 出战宠物或激活 Buff 可提升
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* P1-5：一行摘要 toggle 行 */
  .rpg-boost__toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 16px;
    border: 1px solid var(--rpg-border, #e8e3f2);
    border-radius: 14px;
    background: linear-gradient(
      135deg,
      var(--rpg-art-violet-soft, #f6f2fe),
      var(--rpg-art-gold-soft, #fdf6e4)
    );
    cursor: pointer;
    text-align: left;
    transition: filter 0.15s ease;
  }

  .rpg-boost__toggle:hover {
    filter: brightness(1.02);
  }

  .rpg-boost__toggle-art {
    width: 18px;
    height: 18px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .rpg-boost__toggle b {
    font-size: 14px;
    color: var(--rpg-art-violet-deep, #5b3fd6);
    white-space: nowrap;
  }

  .rpg-boost__toggle small {
    font-size: 11px;
    color: var(--rpg-text-muted, #6b6480);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* v6/H：CSS chevron 旋转过渡（与敏感词折叠同款） */
  .rpg-boost__chevron {
    margin-left: auto;
    flex-shrink: 0;
    width: 7px;
    height: 7px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(-45deg);
    transition: transform 0.2s ease;
  }

  .rpg-boost__chevron--open {
    transform: rotate(45deg);
  }

  .rpg-boost__total {
    border-radius: 14px;
    padding: 12px 16px;
    margin-top: 8px;
    background: linear-gradient(
      135deg,
      var(--rpg-art-violet-soft, #f6f2fe),
      var(--rpg-art-gold-soft, #fdf6e4)
    );
    border: 1px solid var(--rpg-border, #e8e3f2);
  }

  .rpg-boost__rows {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .rpg-boost__row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12.5px;
    background: var(--rpg-surface, #faf9fe);
    border: 1px solid var(--rpg-border, #e8e3f2);
    border-radius: 10px;
    padding: 7px 12px;
  }

  .rpg-boost__row img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .rpg-boost__src {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .rpg-boost__src b {
    font-size: 12.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rpg-boost__src small {
    font-size: 10.5px;
    color: var(--rpg-text-muted, #6b6480);
  }

  .rpg-boost__val {
    margin-left: auto;
    color: var(--rpg-art-violet-deep, #5b3fd6);
    flex-shrink: 0;
  }

  .rpg-boost__none {
    font-size: 12px;
    color: var(--rpg-text-muted, #6b6480);
    padding: 6px 0;
  }

  @media (max-width: 639px) {
    .rpg-boost__toggle {
      flex-wrap: wrap;
      gap: 6px;
      padding: 9px 14px;
    }

    .rpg-boost__toggle small {
      flex-basis: calc(100% - 26px);
      margin-left: 26px;
    }
  }
</style>
