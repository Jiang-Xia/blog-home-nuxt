<script setup lang="ts">
/**
   * RPG WebSocket 事件本地挡板
   * dev 全站；生产环境仅 /tool/test（compact 模式不在生产展示）
   */
import type { RpgMockContext } from '~~/utils/rpg-dev-mock';
import {
  getRpgMockEventCoverage,
  groupRpgMockScenarios,
  RPG_ALL_WS_EVENTS,
  runRpgMockScenario,
  RPG_MOCK_SCENARIOS,
} from '~~/utils/rpg-dev-mock';
import { canUseRpgDevMock } from '~~/utils/rpg-dev-mock-guard';

const props = withDefaults(
  defineProps<{
    /** 注入 mock 时参考的 RPG 状态（冒险页传入 rpgStatus） */
    context?: RpgMockContext;
    /** 紧凑模式：用于冒险页内嵌 */
    compact?: boolean;
  }>(),
  {
    context: () => ({}),
    compact: false,
  },
);

const route = useRoute();
const token = useToken();
const { openRechargeModal } = useRpgRecharge();
const groups = groupRpgMockScenarios(RPG_MOCK_SCENARIOS);
/** 模板表达式不支持 import.meta，须在 script 中取值 */
const isDev = import.meta.dev;

/** compact 为冒险页内嵌：仅 dev；测试页全宽：dev 或生产 /tool/test */
const showPanel = computed(() => {
  if (props.compact) return isDev;
  return canUseRpgDevMock() && route.path.startsWith('/tool/test');
});

const coverage = computed(() => getRpgMockEventCoverage());
const coveredCount = computed(() => coverage.value.filter(c => c.covered).length);
const allCovered = computed(() => coveredCount.value === RPG_ALL_WS_EVENTS.length);

/** 执行挡板场景：dispatchLocalEvent → 与真 WS 相同监听链 */
const onRun = (scenario: (typeof RPG_MOCK_SCENARIOS)[number]) => {
  runRpgMockScenario(scenario, props.context);
};
</script>

<template>
  <div v-if="showPanel" class="rpg-dev-panel" :class="{ compact }">
    <div class="panel-meta">
      <p class="panel-hint">
        覆盖 <strong>{{ coveredCount }}/{{ RPG_ALL_WS_EVENTS.length }}</strong> 种 WS 事件
        <span :class="allCovered ? 'text-success' : 'text-warning'">
          {{ allCovered ? '（齐全）' : '（有遗漏）' }}
        </span>
        · 走 <code>RpgGlobalInit</code> 监听链
      </p>
      <p v-if="!token" class="panel-warn">
        ⚠️ 未登录：请先登录后再点按钮，否则无 Toast / 弹窗反馈
      </p>
      <p v-else class="panel-ok">
        ✓ 已登录；全屏弹窗由 layout 挂载的 Animation 组件展示
        <template v-if="!isDev">
          （生产环境仅本测试页可用挡板）
        </template>
      </p>
      <p class="panel-note">
        「经验获得」Toast 有约 5s 防抖；「站内通知」看导航栏铃铛角标
      </p>
    </div>
    <section class="panel-group">
      <h4 class="panel-group-title">
        非 WS（UI）
      </h4>
      <div class="panel-actions">
        <button
          type="button"
          class="btn btn-xs btn-outline panel-btn btn-accent"
          @click="openRechargeModal"
        >
          <span class="panel-btn-icon">💎</span>
          钻石充值（动态码）
        </button>
      </div>
    </section>
    <section v-for="group in groups" :key="group.title" class="panel-group">
      <h4 class="panel-group-title">
        {{ group.title }}
      </h4>
      <div class="panel-actions">
        <button
          v-for="item in group.items"
          :key="item.key"
          type="button"
          class="btn btn-xs btn-outline panel-btn"
          :class="item.btnClass"
          @click="onRun(item)"
        >
          <span v-if="item.icon" class="panel-btn-icon">{{ item.icon }}</span>
          {{ item.label }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
  .rpg-dev-panel {
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px dashed rgb(245 158 11 / 0.45);
    background: rgb(245 158 11 / 0.06);
  }

  .rpg-dev-panel.compact {
    padding: 10px 12px;
    margin-bottom: 12px;
  }

  .panel-meta {
    margin-bottom: 10px;
  }

  .panel-hint,
  .panel-warn,
  .panel-ok,
  .panel-note {
    font-size: 11px;
    line-height: 1.5;
    margin: 0;
  }

  .panel-hint {
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.55));
    margin-bottom: 4px;
  }

  .panel-warn {
    color: #b45309;
    margin-bottom: 4px;
  }

  .panel-ok {
    color: #15803d;
    margin-bottom: 4px;
  }

  .panel-note {
    color: var(--rpg-text-muted, oklch(var(--bc) / 0.45));
  }

  .panel-hint code {
    font-size: 10px;
    padding: 1px 4px;
    border-radius: 4px;
    background: rgb(0 0 0 / 0.06);
  }

  .panel-group + .panel-group {
    margin-top: 10px;
  }

  .panel-group-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--rpg-text-label, inherit);
    margin-bottom: 6px;
  }

  .panel-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .panel-btn {
    gap: 3px;
    min-height: 1.75rem;
  }

  .panel-btn-icon {
    line-height: 1;
  }
</style>
