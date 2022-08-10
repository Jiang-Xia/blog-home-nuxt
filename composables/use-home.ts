import { useState } from "#app";
/* ！！！ 这里声明的变量都是响应式的 */
let theme = "";
// useState 的第一参数为 key，第二参数为初始化的工厂函数
export const useTheme = () => useState("theme", () => theme);

export default function () {
  return useState("home", () => "home");
}
