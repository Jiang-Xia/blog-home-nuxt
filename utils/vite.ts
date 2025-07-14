import { visualizer } from 'rollup-plugin-visualizer';
// 动态加载文件
export const getFileUrl = (url: string) => {
  // console.log(url, `../assets${url}`);
  const newUrl: URL = new URL(`../assets${url}`, import.meta.url);
  // console.log(newUrl, '--->', import.meta.url);
  return newUrl.href;
};

/**
 * Generation packaging analysis
 * 生成打包分析
 */
// const isReportMode = process.argv.includes('--report');
// export const configVisualizerPlugin = () => {
//   console.log('是否开启打包分析', isReportMode);
//   if (isReportMode) {
//     return visualizer({
//       filename: './node_modules/.cache/visualizer/stats.html',
//       open: true, // 在默认用户代理中打开生成的文件
//       gzipSize: true, // 从源代码中收集 gzip 大小并将其显示在图表中
//       brotliSize: true, // 从源代码中收集 brotli 大小并将其显示在图表中
//       title: 'Rollup Visualizer',
//       template: 'treemap',
//       // template 图表类型 (string, default treemap) - Which diagram type to use: sunburst, treemap, network, raw-data, list.
//     });
//   }
//   return [];
// };
