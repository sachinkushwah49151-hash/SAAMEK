// Real NASA FIRMS Satellite Fire & Thermal Anomaly Detection for City Monitoring
import type { FireDetectionMarker, DataFetchState } from '../types/environmental';
import { ACTIVE_MONITORING_CITY } from '../config/cityConfig';

export async function fetchCitySatelliteFires(
  cityConfig = ACTIVE_MONITORING_CITY
): Promise<DataFetchState<FireDetectionMarker[]>> {
  const apiKey = import.meta.env.VITE_NASA_FIRMS_API_KEY;

  console.groupCollapsed(`[NASA FIRMS] Querying FIRMS Satellite Thermal Anomaly for ${cityConfig.name}`);

  if (!apiKey || apiKey.trim() === '') {
    console.warn('[NASA FIRMS] VITE_NASA_FIRMS_API_KEY is not configured in .env.');
    console.groupEnd();
    return {
      data: [],
      status: 'unconfigured',
      errorMessage: 'Satellite fire telemetry unconfigured. Set VITE_NASA_FIRMS_API_KEY in .env.',
      lastUpdated: new Date(),
    };
  }

  try {
    const { minLongitude, minLatitude, maxLongitude, maxLatitude } = cityConfig.boundingBox;
    const west = minLongitude.toFixed(2);
    const south = minLatitude.toFixed(2);
    const east = maxLongitude.toFixed(2);
    const north = maxLatitude.toFixed(2);

    // Using VIIRS S-NPP Near Real-Time (NRT) 1-day area endpoint restricted to city bounding box
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/${west},${south},${east},${north}/1`;

    console.info(`[NASA FIRMS] Request URL: ${url.replace(apiKey, 'HIDDEN_KEY')}`);

    const response = await fetch(url);
    console.info(`[NASA FIRMS] Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.warn(`[NASA FIRMS Error] HTTP ${response.status}`);
      console.groupEnd();

      if (response.status === 401 || response.status === 403) {
        return {
          data: [],
          status: 'error',
          errorMessage: 'Invalid NASA FIRMS API Key. Please verify VITE_NASA_FIRMS_API_KEY in .env.',
          lastUpdated: new Date(),
        };
      }
      throw new Error(`NASA FIRMS API responded with HTTP status ${response.status}`);
    }

    const csvText = await response.text();
    const lines = csvText.trim().split('\n');

    // Header only or empty result
    if (lines.length <= 1) {
      console.info(`[NASA FIRMS] 0 satellite fire detections in ${cityConfig.name} bounding box during the selected period.`);
      console.groupEnd();
      return {
        data: [],
        status: 'success',
        lastUpdated: new Date(),
      };
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const latIdx = headers.indexOf('latitude');
    const lonIdx = headers.indexOf('longitude');
    const dateIdx = headers.indexOf('acq_date');
    const timeIdx = headers.indexOf('acq_time');
    const satIdx = headers.indexOf('satellite');
    const confIdx = headers.indexOf('confidence');
    const frpIdx = headers.indexOf('frp');
    const brightIdx = headers.indexOf('bright_ti4');

    const markers: FireDetectionMarker[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length < headers.length) continue;

      const fLat = parseFloat(parts[latIdx]);
      const fLon = parseFloat(parts[lonIdx]);

      if (!isNaN(fLat) && !isNaN(fLon)) {
        const timeStr = parts[timeIdx] || '';
        const formattedTime = timeStr.length === 4 ? `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)} UTC` : timeStr;
        const dateStr = parts[dateIdx] || 'Recent';

        markers.push({
          id: `firms-${i}-${fLat.toFixed(3)}-${fLon.toFixed(3)}`,
          latitude: fLat,
          longitude: fLon,
          detectionTime: `${dateStr} ${formattedTime}`,
          confidence: parts[confIdx] || 'Nominal',
          satellite: parts[satIdx] || 'VIIRS / Suomi NPP',
          frp: frpIdx >= 0 ? parseFloat(parts[frpIdx]) : undefined,
          brightness: brightIdx >= 0 ? parseFloat(parts[brightIdx]) : undefined,
          source: 'NASA FIRMS Satellite Telemetry',
        });
      }
    }

    console.info(`[NASA FIRMS] Found ${markers.length} fire detection(s) in ${cityConfig.name}.`);
    console.groupEnd();

    return {
      data: markers,
      status: 'success',
      lastUpdated: new Date(),
    };
  } catch (error: any) {
    console.warn('[NASA FIRMS Exception]:', error);
    console.groupEnd();

    return {
      data: [],
      status: 'error',
      errorMessage: `NASA FIRMS Telemetry Error: ${error.message || 'Network error'}`,
      lastUpdated: new Date(),
    };
  }
}
