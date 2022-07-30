import { defineComponent, h, SetupContext } from "vue";
import "./index.less";
import { onMounted, computed } from "vue";
import { throttle } from "~~/utils";
interface propsState {
  prev: number; // 提前出线btn的距离
}
/**
 * @description: tsx 注意事项
 * tsx中使用ref响应式变量需要加 .value
 * tsx 中的data method devtools工具无法调试 20220730
 * tsx setup函数 需要返回一个渲染函数
 */

// 创建 XIcon组件
export default defineComponent({
  name: "XBacktop",
  props: {
    prev: {
      type: Number,
      default: 400,
    },
  },
  setup(props: propsState, context: SetupContext) {
    const scrollTop = ref(0);
    const showBtn = ref(false);
    const scrollHandle = (e: any) => {
      scrollTop.value = document.documentElement.scrollTop;
      showBtn.value =
        scrollTop.value > document.documentElement.clientHeight - props.prev;
    };

    const goTop = () => {
        window.scroll({ top: 0, left: 0, behavior: "smooth" });
    };

    onMounted(() => {
      window.addEventListener("scroll", throttle(scrollHandle, 100), true);
    });
    // tsx时需要返回一个渲染函数
    return () => (
      <div
        class="xia-backtop"
        v-show={showBtn.value}
        {...context.attrs}
        onClick={goTop}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className=" h-6 w-6 text-sm backtop-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 11l5-5m0 0l5 5m-5-5v12"
          />
        </svg>
      </div>
    );
  },
});
