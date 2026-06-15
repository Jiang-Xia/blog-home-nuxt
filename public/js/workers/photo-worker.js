/* eslint-disable no-undef */
let exifReaderReady = false;

function ensureExifReader() {
  if (!exifReaderReady) {
    importScripts('/js/cdn/exif-reader.min.js');
    exifReaderReady = true;
  }
}

const EXIF_KEYS = [
  ['Make'],
  ['Model'],
  ['DateTime', 'DateTimeOriginal', 'CreateDate'],
  ['FNumber', 'ApertureValue'],
  ['ExposureTime', 'ShutterSpeedValue'],
  ['FocalLength'],
  ['FocalLengthIn35mmFilm', 'FocalLengthIn35mmFormat'],
  ['ISOSpeedRatings', 'ISOSpeed', 'ISO'],
];

function flattenExifTags(tags) {
  if (tags && tags.exif) {
    return Object.assign({}, tags.file || {}, tags.exif, tags.gps || {});
  }
  return tags || {};
}

function getTagValue(tags, keys) {
  for (let i = 0; i < keys.length; i++) {
    const tag = tags[keys[i]];
    if (!tag) continue;
    if (tag.description) return String(tag.description);
    if (tag.value !== undefined) {
      return Array.isArray(tag.value) ? tag.value.join(', ') : String(tag.value);
    }
  }
  return '';
}

function parseExifTags(tags) {
  const flat = flattenExifTags(tags);
  const obj = {};
  EXIF_KEYS.forEach(function (entry) {
    const primary = entry[0];
    obj[primary] = getTagValue(flat, entry);
  });
  return obj;
}

function createDownscaled(bitmap, maxDim) {
  const srcW = bitmap.width;
  const srcH = bitmap.height;
  const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.transferToImageBitmap();
}

self.onmessage = async function (event) {
  const msg = event.data || {};
  const id = msg.id;
  const type = msg.type;

  try {
    if (type === 'exif') {
      ensureExifReader();
      const tags = await ExifReader.load(msg.buffer, { async: true });
      self.postMessage({ id: id, type: type, data: parseExifTags(tags) });
      return;
    }

    if (type === 'blur') {
      const bitmap = msg.bitmap;
      const width = msg.width;
      const height = msg.height;
      const blur = msg.blur;
      const maxDim = msg.maxDim || 280;

      const small = createDownscaled(bitmap, maxDim);
      bitmap.close();

      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      const coverScale = Math.max(width / small.width, height / small.height);
      const coverW = small.width * coverScale;
      const coverH = small.height * coverScale;
      const x = (width - coverW) / 2;
      const y = (height - coverH) / 2;

      ctx.filter = blur > 0 ? 'blur(' + Math.min(blur, 20) + 'px)' : 'none';
      ctx.globalAlpha = 0.45;
      ctx.drawImage(small, x, y, coverW, coverH);
      small.close();

      const result = canvas.transferToImageBitmap();
      self.postMessage({ id: id, type: type, bitmap: result }, [result]);
      return;
    }

    self.postMessage({ id: id, type: type, error: 'Unknown task' });
  } catch (error) {
    self.postMessage({ id: id, type: type, error: String(error) });
  }
};
