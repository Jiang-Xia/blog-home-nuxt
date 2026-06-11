<script setup lang="ts">
import { getCurrentActivity } from '~~/api/rpg';

const activity = ref<any>(null);

onMounted(async () => {
  try {
    activity.value = await getCurrentActivity();
  }
  catch {
    /* ignore */
  }
});
</script>

<template>
  <div
    v-if="activity"
    class="season-banner p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-200 mb-4"
  >
    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs uppercase tracking-wide text-violet-600">当前活动</span>
        <h3 class="font-bold text-lg">
          {{ activity.name }}
        </h3>
        <p class="text-sm text-base-content/70 mt-1">
          {{ activity.description }}
        </p>
      </div>
      <div class="text-right">
        <span class="badge badge-primary">EXP x{{ activity.expBuffRate }}</span>
      </div>
    </div>
  </div>
</template>
