/**
 * md-editor-v3 全局扩展配置（Katex / highlight / mermaid CDN）。
 * 勿在 app.vue 静态引入；由详情/关于/编辑/RAG 预览入口调用 ensureEditorConfig。
 * 调用方通常已静态 import MdPreview/MdEditor，此处同步 config + 样式即可。
 */
import { config } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { originUrl } from '~/config';

let configured = false;

/** 幂等初始化 md-editor 配置与样式 */
export function ensureEditorConfig(): void {
  if (configured) return;
  configured = true;
  config({
    editorExtensions: {
      katex: {
        js:
          originUrl
          + '/x-api/blog-server/static/uploads/2022-08-11/ic3osyz5xvtmnvp5h302cb-katex.min.js',
        css:
          originUrl
          + '/x-api/blog-server/static/uploads/2022-08-11/ic3osyz5xvtmnvp5h30277-katex.min.css',
      },
      cropper: {
        js:
          originUrl
          + '/x-api/blog-server/static/uploads/2022-08-11/ic3osyz5xvtmnvp5h302mj-cropper.min.js',
      },
      highlight: {
        js:
          originUrl
          + '/x-api/blog-server/static/uploads/2022-08-11/m03uups84sxorl2ckyln87-highlight.min.js',
        css: {
          atom: {
            light:
              originUrl
              + '/x-api/blog-server/static/uploads/2022-08-11/ic3osyz5xvtmnvp5h30223-atom-one-light.min.css',
            dark:
              originUrl
              + '/x-api/blog-server/static/uploads/2022-08-11/ic3osyz5xvtmnvp5h302hf-atom-one-dark.css',
          },
        },
      },
      mermaid: {
        js:
          originUrl
          + '/x-blog/api/v1/static/uploads/2024-04/fd20c758948743f0addd3e9f31fb946c-mermaid.min.js',
      },
    },
    mermaidConfig(base: any) {
      return {
        ...base,
        logLevel: 'error',
      };
    },
  });
}
