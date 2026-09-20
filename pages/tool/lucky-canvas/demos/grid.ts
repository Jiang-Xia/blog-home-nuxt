/**
 * lucky-canvas grid 示例配置（手维）
 * 图片：public/lucky-canvas/grid/{id}/imgs/
 */
import type { LuckyDemoItem } from './types';
import { asset } from './helpers';

/** 本文件内短写静态资源路径 */
const img = (id: string, file: string) => asset('grid', id, file);

export const GRID_DEMOS: LuckyDemoItem[] = [
  {
    id: 'grid-dy',
    title: '仿抖音九宫格抽奖',
    type: 'grid',
    width: '300px',
    height: '300px',
    externalButton: null,
    options: {
      blocks: [
        {
          padding: '10px',
          background: '#006bff',
          borderRadius: '10px',
        },
        {
          padding: '1px',
          background: '#000000',
          borderRadius: '10px',
        },
        {
          padding: '5px',
          background: '#1551c1',
          borderRadius: '10px',
        },
      ],
      prizes: [
        {
          x: 0,
          y: 0,
          imgs: [
            {
              width: '100%',
              height: '100%',
              top: 1,
              src: img('grid-dy', '0.png'),
            },
          ],
        },
        {
          x: 1,
          y: 0,
          imgs: [
            {
              width: '100%',
              height: '100%',
              top: 1,
              src: img('grid-dy', '1.png'),
            },
          ],
        },
        {
          x: 2,
          y: 0,
          imgs: [
            {
              width: '100%',
              height: '100%',
              top: 1,
              src: img('grid-dy', '2.png'),
            },
          ],
        },
        {
          x: 2,
          y: 1,
          imgs: [
            {
              width: '100%',
              height: '100%',
              top: 1,
              src: img('grid-dy', '3.png'),
            },
          ],
        },
        {
          x: 2,
          y: 2,
          imgs: [
            {
              width: '100%',
              height: '100%',
              top: 1,
              src: img('grid-dy', '4.png'),
            },
          ],
        },
        {
          x: 1,
          y: 2,
          imgs: [
            {
              width: '100%',
              height: '100%',
              top: 1,
              src: img('grid-dy', '5.png'),
            },
          ],
        },
        {
          x: 0,
          y: 2,
          imgs: [
            {
              width: '100%',
              height: '100%',
              top: 1,
              src: img('grid-dy', '6.png'),
            },
          ],
        },
        {
          x: 0,
          y: 1,
          imgs: [
            {
              width: '100%',
              height: '100%',
              top: 1,
              src: img('grid-dy', '7.png'),
            },
          ],
        },
      ],
      buttons: [
        {
          x: 1,
          y: 1,
          background: 'rgba(0,0,0,0)',
          imgs: [
            {
              src: img('grid-dy', 'btn.gif'),
              width: '100%',
              height: '100%',
            },
          ],
        },
      ],
      defaultStyle: {
        borderRadius: '5px',
      },
      activeStyle: {
        background: '#27c2b0',
      },
    },
  },
  {
    id: 'grid-wyyx',
    title: '仿网易严选九宫格',
    type: 'grid',
    width: '300px',
    height: '300px',
    externalButton: null,
    options: {
      blocks: [
        {
          padding: '1px',
          background: '#e2cea3',
          borderRadius: '13px',
        },
        {
          padding: '5px 0px',
          background: '#f3ecdc',
          borderRadius: '13px',
        },
        {
          padding: '1px',
          background: '#e2cea3',
          borderRadius: '8px',
        },
        {
          padding: '10px',
          background: '#fffcf5',
          borderRadius: '8px',
        },
      ],
      prizes: [
        {
          x: 0,
          y: 0,
          title: '电热烘干毛巾架',
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-wyyx', 'default-0.png'),
              activeSrc: img('grid-wyyx', 'active-0.png'),
            },
          ],
        },
        {
          x: 1,
          y: 0,
          title: '10元满减红包',
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-wyyx', 'default-1.png'),
              activeSrc: img('grid-wyyx', 'active-1.png'),
            },
          ],
        },
        {
          x: 2,
          y: 0,
          title: '2积分',
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-wyyx', 'default-2.png'),
              activeSrc: img('grid-wyyx', 'active-2.png'),
            },
          ],
        },
        {
          x: 2,
          y: 1,
          title: '胖喵焖烧罐',
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-wyyx', 'default-3.png'),
              activeSrc: img('grid-wyyx', 'active-3.png'),
            },
          ],
        },
        {
          x: 2,
          y: 2,
          title: '5元满减红包',
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-wyyx', 'default-4.png'),
              activeSrc: img('grid-wyyx', 'active-4.png'),
            },
          ],
        },
        {
          x: 1,
          y: 2,
          title: '多层置物架',
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-wyyx', 'default-5.png'),
              activeSrc: img('grid-wyyx', 'active-5.png'),
            },
          ],
        },
        {
          x: 0,
          y: 2,
          title: '3元直减红包',
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-wyyx', 'default-6.png'),
              activeSrc: img('grid-wyyx', 'active-6.png'),
            },
          ],
        },
        {
          x: 0,
          y: 1,
          title: '全场满99减10',
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-wyyx', 'default-7.png'),
              activeSrc: img('grid-wyyx', 'active-7.png'),
            },
          ],
        },
      ],
      buttons: [
        {
          x: 1,
          y: 1,
          background: 'rgba(0,0,0,0)',
          imgs: [
            {
              src: img('grid-wyyx', 'btn.png'),
              width: '90%',
              top: '5%',
            },
          ],
        },
      ],
      defaultStyle: {
        background: '#ffefd6',
        borderRadius: '5px',
        fontColor: '#755c28',
        fontSize: '10px',
        lineHeight: '12px',
      },
      activeStyle: {
        background: '#de7247',
        fontColor: '#ffefd6',
      },
    },
  },
  {
    id: 'grid-wyyyx',
    title: '仿网易云游戏九宫格',
    type: 'grid',
    width: '300px',
    height: '300px',
    externalButton: null,
    options: {
      blocks: [
        {
          imgs: [
            {
              src: img('grid-wyyyx', 'bg.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
        {
          padding: '10px',
        },
      ],
      prizes: [
        {
          x: 0,
          y: 0,
          title: 'steam游戏任选\n(限款)',
          fonts: [
            {
              text: 'steam游戏任选\n(限款)',
              top: '60%',
            },
          ],
          imgs: [
            {
              src: img('grid-wyyyx', 'cell.png'),
              activeSrc: img('grid-wyyyx', 'cell-active.png'),
              width: '100%',
              height: '100%',
            },
            {
              src: img('grid-wyyyx', '0.png'),
              width: '70%',
              top: '3%',
            },
          ],
        },
        {
          x: 1,
          y: 0,
          title: '百元京东卡',
          fonts: [
            {
              text: '百元京东卡',
              top: '69%',
            },
          ],
          imgs: [
            {
              src: img('grid-wyyyx', 'cell.png'),
              activeSrc: img('grid-wyyyx', 'cell-active.png'),
              width: '100%',
              height: '100%',
            },
            {
              src: img('grid-wyyyx', '1.png'),
              width: '70%',
              top: '3%',
            },
          ],
        },
        {
          x: 2,
          y: 0,
          title: '暴雪游戏30点数',
          fonts: [
            {
              text: '暴雪游戏30点数',
              top: '69%',
            },
          ],
          imgs: [
            {
              src: img('grid-wyyyx', 'cell.png'),
              activeSrc: img('grid-wyyyx', 'cell-active.png'),
              width: '100%',
              height: '100%',
            },
            {
              src: img('grid-wyyyx', '2.png'),
              width: '70%',
              top: '3%',
            },
          ],
        },
        {
          x: 2,
          y: 1,
          title: '云币2888',
          fonts: [
            {
              text: '云币2888',
              top: '69%',
            },
          ],
          imgs: [
            {
              src: img('grid-wyyyx', 'cell.png'),
              activeSrc: img('grid-wyyyx', 'cell-active.png'),
              width: '100%',
              height: '100%',
            },
            {
              src: img('grid-wyyyx', '3.png'),
              width: '70%',
              top: '3%',
            },
          ],
        },
        {
          x: 2,
          y: 2,
          title: '手游月卡',
          fonts: [
            {
              text: '手游月卡',
              top: '69%',
            },
          ],
          imgs: [
            {
              src: img('grid-wyyyx', 'cell.png'),
              activeSrc: img('grid-wyyyx', 'cell-active.png'),
              width: '100%',
              height: '100%',
            },
            {
              src: img('grid-wyyyx', '4.png'),
              width: '70%',
              top: '3%',
            },
          ],
        },
        {
          x: 1,
          y: 2,
          title: '连续3日\n手游时长+1h',
          fonts: [
            {
              text: '连续3日\n手游时长+1h',
              top: '60%',
            },
          ],
          imgs: [
            {
              src: img('grid-wyyyx', 'cell.png'),
              activeSrc: img('grid-wyyyx', 'cell-active.png'),
              width: '100%',
              height: '100%',
            },
            {
              src: img('grid-wyyyx', '5.png'),
              width: '70%',
              top: '3%',
            },
          ],
        },
        {
          x: 0,
          y: 2,
          title: '手游时长+30min',
          fonts: [
            {
              text: '手游时长+30min',
              top: '69%',
            },
          ],
          imgs: [
            {
              src: img('grid-wyyyx', 'cell.png'),
              activeSrc: img('grid-wyyyx', 'cell-active.png'),
              width: '100%',
              height: '100%',
            },
            {
              src: img('grid-wyyyx', '6.png'),
              width: '70%',
              top: '3%',
            },
          ],
        },
        {
          x: 0,
          y: 1,
          title: '端游时长+1h',
          fonts: [
            {
              text: '端游时长+1h',
              top: '69%',
            },
          ],
          imgs: [
            {
              src: img('grid-wyyyx', 'cell.png'),
              activeSrc: img('grid-wyyyx', 'cell-active.png'),
              width: '100%',
              height: '100%',
            },
            {
              src: img('grid-wyyyx', '7.png'),
              width: '70%',
              top: '3%',
            },
          ],
        },
      ],
      buttons: [
        {
          x: 1,
          y: 1,
          background: 'rgba(0,0,0,0)',
          fonts: [
            {
              text: '剩余次数:9次',
              fontColor: '#ca620d',
              top: '75%',
            },
          ],
          imgs: [
            {
              src: img('grid-wyyyx', 'btn.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
      ],
      defaultStyle: {
        fontColor: '#AFFFD7',
        fontSize: '10px',
        lineHeight: '13px',
        wordWrap: false,
      },
      activeStyle: {
        fontColor: '#fff',
      },
    },
  },
  {
    id: 'grid-xdf',
    title: '仿新东方小程序抽奖',
    type: 'grid',
    width: '300px',
    height: '300px',
    externalButton: null,
    options: {
      blocks: [
        {
          padding: '10px',
          background: '#faeecb',
        },
        {
          padding: '10px',
          background: '#eec578',
        },
      ],
      prizes: [
        {
          x: 0,
          y: 0,
          title: '二次元时钟',
          fonts: [
            {
              text: '二次元时钟',
              top: '67%',
            },
          ],
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-xdf', 'cell.png'),
              activeSrc: img('grid-xdf', 'cell-active.png'),
            },
            {
              width: '50%',
              top: '15%',
              src: img('grid-xdf', '0.png'),
            },
          ],
        },
        {
          x: 1,
          y: 0,
          title: '航天计时器',
          fonts: [
            {
              text: '航天计时器',
              top: '67%',
            },
          ],
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-xdf', 'cell.png'),
              activeSrc: img('grid-xdf', 'cell-active.png'),
            },
            {
              width: '50%',
              top: '15%',
              src: img('grid-xdf', '1.png'),
            },
          ],
        },
        {
          x: 2,
          y: 0,
          title: '航天钥匙链',
          fonts: [
            {
              text: '航天钥匙链',
              top: '67%',
            },
          ],
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-xdf', 'cell.png'),
              activeSrc: img('grid-xdf', 'cell-active.png'),
            },
            {
              width: '50%',
              top: '15%',
              src: img('grid-xdf', '2.png'),
            },
          ],
        },
        {
          x: 2,
          y: 1,
          title: '航天勋章',
          fonts: [
            {
              text: '航天勋章',
              top: '67%',
            },
          ],
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-xdf', 'cell.png'),
              activeSrc: img('grid-xdf', 'cell-active.png'),
            },
            {
              width: '50%',
              top: '15%',
              src: img('grid-xdf', '3.png'),
            },
          ],
        },
        {
          x: 2,
          y: 2,
          title: '谢谢参与',
          fonts: [
            {
              text: '谢谢参与',
              top: '67%',
            },
          ],
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-xdf', 'cell.png'),
              activeSrc: img('grid-xdf', 'cell-active.png'),
            },
            {
              width: '50%',
              top: '15%',
              src: img('grid-xdf', '4.png'),
            },
          ],
        },
        {
          x: 1,
          y: 2,
          title: '10金币',
          fonts: [
            {
              text: '10金币',
              top: '67%',
            },
          ],
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-xdf', 'cell.png'),
              activeSrc: img('grid-xdf', 'cell-active.png'),
            },
            {
              width: '50%',
              top: '15%',
              src: img('grid-xdf', '5.png'),
            },
          ],
        },
        {
          x: 0,
          y: 2,
          title: '小猴毛绒玩具',
          fonts: [
            {
              text: '小猴毛绒玩具',
              top: '67%',
            },
          ],
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-xdf', 'cell.png'),
              activeSrc: img('grid-xdf', 'cell-active.png'),
            },
            {
              width: '50%',
              top: '15%',
              src: img('grid-xdf', '6.png'),
            },
          ],
        },
        {
          x: 0,
          y: 1,
          title: '神秘大礼',
          fonts: [
            {
              text: '神秘大礼',
              top: '67%',
            },
          ],
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-xdf', 'cell.png'),
              activeSrc: img('grid-xdf', 'cell-active.png'),
            },
            {
              width: '50%',
              top: '15%',
              src: img('grid-xdf', '7.png'),
            },
          ],
        },
      ],
      buttons: [
        {
          x: 1,
          y: 1,
          background: 'rgba(0,0,0,0)',
          imgs: [
            {
              src: img('grid-xdf', 'button.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
      ],
      defaultStyle: {
        fontColor: '#ac804f',
        fontSize: '10px',
      },
    },
  },
  {
    id: 'grid-xq',
    title: '仿雪球九宫格抽奖',
    type: 'grid',
    width: '300px',
    height: '300px',
    externalButton: null,
    options: {
      blocks: [
        {
          padding: '15px',
          imgs: [
            {
              src: img('grid-xq', 'bg.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
      ],
      prizes: [
        {
          x: 0,
          y: 0,
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-xq', '0.png'),
              activeSrc: img('grid-xq', 'a0.png'),
            },
          ],
        },
        {
          x: 1,
          y: 0,
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-xq', '1.png'),
              activeSrc: img('grid-xq', 'a1.png'),
            },
          ],
        },
        {
          x: 2,
          y: 0,
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-xq', '2.png'),
              activeSrc: img('grid-xq', 'a2.png'),
            },
          ],
        },
        {
          x: 2,
          y: 1,
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-xq', '3.png'),
              activeSrc: img('grid-xq', 'a3.png'),
            },
          ],
        },
        {
          x: 2,
          y: 2,
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-xq', '4.png'),
              activeSrc: img('grid-xq', 'a4.png'),
            },
          ],
        },
        {
          x: 1,
          y: 2,
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-xq', '5.png'),
              activeSrc: img('grid-xq', 'a5.png'),
            },
          ],
        },
        {
          x: 0,
          y: 2,
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-xq', '6.png'),
              activeSrc: img('grid-xq', 'a6.png'),
            },
          ],
        },
        {
          x: 0,
          y: 1,
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-xq', '7.png'),
              activeSrc: img('grid-xq', 'a7.png'),
            },
          ],
        },
      ],
      buttons: [
        {
          x: 1,
          y: 1,
          background: 'rgba(0,0,0,0)',
          imgs: [
            {
              src: img('grid-xq', 'btn.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
      ],
      defaultConfig: {
        gutter: 10,
      },
    },
  },
  {
    id: 'grid-hwl',
    title: '仿好未来九宫格抽奖',
    type: 'grid',
    width: '300px',
    height: '300px',
    externalButton: null,
    options: {
      blocks: [
        {
          padding: '12px',
          background: '#f3f8ec',
          borderRadius: '10px',
        },
      ],
      prizes: [
        {
          x: 0,
          y: 0,
          title: '二次元时钟',
          fonts: [
            {
              text: '二次元时钟',
              top: '68%',
            },
          ],
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-hwl', 'cell.png'),
              activeSrc: img('grid-hwl', 'active.png'),
            },
            {
              width: '50%',
              top: '12%',
              src: img('grid-hwl', '0.png'),
            },
          ],
        },
        {
          x: 1,
          y: 0,
          title: '航天计时器',
          fonts: [
            {
              text: '航天计时器',
              top: '68%',
            },
          ],
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-hwl', 'cell.png'),
              activeSrc: img('grid-hwl', 'active.png'),
            },
            {
              width: '50%',
              top: '12%',
              src: img('grid-hwl', '1.png'),
            },
          ],
        },
        {
          x: 2,
          y: 0,
          title: '航天钥匙链',
          fonts: [
            {
              text: '航天钥匙链',
              top: '68%',
            },
          ],
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-hwl', 'cell.png'),
              activeSrc: img('grid-hwl', 'active.png'),
            },
            {
              width: '50%',
              top: '12%',
              src: img('grid-hwl', '2.png'),
            },
          ],
        },
        {
          x: 2,
          y: 1,
          title: '航天勋章',
          fonts: [
            {
              text: '航天勋章',
              top: '68%',
            },
          ],
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-hwl', 'cell.png'),
              activeSrc: img('grid-hwl', 'active.png'),
            },
            {
              width: '50%',
              top: '12%',
              src: img('grid-hwl', '3.png'),
            },
          ],
        },
        {
          x: 2,
          y: 2,
          title: '谢谢参与',
          fonts: [
            {
              text: '谢谢参与',
              top: '68%',
            },
          ],
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-hwl', 'cell.png'),
              activeSrc: img('grid-hwl', 'active.png'),
            },
            {
              width: '50%',
              top: '12%',
              src: img('grid-hwl', '4.png'),
            },
          ],
        },
        {
          x: 1,
          y: 2,
          title: '10金币',
          fonts: [
            {
              text: '10金币',
              top: '68%',
            },
          ],
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-hwl', 'cell.png'),
              activeSrc: img('grid-hwl', 'active.png'),
            },
            {
              width: '50%',
              top: '12%',
              src: img('grid-hwl', '5.png'),
            },
          ],
        },
        {
          x: 0,
          y: 2,
          title: '小猴毛绒玩具',
          fonts: [
            {
              text: '小猴毛绒玩具',
              top: '68%',
            },
          ],
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-hwl', 'cell.png'),
              activeSrc: img('grid-hwl', 'active.png'),
            },
            {
              width: '50%',
              top: '12%',
              src: img('grid-hwl', '6.png'),
            },
          ],
        },
        {
          x: 0,
          y: 1,
          title: '神秘大礼',
          fonts: [
            {
              text: '神秘大礼',
              top: '68%',
            },
          ],
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-hwl', 'cell.png'),
              activeSrc: img('grid-hwl', 'active.png'),
            },
            {
              width: '50%',
              top: '12%',
              src: img('grid-hwl', '7.png'),
            },
          ],
        },
      ],
      buttons: [
        {
          x: 1,
          y: 1,
          background: 'rgba(0,0,0,0)',
          imgs: [
            {
              src: img('grid-hwl', 'btn.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
      ],
      defaultStyle: {
        fontColor: '#4a7c23',
        fontSize: '10px',
        borderRadius: '8px',
      },
      activeStyle: {
        fontColor: '#2e5a12',
      },
      defaultConfig: {
        gutter: 6,
      },
    },
  },
  {
    id: 'grid-round',
    title: '仿咸鱼游戏圆形九宫格',
    type: 'grid',
    width: '300px',
    height: '300px',
    externalButton: null,
    options: {
      rows: 60,
      cols: 60,
      blocks: [
        {
          padding: '45px',
          imgs: [
            {
              src: img('grid-round', 'bg.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
      ],
      prizes: [
        {
          x: 24,
          y: 0,
          col: 12,
          row: 12,
          imgs: [
            {
              src: img('grid-round', '0.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
        {
          x: 36,
          y: 3,
          col: 12,
          row: 12,
          imgs: [
            {
              src: img('grid-round', '1.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
        {
          x: 45,
          y: 12,
          col: 12,
          row: 12,
          imgs: [
            {
              src: img('grid-round', '2.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
        {
          x: 48,
          y: 24,
          col: 12,
          row: 12,
          imgs: [
            {
              src: img('grid-round', '3.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
        {
          x: 45,
          y: 36,
          col: 12,
          row: 12,
          imgs: [
            {
              src: img('grid-round', '4.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
        {
          x: 36,
          y: 45,
          col: 12,
          row: 12,
          imgs: [
            {
              src: img('grid-round', '5.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
        {
          x: 24,
          y: 48,
          col: 12,
          row: 12,
          imgs: [
            {
              src: img('grid-round', '6.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
        {
          x: 12,
          y: 45,
          col: 12,
          row: 12,
          imgs: [
            {
              src: img('grid-round', '7.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
        {
          x: 3,
          y: 36,
          col: 12,
          row: 12,
          imgs: [
            {
              src: img('grid-round', '8.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
        {
          x: 0,
          y: 24,
          col: 12,
          row: 12,
          imgs: [
            {
              src: img('grid-round', '9.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
        {
          x: 3,
          y: 12,
          col: 12,
          row: 12,
          imgs: [
            {
              src: img('grid-round', '10.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
        {
          x: 12,
          y: 3,
          col: 12,
          row: 12,
          imgs: [
            {
              src: img('grid-round', '11.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
      ],
      buttons: [
        {
          x: 20,
          y: 20,
          col: 20,
          row: 20,
          background: 'rgba(0,0,0,0)',
          imgs: [
            {
              src: img('grid-round', 'btn.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
      ],
      defaultStyle: {
        fontSize: '8px',
        fontColor: '#fff',
      },
    },
  },
  {
    id: 'grid-yqs',
    title: '仿艺气山九宫格抽奖',
    type: 'grid',
    width: '300px',
    height: '300px',
    externalButton: null,
    options: {
      blocks: [
        {
          padding: '15px',
          imgs: [
            {
              src: img('grid-yqs', 'bg.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
      ],
      prizes: [
        {
          x: 0,
          y: 0,
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-yqs', 'prize0.png'),
              activeSrc: img('grid-yqs', 'prize0-on.png'),
            },
          ],
        },
        {
          x: 1,
          y: 0,
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-yqs', 'prize1.png'),
              activeSrc: img('grid-yqs', 'prize1-on.png'),
            },
          ],
        },
        {
          x: 2,
          y: 0,
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-yqs', 'prize2.png'),
              activeSrc: img('grid-yqs', 'prize2-on.png'),
            },
          ],
        },
        {
          x: 2,
          y: 1,
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-yqs', 'prize3.png'),
              activeSrc: img('grid-yqs', 'prize3-on.png'),
            },
          ],
        },
        {
          x: 2,
          y: 2,
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-yqs', 'prize4.png'),
              activeSrc: img('grid-yqs', 'prize4-on.png'),
            },
          ],
        },
        {
          x: 1,
          y: 2,
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-yqs', 'prize5.png'),
              activeSrc: img('grid-yqs', 'prize5-on.png'),
            },
          ],
        },
        {
          x: 0,
          y: 2,
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-yqs', 'prize6.png'),
              activeSrc: img('grid-yqs', 'prize6-on.png'),
            },
          ],
        },
        {
          x: 0,
          y: 1,
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('grid-yqs', 'prize7.png'),
              activeSrc: img('grid-yqs', 'prize7-on.png'),
            },
          ],
        },
      ],
      buttons: [
        {
          x: 1,
          y: 1,
          background: 'rgba(0,0,0,0)',
          imgs: [
            {
              src: img('grid-yqs', 'start-btn.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
      ],
      defaultConfig: {
        gutter: -15,
      },
      activeStyle: {
        background: 'rgba(0,0,0,0)',
      },
    },
  },
];
