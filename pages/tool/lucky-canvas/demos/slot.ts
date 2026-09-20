/**
 * lucky-canvas slot 示例配置（手维）
 * 图片：public/lucky-canvas/slot/{id}/imgs/
 */
import type { LuckyDemoItem } from './types';
import { asset } from './helpers';

/** 本文件内短写静态资源路径 */
const img = (id: string, file: string) => asset('slot', id, file);

export const SLOT_DEMOS: LuckyDemoItem[] = [
  {
    id: 'slot-dy',
    title: '仿抖音抽盲盒(老虎机)',
    type: 'slot',
    width: '360px',
    height: '260px',
    externalButton: {
      kind: 'button',
      label: '开始抽奖',
    },
    options: {
      blocks: [
        {
          padding: '108px 61px 52px',
          imgs: [
            {
              width: '100%',
              src: img('slot-dy', 'bg.png'),
            },
          ],
        },
      ],
      slots: [
        {
          order: [1, 2, 0, 3, 4, 5],
          speed: 1,
        },
      ],
      prizes: [
        {
          name: '汉服一套',
          imgs: [
            {
              height: '100%',
              src: img('slot-dy', '0.png'),
            },
          ],
        },
        {
          name: '考古盲盒',
          imgs: [
            {
              height: '100%',
              src: img('slot-dy', '1.png'),
            },
          ],
        },
        {
          name: '国风飘带',
          imgs: [
            {
              height: '100%',
              src: img('slot-dy', '2.png'),
            },
          ],
        },
        {
          name: '国风小物',
          imgs: [
            {
              height: '100%',
              src: img('slot-dy', '3.png'),
            },
          ],
        },
        {
          name: '联名汉服',
          imgs: [
            {
              height: '100%',
              src: img('slot-dy', '4.png'),
            },
          ],
        },
        {
          name: '现金红包',
          imgs: [
            {
              height: '100%',
              src: img('slot-dy', '5.png'),
            },
          ],
        },
      ],
      defaultConfig: {
        mode: 'horizontal',
        rowSpacing: '0px',
        colSpacing: '-41px',
      },
    },
  },
  {
    id: 'slot-didi',
    title: '仿滴滴老虎机抽奖',
    type: 'slot',
    width: '350px',
    height: '250px',
    externalButton: {
      kind: 'image',
      src: img('slot-didi', 'btn.png'),
      label: '开始抽奖',
      overlay: {
        width: '180px',
        left: '25%',
        top: '70%',
      },
    },
    options: {
      blocks: [
        {
          imgs: [
            {
              width: '71%',
              height: '110px',
              top: '17%',
              src: img('slot-didi', 'area.png'),
            },
          ],
        },
        {
          padding: '45px 55px 100px',
          imgs: [
            {
              left: '3px',
              width: '100%',
              height: '130%',
              top: '-35',
              src: img('slot-didi', 'bg.png'),
            },
          ],
        },
      ],
      slots: [
        {
          order: [0, 1, 2],
          speed: 15,
        },
        {
          order: [2, 0, 1],
          speed: 15,
          direction: -1,
        },
        {
          order: [1, 2, 0],
          speed: 20,
        },
      ],
      prizes: [
        {
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('slot-didi', 'cell.png'),
            },
            {
              width: '80%',
              top: '20%',
              src: img('slot-didi', '0.png'),
            },
          ],
        },
        {
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('slot-didi', 'cell.png'),
            },
            {
              width: '70%',
              top: '12%',
              src: img('slot-didi', '1.png'),
            },
          ],
        },
        {
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: img('slot-didi', 'cell.png'),
            },
            {
              width: '80%',
              top: '20%',
              src: img('slot-didi', '2.png'),
            },
          ],
        },
      ],
      defaultConfig: {
        rowSpacing: '1px',
        colSpacing: '6.5px',
      },
    },
  },
];
