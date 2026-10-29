/**
 * 尽早加载 themes-extra：本地主题非 cyber 时，不等 app.vue onMounted。
 * 配合 boot 脚本的 interim cyber，避免 data-theme 已切但 CSS 未到导致「等一会才有样式」。
 */
import { ensureExtraThemesCss, isCriticalTheme } from '~/composables/use-extra-themes-css';
import { applyThemeToDocument } from '~/utils/theme-dom';

export default defineNuxtPlugin({
  name: 'theme-extra-early',
  enforce: 'pre',
  parallel: true,
  setup() {
    const intent
      = document.documentElement.getAttribute('data-theme-intent')
        || localStorage.getItem('theme')
        || 'cyber';

    if (isCriticalTheme(intent)) return;

    void ensureExtraThemesCss()
      .then(() => {
        const latest = localStorage.getItem('theme') || intent;
        if (!isCriticalTheme(latest)) {
          applyThemeToDocument(latest);
        }
      })
      .catch(() => {
        /* ensureExtraThemesCss 已打日志 */
      });
  },
});
