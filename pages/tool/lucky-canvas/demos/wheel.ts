/**
 * lucky-canvas wheel 示例配置（手维）
 * 图片：public/lucky-canvas/wheel/{id}/imgs/
 */
import type { LuckyDemoItem } from './types';
import { asset } from './helpers';

/** 本文件内短写静态资源路径 */
const img = (id: string, file: string) => asset('wheel', id, file);

export const WHEEL_DEMOS: LuckyDemoItem[] = [
  {
    id: 'wheel-zo',
    title: '仿中欧基金大转盘',
    type: 'wheel',
    width: '300px',
    height: '300px',
    externalButton: null,
    options: {
      prizes: [
        {
          fonts: [
            {
              text: '5888元',
              top: '36%',
            },
          ],
          imgs: [
            {
              src: img('wheel-zo', '0.png'),
              width: '50%',
              top: '55%',
            },
          ],
        },
        {
          fonts: [
            {
              text: ' 20元',
              top: '36%',
            },
          ],
          imgs: [
            {
              src: img('wheel-zo', '4.png'),
              width: '50%',
              top: '55%',
            },
          ],
        },
        {
          fonts: [
            {
              text: '季卡',
              top: '36%',
            },
          ],
          imgs: [
            {
              src: img('wheel-zo', '5.png'),
              width: '50%',
              top: '55%',
            },
          ],
        },
        {
          fonts: [
            {
              text: '5元',
              top: '36%',
            },
          ],
          imgs: [
            {
              src: img('wheel-zo', '1.png'),
              width: '50%',
              top: '55%',
            },
          ],
        },
        {
          fonts: [
            {
              text: '10000元',
              top: '36%',
            },
          ],
          imgs: [
            {
              src: img('wheel-zo', '2.png'),
              width: '50%',
              top: '55%',
            },
          ],
        },
        {
          fonts: [
            {
              text: ' 30天',
              top: '36%',
            },
          ],
          imgs: [
            {
              src: img('wheel-zo', '6.png'),
              width: '50%',
              top: '55%',
            },
          ],
        },
      ],
      buttons: [
        {
          radius: '25%',
          fonts: [
            {
              text: '立即\n抽奖',
              fontColor: '#fff',
              top: '-50%',
              fontSize: '16px',
            },
          ],
          imgs: [
            {
              src: img('wheel-zo', 'btn2.png'),
              width: '120%',
              top: '-125%',
            },
          ],
        },
      ],
      blocks: [
        {
          imgs: [
            {
              src: img('wheel-zo', 'bg3.png'),
              width: '100%',
              rotate: true,
            },
          ],
        },
      ],
      defaultStyle: {
        fontColor: '#913229',
        fontSize: '15px',
        fontWeight: 700,
      },
      defaultConfig: {
        offsetDegree: -30,
      },
    },
  },
  {
    id: 'wheel-pdmm',
    title: '仿潘德妈妈大转盘',
    type: 'wheel',
    width: '300px',
    height: '300px',
    externalButton: null,
    options: {
      blocks: [
        {
          padding: '30px',
          imgs: [
            {
              src: img('wheel-pdmm', 'bg.png'),
              width: '100%',
              height: '100%',
              top: '6px',
            },
          ],
        },
        {
          padding: '3px',
          background: '#a70c1b',
        },
      ],
      prizes: [
        {
          name: '谢谢参与',
          background: '#ffd099',
          fonts: [
            {
              text: '谢谢参与',
              top: '8%',
            },
          ],
          imgs: [
            {
              src: img('wheel-pdmm', '01.png'),
              width: '30%',
              top: '30%',
            },
          ],
        },
        {
          name: '红包',
          background: '#fff',
          fonts: [
            {
              text: '红包',
              top: '8%',
            },
          ],
          imgs: [
            {
              src: img('wheel-pdmm', '02.png'),
              width: '30%',
              top: '30%',
            },
          ],
        },
        {
          name: '抽奖次数+3',
          background: '#ffd099',
          fonts: [
            {
              text: '抽奖次数+3',
              top: '8%',
            },
          ],
          imgs: [
            {
              src: img('wheel-pdmm', '03.png'),
              width: '30%',
              top: '30%',
            },
          ],
        },
        {
          name: '礼物',
          background: '#fff',
          fonts: [
            {
              text: '礼物',
              top: '8%',
            },
          ],
          imgs: [
            {
              src: img('wheel-pdmm', '04.png'),
              width: '30%',
              top: '30%',
            },
          ],
        },
        {
          name: '谢谢参与',
          background: '#ffd099',
          fonts: [
            {
              text: '谢谢参与',
              top: '8%',
            },
          ],
          imgs: [
            {
              src: img('wheel-pdmm', '01.png'),
              width: '30%',
              top: '30%',
            },
          ],
        },
        {
          name: '红包',
          background: '#fff',
          fonts: [
            {
              text: '红包',
              top: '8%',
            },
          ],
          imgs: [
            {
              src: img('wheel-pdmm', '02.png'),
              width: '30%',
              top: '30%',
            },
          ],
        },
        {
          name: '抽奖次数+3',
          background: '#ffd099',
          fonts: [
            {
              text: '抽奖次数+3',
              top: '8%',
            },
          ],
          imgs: [
            {
              src: img('wheel-pdmm', '03.png'),
              width: '30%',
              top: '30%',
            },
          ],
        },
        {
          name: '礼物',
          background: '#fff',
          fonts: [
            {
              text: '礼物',
              top: '8%',
            },
          ],
          imgs: [
            {
              src: img('wheel-pdmm', '04.png'),
              width: '30%',
              top: '30%',
            },
          ],
        },
      ],
      buttons: [
        {
          radius: '45px',
          imgs: [
            {
              src: img('wheel-pdmm', 'btn.png'),
              width: '102%',
              top: '-127%',
            },
          ],
        },
      ],
      defaultStyle: {
        fontColor: '#a70c1b',
        fontSize: '10px',
      },
    },
  },
  {
    id: 'wheel-jd',
    title: '仿京东大转盘抽京豆',
    type: 'wheel',
    width: '300px',
    height: '300px',
    externalButton: null,
    options: {
      // 仅外框灯珠；指针放 buttons，避免 prizes 后绘盖住（canvas 无 z-index）
      blocks: [
        {
          padding: '30px',
          imgs: [
            {
              src: img('wheel-jd', 'bg.png'),
              width: '100%',
              height: '100%',
            },
          ],
        },
      ],
      prizes: [
        {
          name: '10个京豆',
          background: '#F8DEF8',
          fonts: [
            {
              text: '10个京豆',
              top: '12%',
            },
          ],
          imgs: [
            {
              src: img('wheel-jd', '1.png'),
              width: '45%',
              top: '35%',
            },
          ],
        },
        {
          name: '5个京豆',
          background: '#FEF3FC',
          fonts: [
            {
              text: '5个京豆',
              top: '12%',
            },
          ],
          imgs: [
            {
              src: img('wheel-jd', '1.png'),
              width: '45%',
              top: '35%',
            },
          ],
        },
        {
          name: '1个京豆',
          background: '#F8DEF8',
          fonts: [
            {
              text: '1个京豆',
              top: '12%',
            },
          ],
          imgs: [
            {
              src: img('wheel-jd', '1.png'),
              width: '45%',
              top: '35%',
            },
          ],
        },
        {
          name: '谢谢参与',
          background: '#FEF3FC',
          fonts: [
            {
              text: '谢谢参与',
              top: '12%',
            },
          ],
          imgs: [
            {
              src: img('wheel-jd', '0.png'),
              width: '45%',
              top: '35%',
            },
          ],
        },
        {
          name: '10个京豆',
          background: '#F8DEF8',
          fonts: [
            {
              text: '10个京豆',
              top: '12%',
            },
          ],
          imgs: [
            {
              src: img('wheel-jd', '1.png'),
              width: '45%',
              top: '35%',
            },
          ],
        },
        {
          name: '5个京豆',
          background: '#FEF3FC',
          fonts: [
            {
              text: '5个京豆',
              top: '12%',
            },
          ],
          imgs: [
            {
              src: img('wheel-jd', '1.png'),
              width: '45%',
              top: '35%',
            },
          ],
        },
        {
          name: '1个京豆',
          background: '#F8DEF8',
          fonts: [
            {
              text: '1个京豆',
              top: '12%',
            },
          ],
          imgs: [
            {
              src: img('wheel-jd', '1.png'),
              width: '45%',
              top: '35%',
            },
          ],
        },
        {
          name: '谢谢参与',
          background: '#FEF3FC',
          fonts: [
            {
              text: '谢谢参与',
              top: '12%',
            },
          ],
          imgs: [
            {
              src: img('wheel-jd', '0.png'),
              width: '45%',
              top: '35%',
            },
          ],
        },
      ],
      buttons: [
        {
          radius: '40px',
          imgs: [
            // top 对齐原 blocks 定位：block 半径 120 时 (-20px - 120) = -140px
            {
              src: img('wheel-jd', 'btn.png'),
              width: '20px',
              top: '-140px',
            },
            {
              src: img('wheel-jd', 'button.png'),
              width: '100%',
              top: '-100%',
            },
          ],
        },
      ],
      defaultStyle: {
        fontColor: '#000',
        fontSize: '13px',
        fontStyle: 'SimHei',
      },
      defaultConfig: {
        offsetDegree: 22.5,
      },
    },
  },
  {
    id: 'wheel-xc',
    title: '仿携程转盘抽奖',
    type: 'wheel',
    width: '300px',
    height: '300px',
    externalButton: null,
    options: {
      blocks: [
        {
          imgs: [
            {
              src: img('wheel-xc', 'bg.png'),
              width: '100%',
              rotate: true,
            },
          ],
        },
      ],
      prizes: [
        {
          name: '免费住酒店',
        },
        {
          name: '房型升级',
        },
        {
          name: '免费取消',
        },
        {
          name: '延迟退房',
        },
        {
          name: '免费早餐',
        },
        {
          name: '明天再来',
        },
      ],
      buttons: [
        {
          radius: '25%',
          fonts: [
            {
              text: '开始\n抽奖',
              fontColor: '#fff',
              top: '-50%',
              fontSize: '16px',
            },
          ],
          imgs: [
            {
              src: img('wheel-xc', 'btn.png'),
              width: '120%',
              top: '-175%',
            },
          ],
        },
      ],
      defaultConfig: {
        offsetDegree: 0,
      },
    },
  },
  {
    id: 'wheel-bili',
    title: '仿bilibili抽奖',
    type: 'wheel',
    width: '300px',
    height: '300px',
    externalButton: null,
    options: {
      blocks: [
        {
          padding: '40px',
          imgs: [
            {
              src: img('wheel-bili', 'bg.png'),
              width: '100%',
            },
          ],
        },
        {
          imgs: [
            {
              src: img('wheel-bili', 'prize.png'),
              width: '100%',
              rotate: true,
            },
          ],
        },
        {
          imgs: [
            {
              src: img('wheel-bili', 'point.png'),
              width: '20px',
              top: '-25px',
            },
          ],
        },
      ],
      prizes: [
        {
          id: '0',
        },
        {
          id: '1',
        },
        {
          id: '2',
        },
        {
          id: '3',
        },
        {
          id: '4',
        },
        {
          id: '5',
        },
      ],
      buttons: [
        {
          radius: '48%',
          imgs: [
            {
              src: img('wheel-bili', 'btn.png'),
              width: '100%',
              top: '-100%',
            },
            {
              src: img('wheel-bili', 'logo.png'),
              width: '70%',
              top: '-70%',
            },
          ],
        },
      ],
      defaultConfig: {
        speed: 10,
        offsetDegree: -30,
      },
    },
  },
];
