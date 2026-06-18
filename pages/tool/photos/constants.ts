export interface PhotoSettings {
  padding: number;
  blur: number;
  borderRadius: number;
  shadow: number;
  showExif: boolean;
  logoBrand: string;
}

export const DEFAULT_PHOTO_SETTINGS: PhotoSettings = {
  padding: 28,
  blur: 24,
  borderRadius: 12,
  shadow: 12,
  showExif: true,
  logoBrand: '',
};

export const LOGO_BRAND_OPTIONS = [
  { value: '', label: '自动识别' },
  { value: 'nikon', label: 'Nikon' },
  { value: 'nikon_full', label: 'Nikon Full' },
  { value: 'canon', label: 'Canon' },
  { value: 'sony', label: 'Sony' },
  { value: 'fujifilm', label: 'Fujifilm' },
  { value: 'hasselblad', label: 'Hasselblad' },
  { value: 'hasselblad-t', label: 'Hasselblad T' },
  { value: 'leica', label: 'Leica' },
  { value: 'leica_full', label: 'Leica Full' },
  { value: 'leica_red_full', label: 'Leica Red' },
  { value: 'red', label: 'RED' },
  { value: 'red_full', label: 'RED Full' },
  { value: 'dji', label: 'DJI' },
  { value: 'install360', label: 'Insta360' },
  { value: 'kodak', label: 'Kodak' },
  { value: 'lumix', label: 'Lumix' },
  { value: 'mamiya', label: 'Mamiya' },
  { value: 'olympus', label: 'Olympus' },
  { value: 'panasonic', label: 'Panasonic' },
  { value: 'pentax', label: 'Pentax' },
  { value: 'phaseOne', label: 'Phase One' },
  { value: 'ricoh', label: 'Ricoh' },
  { value: 'rolleiflex', label: 'Rolleiflex' },
  { value: 'sigma', label: 'Sigma' },
  { value: 'tamron', label: 'Tamron' },
  { value: 'zeiss_full', label: 'Zeiss' },
] as const;

const BRAND_LOGO_MAP: Record<string, string> = {
  'NIKON': 'nikon',
  'NIKON CORPORATION': 'nikon_full',
  'CANON': 'canon',
  'CANON INC.': 'canon',
  'SONY': 'sony',
  'FUJIFILM': 'fujifilm',
  'HASSELBLAD': 'hasselblad',
  'LEICA': 'leica',
  'LEICA CAMERA AG': 'leica_full',
  'RED': 'red',
  'DJI': 'dji',
  'KODAK': 'kodak',
  'PANASONIC': 'panasonic',
  'OLYMPUS': 'olympus',
  'OLYMPUS CORPORATION': 'olympus',
  'PENTAX': 'pentax',
  'RICOH': 'ricoh',
  'SIGMA': 'sigma',
  'TAMRON': 'tamron',
  'ZEISS': 'zeiss_full',
  'PHASE ONE': 'phaseOne',
  'MAMIYA': 'mamiya',
  'LUMIX': 'lumix',
};

export function resolveLogoName(make: string, override = ''): string {
  if (override) return override;
  if (!make) return '';
  const key = make.trim().toUpperCase();
  return BRAND_LOGO_MAP[key] || key.split(/\s+/)[0]?.toLowerCase() || '';
}

export function getLogoUrl(name: string): string {
  return name ? `/images/photos/logo/${name}.png` : '';
}

export const MAX_PHOTOS = 50;

export const EXIF_LABELS: Record<string, string> = {
  Make: '品牌',
  Model: '型号',
  DateTime: '拍摄时间',
  FNumber: '光圈',
  ExposureTime: '快门',
  FocalLength: '焦距',
  FocalLengthIn35mmFilm: '等效焦距',
  ISOSpeedRatings: 'ISO',
};
