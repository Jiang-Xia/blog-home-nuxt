import { config } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
config({
  editorExtensions: {
    katex: {
      js: 'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-11/ic3osyz5xvtmnvp5h302cb-katex.min.js',
      css: 'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-11/ic3osyz5xvtmnvp5h30277-katex.min.css',
    },
    cropper: {
      js: 'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-11/ic3osyz5xvtmnvp5h302mj-cropper.min.js',
    },
    highlight: {
      js: 'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-11/m03uups84sxorl2ckyln87-highlight.min.js',
      css: {
        // 自定义主题
        atom: {
          light:
            'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-11/ic3osyz5xvtmnvp5h30223-atom-one-light.min.css',
          dark: 'https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-11/ic3osyz5xvtmnvp5h302hf-atom-one-dark.css',
        },
      },
    },
    mermaid: {
      js: 'https://jiang-xia.top/x-blog/api/v1/static/uploads/2024-04/fd20c758948743f0addd3e9f31fb946c-mermaid.min.js',
    },
  },
  mermaidConfig (base: any) {
    return {
      ...base,
      logLevel: 'error',
    }
  },
})
