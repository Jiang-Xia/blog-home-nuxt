import { defineComponent, h, SetupContext } from "vue";
import config from "@/config";
import "./index.less";
// 本地引入 阿里云图标库不能更新url了
import "@/assets/font/iconfont.css";
import "@/assets/font/iconfont.svg";

interface propsState {
  icon: string;
  classIcon: string; // 默认为svg图标
}
// 加载iconfont 图标字体文件
const createIconfont = () => {
  const scriptUrl = config.iconfonrUrl;
  const script = document.createElement("script");
  script.src = scriptUrl;
  document.body.appendChild(script);
};
// 客户端才引入
if(process.client){
  createIconfont();
}

// 创建icon 函数式组件
const createIcon = (props: propsState, context: SetupContext) => {
  const svg = (
    <svg
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      class=""
    >
      <use xlinkHref={"#" + props.icon}></use>
    </svg>
  );
  let html = (
    <span class="x-icon" {...context.attrs}>
      {svg}
    </span>
  );
  // 不使用svg
  if (props.classIcon) {
    html = (
      <span class={"iconfont x-icon " + props.classIcon} {...context.attrs}></span>
    );
  }
  return h(html, context.attrs, context.slots);
};

// 创建 XIcon组件
export default defineComponent({
  name: "XIcon",
  props: {
    icon: {
      type: String,
      default: "",
    },
    classIcon: {
      type: String,
      default: "",
    },
  },
  setup(props: any, context: SetupContext) {
    return () => createIcon(props, context);
  },
});
