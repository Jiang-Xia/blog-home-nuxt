/**
 * 将 Blob 保存到本地文件。
 * showSaveFilePicker 必须在用户点击手势内尽早调用；Worker / 长 await 之后再 a.download
 * 常被浏览器静默拦截（表现为「点了没反应」但业务已成功）。
 */

/** 在用户手势内弹出系统「另存为」；不支持或失败时返回 null；用户取消抛出 AbortError */
export async function pickSaveFileHandle(
  suggestedName: string,
  mime: string,
): Promise<FileSystemFileHandle | null> {
  if (!import.meta.client || typeof window.showSaveFilePicker !== 'function') {
    return null;
  }

  const ext = suggestedName.includes('.') ? `.${suggestedName.split('.').pop()}` : '';

  try {
    return await window.showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: 'File',
          accept: { [mime]: ext ? [ext] : [] },
        },
      ],
    });
  }
  catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    console.warn('[save-blob] showSaveFilePicker failed', err);
    return null;
  }
}

/** 写入 File System Access 句柄 */
export async function writeBlobToFileHandle(
  handle: FileSystemFileHandle,
  blob: Blob,
): Promise<void> {
  const writable = await handle.createWritable();
  try {
    await writable.write(blob);
  }
  finally {
    await writable.close();
  }
}

/**
 * 通过隐藏 <a download> 触发下载。
 * 须尽量仍在用户手势链路内调用；并延迟 revoke 以免取消下载。
 */
export function downloadBlobViaAnchor(blob: Blob, filename: string): void {
  const link = document.createElement('a');
  const objectUrl = URL.createObjectURL(blob);
  link.href = objectUrl;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
}

/**
 * 优先写入已选句柄，否则走 a.download。
 * @param handle 若在点击时已拿到，可安全配合 Worker 导出
 */
export async function saveBlob(
  blob: Blob,
  filename: string,
  handle: FileSystemFileHandle | null,
): Promise<void> {
  if (handle) {
    await writeBlobToFileHandle(handle, blob);
    return;
  }
  downloadBlobViaAnchor(blob, filename);
}

/** 是否为用户取消另存为 */
export function isSaveAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}
