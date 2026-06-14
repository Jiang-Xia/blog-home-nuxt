<template>
  <div>
    <div class="mx-auto max-w-6xl px-4 py-4 md:py-6">
      <CyberSectionHeader
        class="mb-5"
        label="TOOLS"
        title="工具箱"
        subtitle="实用开发与日常工具集合"
      />

      <ToolSubNav />

      <div class="cyber-glass-card min-h-[50vh] p-4 md:p-6">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>
