/**
 * Nuxt UI 全局主题 — Toast 右下角 + RPG 面板卡片
 * @see assets/css/rpg-theme.css `.rpg-toast*`
 */
export default defineAppConfig({
  toaster: {
    position: 'bottom-right' as const,
    duration: 2500,
    max: 4,
    expand: false,
    progress: true,
  },
  ui: {
    toast: {
      slots: {
        root: 'rpg-toast relative group overflow-hidden rounded-2xl px-3.5 py-3 flex items-start gap-3 focus:outline-none ring-0',
        wrapper: 'w-0 flex-1 flex flex-col min-w-0 gap-0.5',
        title:
          'rpg-toast-title text-[0.6875rem] font-extrabold tracking-[0.12em] uppercase leading-none',
        description: 'rpg-toast-desc text-[0.9375rem] font-bold leading-snug',
        icon: 'rpg-toast-icon shrink-0 size-7 mt-0.5',
        progress: 'rpg-toast-progress absolute inset-x-0 bottom-0 h-[3px] opacity-70',
        close:
          'rpg-toast-close shrink-0 size-6 rounded-full flex items-center justify-center text-xs transition-colors',
      },
      variants: {
        color: {
          success: {
            root: 'rpg-toast--success',
            icon: 'text-[var(--rpg-notify-icon)]',
          },
          info: {
            root: 'rpg-toast--info',
            icon: 'text-[var(--rpg-notify-icon)]',
          },
          warning: {
            root: 'rpg-toast--warning',
            icon: 'text-[var(--rpg-notify-icon)]',
          },
          error: {
            root: 'rpg-toast--error',
            icon: 'text-[var(--rpg-notify-icon)]',
          },
        },
      },
    },
    toaster: {
      slots: {
        viewport:
          'rpg-toaster-viewport fixed flex flex-col w-[calc(100%-1.5rem)] sm:w-[min(28rem,calc(100%-1.5rem))] z-[10050] focus:outline-none gap-2.5',
      },
    },
  },
});
