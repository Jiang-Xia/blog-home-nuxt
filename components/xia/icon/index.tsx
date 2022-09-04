import { defineComponent, h, SetupContext } from 'vue'
import config from '@/config'
import './index.less'
// 本地引入 阿里云图标库不能更新url了
// import '../../assets/font/iconfont';

interface propsState {
  icon: string;
  height: string;
  width: string;
}
// 加载iconfont 图标字体文件
const createIconfont = () => {
  const scriptUrl = config.iconfonrUrl
  const script = document.createElement('script')
  script.src = scriptUrl
  document.body.appendChild(script)
}
if (process.client) {
  createIconfont()
}

// 创建icon 函数式组件
const createIcon = (props: propsState, context: SetupContext) => {
  const svg = (
    <svg
      style={{ width: props.width, height: props.height, }}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      class=""
    >
      <use xlinkHref={`#${props.icon}`}></use>
    </svg>
  )
  const html = (
    <span class="x-icon" {...context.attrs}>
      {svg}
    </span>
  )
  return h(html, context.attrs, context.slots)
}

// 创建 XIcon组件
export default defineComponent({
  name: 'XIcon',
  props: {
    icon: {
      type: String,
      default: '',
    },
    height: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: '',
    },
  },
  setup (props: propsState, context: SetupContext) {
    return () => createIcon(props, context)
  },
})
