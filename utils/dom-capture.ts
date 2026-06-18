import { domToPng, type Options } from 'modern-screenshot';

/** DOM 截图封装，返回 PNG data URL */
export async function captureHtmlElement(source: HTMLElement, options?: Options): Promise<string> {
  return domToPng(source, options);
}
