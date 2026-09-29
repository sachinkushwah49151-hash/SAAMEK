// Real NASA FIRMS Satellite Fire / Thermal Detections Service
import type { FireDetectionMarker, DataFetchState } from '../types/environmental';

export async function fetchRealSatelliteFires(
  latitude: number,
  longitude: number
): Promise<DataFetchState<FireDetectionMarker[]>> {
  const apiKey = import.meta.env.VITE_NASA_FIRMS_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return {
      data: [],
      status: 'unconfigured',
      errorMessage: 'Satellite fire telemetry feed unconfigured. Set VITE_NASA_FIRMS_API_KEY in .env to enable NASA FIRMS satellite detection feeds.',
      lastUpdated: new Date(),
    };
  }

  try {
    // Calculate bounding box: ~1.5 degrees (~150km) around user location
    const delta = 1.5;
    const west = (longitude - delta).toFixed(2);
    const south = (latitude - delta).toFixed(2);
    const east = (longitude + delta).toFixed(2);
    const north = (latitude + delta).toFixed(2);

    // Using VIIRS S-NPP Near Real-Time (NRT) 1-day area endpoint
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/${west},${south},${east},${north}/1`;

    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return {
          data: [],
          status: 'error',
          errorMessage: 'Invalid NASA FIRMS API Key provided. Please verify VITE_NASA_FIRMS_API_KEY in .env.',
          lastUpdated: new Date(),
        };
      }
      throw new Error(`NASA FIRMS API responded with HTTP status ${response.status}`);
    }

    const csvText = await response.text();
    const lines = csvText.trim().split('\n');

    if (lines.length <= 1) {
      // Header only or empty result
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

    return {
      data: markers,
      status: 'success',
      lastUpdated: new Date(),
    };
  } catch (error: any) {
    return {
      data: [],
      status: 'error',
      errorMessage: `Failed to fetch satellite thermal telemetry: ${error.message || 'Network error'}`,
      lastUpdated: new Date(),
    };
  }
}
