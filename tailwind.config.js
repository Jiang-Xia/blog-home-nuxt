/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");
module.exports = {
  darkMode: "class", // 启动暗黑模式 class支持手动切换 media跟随操作系统
  purge: [
    "./components/**/*.{vue,js,jsx,tsx}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "node_modules/tailvue/dist/tailvue.es.js"// tailvue 这里加上这个才不会所有css都被剔除
  ],
  // content: [ "node_modules/tailvue/dist/tailvue.es.js"],
  theme: {
    extend: {},
    theme: {
      colors: {
        transparent: "transparent",
        current: "currentColor",
        black: colors.black,
        white: colors.white,
        gray: colors.trueGray,
        indigo: colors.indigo,
        red: colors.rose,
        yellow: colors.amber,
      },
    },
  },

  /* daisyui */
  plugins: [require("daisyui")],
  daisyui: {
    styled: true,
    themes: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "dark",
  },
};
