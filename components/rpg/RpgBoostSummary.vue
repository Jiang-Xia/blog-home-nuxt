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

/** 距下一级还差多少 EXP（升级进度提示） */
const nextLevel = computed(() => {
  const s = props.rpgStatus;
  if (!s) return null;
  const threshold = (lv: number) => (lv <= 1 ? 0 : lv * (lv - 1) * 50);
  const cur = threshold(s.level);
  const next = threshold(s.level + 1);
  const required = Math.max(1, next - cur);
  const remain = Math.max(0, next - s.exp);
  return {
    from: s.level,
    to: s.level + 1,
    remain,
    percent: Math.min(100, Math.round(((s.exp - cur) / required) * 100)),
  };
});
</script>

<template>
  <div class="rpg-boost">
    <div class="rpg-boost__total">
      <div class="rpg-boost__big">
        <b>+{{ Math.round(totalPercent * 100) }}%</b>
        <small>当前阅读/评论<br>EXP 总加成</small>
      </div>
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

    <div v-if="nextLevel" class="rpg-boost__level">
      <img src="/rpg/icons/level-up.png" alt="" loading="lazy">
      <div class="rpg-boost__level-meta">
        <b>距离 Lv.{{ nextLevel.to }} 还需 {{ nextLevel.remain.toLocaleString() }} EXP</b>
        <div class="rpg-boost__track">
          <i :style="{ width: nextLevel.percent + '%' }" />
        </div>
        <small>签到 / 任务 / 阅读评论均可获得 EXP（当前加成同步生效）</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .rpg-boost__total {
    display: flex;
    align-items: flex-start;
    gap: 18px;
    border-radius: 16px;
    padding: 16px 20px;
    background: linear-gradient(
      135deg,
      var(--rpg-art-violet-soft, #f6f2fe),
      var(--rpg-art-gold-soft, #fdf6e4)
    );
    border: 1px solid var(--rpg-border, #e8e3f2);
  }

  .rpg-boost__big {
    flex-shrink: 0;
    text-align: center;
    padding-right: 18px;
    border-right: 1px dashed var(--rpg-border, #e5d9f8);
  }

  .rpg-boost__big b {
    display: block;
    font-size: 28px;
    line-height: 1.15;
    color: var(--rpg-art-violet-deep, #5b3fd6);
  }

  .rpg-boost__big small {
    display: block;
    font-size: 10.5px;
    color: var(--rpg-text-muted, #6b6480);
    margin-top: 4px;
    line-height: 1.5;
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

  .rpg-boost__level {
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 14px;
    padding: 12px 16px;
    margin-top: 10px;
    background: var(--rpg-art-violet-soft, #f6f2fe);
    border: 1px solid var(--rpg-border, #e0d5f8);
  }

  .rpg-boost__level img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .rpg-boost__level-meta {
    flex: 1;
    min-width: 0;
  }

  .rpg-boost__level-meta b {
    font-size: 13px;
  }

  .rpg-boost__track {
    height: 7px;
    border-radius: 999px;
    background: var(--rpg-border, #efeaf9);
    overflow: hidden;
    margin: 6px 0 4px;
  }

  .rpg-boost__track i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #7c5cf0, #a78bfa);
    border-radius: 999px;
    transition: width 0.4s ease;
  }

  .rpg-boost__level-meta small {
    font-size: 10.5px;
    color: var(--rpg-text-muted, #6b6480);
  }

  @media (max-width: 639px) {
    .rpg-boost__total {
      flex-direction: column;
      gap: 10px;
    }

    .rpg-boost__big {
      border-right: 0;
      border-bottom: 1px dashed var(--rpg-border, #e5d9f8);
      padding: 0 0 10px;
      width: 100%;
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 8px;
    }
  }
</style>
