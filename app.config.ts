/**
 * Nuxt UI 全局主题 — Toast 使用 RPG / cyber 玻璃态 HUD 风格
 * @see assets/css/rpg-theme.css `.rpg-toast*`
 */
export default defineAppConfig({
  toaster: {
    position: 'top-center' as const,
    duration: 2500,
    max: 4,
    expand: false,
    progress: true,
  },
  ui: {
    toast: {
      slots: {
        root: 'rpg-toast relative group overflow-hidden rounded-xl p-3.5 flex gap-3 focus:outline-none ring-0',
        wrapper: 'w-0 flex-1 flex flex-col min-w-0',
        title: 'rpg-toast-title text-[0.6875rem] font-semibold tracking-[0.12em] uppercase',
        description: 'rpg-toast-desc text-sm font-medium leading-snug',
        icon: 'rpg-toast-icon shrink-0 size-[1.125rem]',
        progress: 'rpg-toast-progress absolute inset-x-0 bottom-0 h-[3px] opacity-80',
        close: 'rpg-toast-close p-0 opacity-60 hover:opacity-100 transition-opacity',
      },
      variants: {
        color: {
          success: {
            root: 'rpg-toast--success',
            icon: 'text-[var(--rpg-toast-accent)]',
          },
          info: {
            root: 'rpg-toast--info',
            icon: 'text-[var(--rpg-toast-accent)]',
          },
          warning: {
            root: 'rpg-toast--warning',
            icon: 'text-[var(--rpg-toast-accent)]',
          },
          error: {
            root: 'rpg-toast--error',
            icon: 'text-[var(--rpg-toast-accent)]',
          },
        },
      },
    },
    toaster: {
      slots: {
        viewport:
          'rpg-toaster-viewport fixed flex flex-col w-[calc(100%-1.5rem)] sm:w-[min(22rem,calc(100%-1.5rem))] z-[10050] focus:outline-none',
      },
    },
  },
});
