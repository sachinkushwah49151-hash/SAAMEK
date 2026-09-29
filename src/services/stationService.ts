// Real Environmental Air Quality Stations Service
import type { AQStationMarker, DataFetchState } from '../types/environmental';

export async function fetchRealAQStations(
  latitude: number,
  longitude: number,
  radiusMeters = 50000
): Promise<DataFetchState<AQStationMarker[]>> {
  const apiKey = import.meta.env.VITE_OPENAQ_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return {
      data: [],
      status: 'unconfigured',
      errorMessage: 'Monitoring station telemetry feed unconfigured. Set VITE_OPENAQ_API_KEY in .env to enable OpenAQ station feeds.',
      lastUpdated: new Date(),
    };
  }

  try {
    const url = `https://api.openaq.org/v3/locations?coordinates=${latitude},${longitude}&radius=${radiusMeters}&limit=20`;
    const response = await fetch(url, {
      headers: {
        'X-API-Key': apiKey,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return {
          data: [],
          status: 'error',
          errorMessage: 'Invalid OpenAQ API Key provided. Please verify VITE_OPENAQ_API_KEY.',
          lastUpdated: new Date(),
        };
      }
      throw new Error(`OpenAQ responded with HTTP ${response.status}`);
    }

    const json = await response.json();
    const results = json.results || [];

    const stations: AQStationMarker[] = results.map((item: any, idx: number) => {
      const coords = item.coordinates || { latitude, longitude };
      return {
        id: item.id ? String(item.id) : `station-${idx}`,
        name: item.name || `Station #${item.id || idx + 1}`,
        latitude: coords.latitude,
        longitude: coords.longitude,
        distanceKm: item.distance != null ? Math.round((item.distance / 1000) * 10) / 10 : undefined,
        measurementTime: item.datetimeLast?.local || item.datetimeLast?.utc || new Date().toISOString(),
        source: 'OpenAQ Environmental Network',
        status: 'Operational Station',
      };
    });

    return {
      data: stations,
      status: 'success',
      lastUpdated: new Date(),
    };
  } catch (error: any) {
    return {
      data: [],
      status: 'error',
      errorMessage: `Failed to load ambient station telemetry: ${error.message || 'Network error'}`,
      lastUpdated: new Date(),
    };
  }
}
