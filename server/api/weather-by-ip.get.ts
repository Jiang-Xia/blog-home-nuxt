/**
 * GET /api/weather-by-ip
 *
 * 试验接口：请求 IP（或 query 覆盖）→ ip-api 定位 → Open-Meteo 当前天气。
 * Query：
 * - ip：强制指定公网 IP（本地调试常用，如 ?ip=1.1.1.1）
 * - city：跳过 IP 定位，按城市名 Geocoding（如 ?city=上海）
 * - lat & lon：直接指定坐标，跳过定位
 *
 * 本地/私网 IP 无法定位时回退北京，并标记 fallback: true。
 * 数据来源见 server/utils/weather-by-ip.ts；不替代 blog-server /rpg/weather-buff。
 */
import {
  FALLBACK_GEO,
  fetchOpenMeteoWeather,
  isPrivateOrLocalIp,
  lookupGeoByCity,
  lookupGeoByIp,
  mapWeatherToBuff,
  resolveClientIp,
  type GeoLocation,
} from '../utils/weather-by-ip';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const queryIp = typeof query.ip === 'string' ? query.ip : undefined;
  const queryCity = typeof query.city === 'string' ? query.city.trim() : '';
  const queryLat = typeof query.lat === 'string' ? Number(query.lat) : Number.NaN;
  const queryLon = typeof query.lon === 'string' ? Number(query.lon) : Number.NaN;

  const clientIp = resolveClientIp(event, queryIp);
  let geo: GeoLocation;
  let fallback = false;

  try {
    // 1) 显式坐标优先
    if (Number.isFinite(queryLat) && Number.isFinite(queryLon)) {
      geo = {
        ip: clientIp,
        city: queryCity || '',
        region: '',
        country: '',
        lat: queryLat,
        lon: queryLon,
        source: 'fallback',
      };
    }
    // 2) 城市名 Geocoding
    else if (queryCity) {
      geo = await lookupGeoByCity(queryCity);
      geo.ip = clientIp;
    }
    // 3) 私网 / 本机 → 北京兜底
    else if (isPrivateOrLocalIp(clientIp)) {
      geo = { ...FALLBACK_GEO, ip: clientIp };
      fallback = true;
    }
    // 4) 公网 IP → ip-api
    else {
      geo = await lookupGeoByIp(clientIp);
    }

    const weather = await fetchOpenMeteoWeather(geo.lat, geo.lon);
    const buff = mapWeatherToBuff(weather.label);

    return {
      ip: geo.ip || clientIp,
      geo: {
        city: geo.city,
        region: geo.region,
        country: geo.country,
        lat: geo.lat,
        lon: geo.lon,
        source: geo.source,
      },
      weather,
      buff,
      fallback,
    };
  }
  catch (err: unknown) {
    // 已是 createError 则原样抛出；其它上游异常统一 502
    if (err && typeof err === 'object' && 'statusCode' in err) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'weather-by-ip 上游请求失败';
    throw createError({
      statusCode: 502,
      statusMessage: message,
    });
  }
});
