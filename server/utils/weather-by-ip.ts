/**
 * IP → 定位 → Open-Meteo 天气（Nitro 试验能力）。
 * 数据来源：ip-api.com（免费档仅 HTTP）+ api.open-meteo.com（免 key）。
 * 不替代 blog-server `/rpg/weather-buff`，仅供 home 侧探测与后续接入参考。
 */
import type { H3Event } from 'h3';
import { createError, getHeader, getRequestIP } from 'h3';

/** 定位结果（城市 + 经纬度） */
export interface GeoLocation {
  ip: string;
  city: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  /** geo 来源：ip-api / open-meteo-geocoding / fallback */
  source: 'ip-api' | 'open-meteo-geocoding' | 'fallback';
}

/** Open-Meteo current 摘要 */
export interface WeatherSnapshot {
  temperature: number;
  weatherCode: number;
  /** 中文天气文案（由 WMO code 映射，非上游原文） */
  label: string;
  humidity: number;
  windSpeed: number;
  time: string;
}

/** 与 Nest weatherBuff 对齐的临时 EXP 加成（未命中规则时为 null） */
export interface WeatherBuffDraft {
  label: string;
  expBoost: number;
  weather: string;
}

interface IpApiResponse {
  status: string;
  message?: string;
  country?: string;
  regionName?: string;
  city?: string;
  lat?: number;
  lon?: number;
  query?: string;
}

interface OpenMeteoCurrentResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    weather_code?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
  };
}

interface OpenMeteoGeocodeResponse {
  results?: Array<{
    name?: string;
    country?: string;
    admin1?: string;
    latitude?: number;
    longitude?: number;
  }>;
}

/** 北京兜底坐标（本地 / 私网 IP 无法定位时使用） */
export const FALLBACK_GEO: GeoLocation = {
  ip: '',
  city: '北京',
  region: '北京',
  country: 'China',
  lat: 39.9042,
  lon: 116.4074,
  source: 'fallback',
};

/** 判断是否为环回或 RFC1918 私网地址（这类 IP 无法用公网库定位） */
export function isPrivateOrLocalIp(ip: string): boolean {
  const v = ip.trim().toLowerCase();
  if (!v || v === '127.0.0.1' || v === '::1' || v === 'localhost' || v === '0.0.0.0') {
    return true;
  }
  if (v.startsWith('10.') || v.startsWith('192.168.') || v.startsWith('169.254.')) {
    return true;
  }
  // 172.16.0.0 – 172.31.255.255
  const m = v.match(/^172\.(\d+)\./);
  if (m) {
    const n = Number(m[1]);
    if (n >= 16 && n <= 31) return true;
  }
  // IPv6 唯一本地 / 链路本地（简化）
  if (v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80:')) {
    return true;
  }
  return false;
}

/**
 * 从请求头解析客户端 IP；优先 x-forwarded-for / x-real-ip，再回退 getRequestIP。
 * 副作用：无；仅读 header。
 */
export function resolveClientIp(event: H3Event, queryIp?: string): string {
  if (queryIp?.trim()) {
    return queryIp.trim();
  }
  const xff = getHeader(event, 'x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = getHeader(event, 'x-real-ip');
  if (realIp?.trim()) return realIp.trim();
  return getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1';
}

/** 通过 ip-api.com 将公网 IP 解析为城市与经纬度（免费档仅支持 HTTP） */
export async function lookupGeoByIp(ip: string): Promise<GeoLocation> {
  const url
    = `http://ip-api.com/json/${encodeURIComponent(ip)}`
      + '?fields=status,message,country,regionName,city,lat,lon,query';
  const data = await $fetch<IpApiResponse>(url, { timeout: 5000 });
  if (data.status !== 'success' || typeof data.lat !== 'number' || typeof data.lon !== 'number') {
    throw createError({
      statusCode: 502,
      statusMessage: `ip-api 定位失败: ${data.message || 'unknown'}`,
    });
  }
  return {
    ip: data.query || ip,
    city: data.city || '',
    region: data.regionName || '',
    country: data.country || '',
    lat: data.lat,
    lon: data.lon,
    source: 'ip-api',
  };
}

/** 通过 Open-Meteo Geocoding 按城市名解析经纬度（调试用 ?city=） */
export async function lookupGeoByCity(city: string): Promise<GeoLocation> {
  const url
    = 'https://geocoding-api.open-meteo.com/v1/search'
      + `?name=${encodeURIComponent(city)}&count=1&language=zh`;
  const data = await $fetch<OpenMeteoGeocodeResponse>(url, { timeout: 5000 });
  const hit = data.results?.[0];
  if (!hit || typeof hit.latitude !== 'number' || typeof hit.longitude !== 'number') {
    throw createError({
      statusCode: 404,
      statusMessage: `未找到城市: ${city}`,
    });
  }
  return {
    ip: '',
    city: hit.name || city,
    region: hit.admin1 || '',
    country: hit.country || '',
    lat: hit.latitude,
    lon: hit.longitude,
    source: 'open-meteo-geocoding',
  };
}

/** 拉取 Open-Meteo 当前天气（temperature / WMO code / 湿度 / 风速） */
export async function fetchOpenMeteoWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
  const url
    = 'https://api.open-meteo.com/v1/forecast'
      + `?latitude=${lat}&longitude=${lon}`
      + '&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m'
      + '&timezone=auto';
  const data = await $fetch<OpenMeteoCurrentResponse>(url, { timeout: 5000 });
  const cur = data.current;
  if (!cur || typeof cur.weather_code !== 'number') {
    throw createError({
      statusCode: 502,
      statusMessage: 'Open-Meteo 返回空天气数据',
    });
  }
  const weatherCode = cur.weather_code;
  const label = wmoCodeToLabel(weatherCode);
  return {
    temperature: Number(cur.temperature_2m ?? 0),
    weatherCode,
    label,
    humidity: Number(cur.relative_humidity_2m ?? 0),
    windSpeed: Number(cur.wind_speed_10m ?? 0),
    time: String(cur.time || ''),
  };
}

/**
 * WMO weather_code → 中文简短文案。
 * 参考：https://open-meteo.com/en/docs （WMO Weather interpretation codes）
 */
export function wmoCodeToLabel(code: number): string {
  if (code === 0) return '晴';
  if (code === 1) return '晴间多云';
  if (code === 2) return '多云';
  if (code === 3) return '阴';
  if (code === 45 || code === 48) return '雾';
  if (code >= 51 && code <= 57) return '毛毛雨';
  if (code >= 61 && code <= 67) return '雨';
  if (code >= 71 && code <= 77) return '雪';
  if (code >= 80 && code <= 82) return '阵雨';
  if (code === 85 || code === 86) return '阵雪';
  if (code >= 95 && code <= 99) return '雷暴';
  return `天气码${code}`;
}

/**
 * 将天气文案映射为 RPG 临时 EXP Buff（对齐 Nest mapWeatherToBuff，并补雾霾/雾）。
 * 未匹配时返回 null。
 */
export function mapWeatherToBuff(label: string): WeatherBuffDraft | null {
  const lower = label.toLowerCase();
  if (label.includes('雨') || lower.includes('rain') || lower.includes('drizzle')) {
    return { label: '雨天 EXP+10%', expBoost: 0.1, weather: label };
  }
  if (label.includes('晴') || lower.includes('sunny') || lower.includes('clear')) {
    return { label: '晴天 EXP+5%', expBoost: 0.05, weather: label };
  }
  if (label.includes('雪') || lower.includes('snow')) {
    return { label: '雪天 EXP+8%', expBoost: 0.08, weather: label };
  }
  if (
    label.includes('阴')
    || label.includes('云')
    || label.includes('雾')
    || label.includes('霾')
    || lower.includes('cloud')
    || lower.includes('overcast')
    || lower.includes('haze')
    || lower.includes('fog')
    || lower.includes('mist')
  ) {
    return { label: '多云/雾霾 EXP+3%', expBoost: 0.03, weather: label };
  }
  if (label.includes('雷')) {
    return { label: '雷暴 EXP+10%', expBoost: 0.1, weather: label };
  }
  return null;
}
