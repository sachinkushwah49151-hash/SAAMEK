// Dynamic OpenAQ v3 Ambient Air Quality Discovery Service for City Monitoring
import type { AQStationMarker, DataFetchState } from '../types/environmental';
import { ACTIVE_MONITORING_CITY } from '../config/cityConfig';

export interface OpenAQDiscoveryResult {
  stations: AQStationMarker[];
  rawCount: number;
  city: string;
  sourceStatus: 'connected' | 'error' | 'unconfigured';
  diagnosticMessage: string;
}

/**
 * Dynamically discovers all OpenAQ monitoring locations, sensors, and latest measurements
 * inside the configured city bounding box / radius.
 */
export async function discoverCityAQStations(
  cityConfig = ACTIVE_MONITORING_CITY
): Promise<DataFetchState<AQStationMarker[]>> {
  const apiKey = import.meta.env.VITE_OPENAQ_API_KEY;

  console.groupCollapsed(`[OpenAQ Discovery] Querying OpenAQ API v3 for ${cityConfig.name}`);
  console.info(`[OpenAQ Discovery] Center: [${cityConfig.center.latitude}, ${cityConfig.center.longitude}]`);
  console.info(
    `[OpenAQ Discovery] Bounding Box: [minLon: ${cityConfig.boundingBox.minLongitude}, minLat: ${cityConfig.boundingBox.minLatitude}, maxLon: ${cityConfig.boundingBox.maxLongitude}, maxLat: ${cityConfig.boundingBox.maxLatitude}]`
  );

  if (!apiKey || apiKey.trim() === '') {
    console.warn('[OpenAQ Discovery] VITE_OPENAQ_API_KEY is not set in .env.');
    console.groupEnd();
    return {
      data: [],
      status: 'unconfigured',
      errorMessage: 'OpenAQ API key not configured. Set VITE_OPENAQ_API_KEY in .env.',
      lastUpdated: new Date(),
    };
  }

  // Diagnostic check for OpenAI key format accidentally provided
  if (apiKey.startsWith('sk-proj-') || apiKey.startsWith('sk-')) {
    console.warn(
      `[OpenAQ Discovery Diagnostics] Notice: The configured key appears to be in OpenAI key format ("${apiKey.slice(0, 10)}..."). OpenAQ API v3 uses a dedicated key from explore.openaq.org.`
    );
  }

  try {
    // 1. Discover locations via Bounding Box
    const bboxParam = `${cityConfig.boundingBox.minLongitude},${cityConfig.boundingBox.minLatitude},${cityConfig.boundingBox.maxLongitude},${cityConfig.boundingBox.maxLatitude}`;
    const locationsUrl = `https://api.openaq.org/v3/locations?bbox=${bboxParam}&limit=100`;

    console.info(`[OpenAQ Discovery] Request URL: ${locationsUrl}`);

    const response = await fetch(locationsUrl, {
      headers: {
        'X-API-Key': apiKey.trim(),
        Accept: 'application/json',
      },
    });

    console.info(`[OpenAQ Discovery] Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.detail || errorJson.message || errorText;
      } catch {
        // keep text
      }

      console.warn(`[OpenAQ Discovery Error] HTTP ${response.status}:`, errorDetail);
      console.groupEnd();

      if (response.status === 401 || response.status === 403) {
        return {
          data: [],
          status: 'error',
          errorMessage: `OpenAQ Auth Failed (HTTP ${response.status}): ${errorDetail}. Please check VITE_OPENAQ_API_KEY.`,
          lastUpdated: new Date(),
        };
      }

      return {
        data: [],
        status: 'error',
        errorMessage: `OpenAQ API Error (HTTP ${response.status}): ${errorDetail}`,
        lastUpdated: new Date(),
      };
    }

    const json = await response.json();
    const locations = json.results || [];

    console.info(`[OpenAQ Discovery] Found ${locations.length} location(s) in ${cityConfig.name} bounding box.`);

    if (locations.length === 0) {
      console.groupEnd();
      return {
        data: [],
        status: 'success',
        lastUpdated: new Date(),
      };
    }

    // 2. For each discovered location, query sensors and latest measurements
    const stations: AQStationMarker[] = [];

    for (const loc of locations) {
      let sensors: any[] = [];
      let latestMeasurements: Record<string, { value: number; unit: string; datetime?: string }> = {};

      // Retrieve sensors for this location
      try {
        const sensorsRes = await fetch(`https://api.openaq.org/v3/locations/${loc.id}/sensors`, {
          headers: {
            'X-API-Key': apiKey.trim(),
            Accept: 'application/json',
          },
        });
        if (sensorsRes.ok) {
          const sensorsJson = await sensorsRes.json();
          sensors = sensorsJson.results || [];
        }
      } catch (err) {
        console.warn(`[OpenAQ Discovery] Failed to fetch sensors for location #${loc.id}:`, err);
      }

      // Retrieve latest measurements for this location
      try {
        const latestRes = await fetch(`https://api.openaq.org/v3/locations/${loc.id}/latest`, {
          headers: {
            'X-API-Key': apiKey.trim(),
            Accept: 'application/json',
          },
        });
        if (latestRes.ok) {
          const latestJson = await latestRes.json();
          const measurements = latestJson.results || [];
          for (const m of measurements) {
            const param = (m.parameter?.name || m.parameter || '').toLowerCase();
            if (param) {
              latestMeasurements[param] = {
                value: m.value,
                unit: m.unit || 'µg/m³',
                datetime: m.datetime?.local || m.datetime?.utc,
              };
            }
          }
        }
      } catch (err) {
        console.warn(`[OpenAQ Discovery] Failed to fetch latest measurements for location #${loc.id}:`, err);
      }

      // Check cross-reference with official MPPCB stations
      const locName = (loc.name || '').toLowerCase();
      const matchedRef = cityConfig.referenceStations.find((ref) =>
        ref.aliasKeywords.some((kw) => locName.includes(kw.toLowerCase()))
      );

      const lat = loc.coordinates?.latitude ?? cityConfig.center.latitude;
      const lon = loc.coordinates?.longitude ?? cityConfig.center.longitude;

      // Extract specific pollutants if present in latest readings
      const pm25 = latestMeasurements['pm25']?.value;
      const pm10 = latestMeasurements['pm10']?.value;
      const no2 = latestMeasurements['no2']?.value;
      const so2 = latestMeasurements['so2']?.value;
      const co = latestMeasurements['co']?.value;
      const o3 = latestMeasurements['o3']?.value || latestMeasurements['ozone']?.value;
      const nh3 = latestMeasurements['nh3']?.value;

      const pollutantList: { label: string; value: number; unit: string }[] = [];
      if (pm25 != null) pollutantList.push({ label: 'PM2.5', value: pm25, unit: latestMeasurements['pm25'].unit });
      if (pm10 != null) pollutantList.push({ label: 'PM10', value: pm10, unit: latestMeasurements['pm10'].unit });
      if (no2 != null) pollutantList.push({ label: 'NO₂', value: no2, unit: latestMeasurements['no2'].unit });
      if (so2 != null) pollutantList.push({ label: 'SO₂', value: so2, unit: latestMeasurements['so2'].unit });
      if (co != null) pollutantList.push({ label: 'CO', value: co, unit: latestMeasurements['co'].unit });
      if (o3 != null) pollutantList.push({ label: 'Ozone (O₃)', value: o3, unit: (latestMeasurements['o3'] || latestMeasurements['ozone']).unit });
      if (nh3 != null) pollutantList.push({ label: 'NH₃', value: nh3, unit: latestMeasurements['nh3'].unit });

      stations.push({
        id: `openaq-${loc.id}`,
        locationId: loc.id,
        name: loc.name || `Monitoring Station #${loc.id}`,
        provider: loc.provider?.name || loc.owner?.name || 'CPCB / MPPCB CAAQMS',
        latitude: lat,
        longitude: lon,
        distanceKm: loc.distance != null ? Math.round((loc.distance / 1000) * 10) / 10 : undefined,
        pm25,
        pm10,
        no2,
        so2,
        co,
        o3,
        nh3,
        sensors: sensors.map((s: any) => ({
          id: s.id,
          name: s.name || s.parameter?.name,
          parameter: s.parameter?.name || '',
          units: s.parameter?.units || 'µg/m³',
        })),
        pollutantList,
        isMppcbMatched: Boolean(matchedRef),
        officialMppcbLabel: matchedRef ? matchedRef.name : undefined,
        measurementTime: loc.datetimeLast?.local || loc.datetimeLast?.utc || new Date().toISOString(),
        source: 'OpenAQ Environmental Network',
        status: 'Operational Station',
      });
    }

    console.info(`[OpenAQ Discovery] Successfully processed ${stations.length} station marker(s).`);
    console.groupEnd();

    return {
      data: stations,
      status: 'success',
      lastUpdated: new Date(),
    };
  } catch (error: any) {
    const isLikelyInvalidKey =
      error.message?.includes('Failed to fetch') ||
      error.name === 'TypeError' ||
      apiKey.startsWith('sk-');

    console.warn('[OpenAQ Discovery Diagnostics]:', {
      error: error.message,
      name: error.name,
      configuredKeyPrefix: apiKey ? apiKey.slice(0, 10) + '...' : 'none',
      isLikelyOpenAIKey: apiKey.startsWith('sk-proj-') || apiKey.startsWith('sk-'),
      diagnosis:
        'OpenAQ API v3 CloudFront gateway rejects invalid keys with HTTP 401 Unauthorized. Browsers report this as "Failed to fetch" due to omitted CORS headers on CloudFront 401 responses. A valid OpenAQ key from explore.openaq.org is required.',
    });
    console.groupEnd();

    return {
      data: [],
      status: 'error',
      errorMessage: isLikelyInvalidKey
        ? `OpenAQ Auth Error: HTTP 401 Unauthorized / CORS. The configured key in .env ("${apiKey.slice(0, 10)}...") is an OpenAI format key, not an OpenAQ API v3 key.`
        : `OpenAQ Network Error: ${error.message || 'Unable to connect to OpenAQ API'}`,
      lastUpdated: new Date(),
    };
  }
}

