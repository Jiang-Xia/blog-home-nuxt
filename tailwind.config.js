/** @type {import('tailwindcss').Config} */
module.exports = {
  // darkMode: "class", // 启动暗黑模式 class支持手动切换 media跟随操作系统
  content: [
    './components/**/*.{vue,js,jsx,tsx}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
    'node_modules/tailvue/dist/tailvue.es.js', // tailvue 这里加上这个才不会所有css都被剔除
  ],
};
