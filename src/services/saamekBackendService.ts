/**
 * SAAMEK Backend Integration Service
 * Communicates with the SAAMEK FastAPI backend for real environmental telemetry,
 * incidents, citizen reports, anomaly triggers, and operational analytics.
 */
import { API_BASE_URL } from '../config/apiConfig';
import type {
  AQStationMarker,
  FireDetectionMarker,
  WeatherData,
  DataFetchState,
} from '../types/environmental';
import type {
  IncidentRecord,
  IncidentStatus,
  IncidentSeverity,
  IncidentConfidence,
  CitizenReportRecord,
  EnvironmentalAnomalyRecord,
  DataSourceHealthRecord,
  AnalyticsSummaryRecord,
} from '../types/incident';

// Helper: converts degrees to cardinal direction
export function getWindCardinal(degrees?: number | null): string {
  if (degrees == null) return 'N/A';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return directions[index] || 'N';
}

// Helper: converts WMO weather code to human-readable condition
export function getWeatherCondition(code?: number | null): string {
  if (code == null) return 'Atmospheric Observation';
  switch (code) {
    case 0: return 'Clear Sky';
    case 1: return 'Mainly Clear';
    case 2: return 'Partly Cloudy';
    case 3: return 'Overcast';
    case 45: case 48: return 'Fog / Haze';
    case 51: case 53: case 55: return 'Drizzle';
    case 61: case 63: case 65: return 'Rain';
    case 71: case 73: case 75: return 'Snow';
    case 80: case 81: case 82: return 'Rain Showers';
    case 95: case 96: case 99: return 'Thunderstorm';
    default: return 'Observed Conditions';
  }
}

// Helper: formats pollutant display name
export function formatPollutantName(param: string): string {
  const p = (param || '').toLowerCase().trim();
  switch (p) {
    case 'pm25': case 'pm2.5': return 'PM2.5';
    case 'pm10': return 'PM10';
    case 'no2': return 'NO2';
    case 'so2': return 'SO2';
    case 'o3': case 'ozone': return 'O3';
    case 'co': return 'CO';
    case 'nh3': return 'NH3';
    case 'no': return 'NO';
    case 'nox': return 'NOx';
    case 'temperature': return 'Temperature';
    case 'relativehumidity': return 'Relative Humidity';
    case 'wind_speed': return 'Wind Speed';
    case 'wind_direction': return 'Wind Direction';
    default: return param ? param.toUpperCase() : 'Unknown';
  }
}

// Helper: formats timestamp nicely
export function formatTimestamp(isoString?: string | null): string {
  if (!isoString) return 'No timestamp';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

// Raw Backend Schemas
interface BackendMeasurement {
  parameter: string;
  value: number;
  unit: string;
  measured_at: string;
  source?: string;
}

interface BackendSensor {
  id: number;
  external_sensor_id: string;
  parameter: string;
  unit: string;
  sensor_name?: string;
  is_active: boolean;
}

interface BackendAQStation {
  id: number;
  external_location_id: string;
  name: string;
  provider: string;
  latitude: number;
  longitude: number;
  city_id: number;
  country: string;
  state?: string;
  is_active: boolean;
  last_seen_at?: string;
  sensors: BackendSensor[];
  latest_measurements: BackendMeasurement[];
}

interface BackendFireDetection {
  id: number;
  external_detection_id: string;
  latitude: number;
  longitude: number;
  detected_at: string;
  satellite: string;
  instrument: string;
  confidence?: string;
  frp?: number;
  source: string;
  raw_data?: Record<string, any>;
  created_at: string;
}

interface BackendWeatherObservation {
  id: number;
  city_id: number;
  latitude: number;
  longitude: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  wind_speed?: number;
  wind_direction?: number;
  weather_code?: number;
  observed_at: string;
  source?: string;
}

// ============================================================================
// 1. INCIDENTS API
// ============================================================================

export async function fetchIncidents(filters?: {
  status?: string;
  severity?: string;
  origin?: string;
}): Promise<IncidentRecord[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status_filter', filters.status);
  if (filters?.severity) params.append('severity_filter', filters.severity);
  if (filters?.origin) params.append('origin_filter', filters.origin);

  const url = `${API_BASE_URL}/api/incidents${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status} fetching incidents`);
  return res.json();
}

export async function fetchIncidentById(incidentId: string): Promise<IncidentRecord> {
  const url = `${API_BASE_URL}/api/incidents/${incidentId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status} fetching incident ${incidentId}`);
  return res.json();
}

export async function updateIncidentStatus(
  incidentId: string,
  newStatus: IncidentStatus,
  notes?: string,
  changedBy: string = 'Government Officer'
): Promise<IncidentRecord> {
  const url = `${API_BASE_URL}/api/incidents/${incidentId}/status`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      new_status: newStatus,
      notes,
      changed_by: changedBy,
    }),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status} updating status`);
  return res.json();
}

export async function createIncident(data: Partial<IncidentRecord>): Promise<IncidentRecord> {
  const url = `${API_BASE_URL}/api/incidents`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status} creating incident`);
  return res.json();
}

// ============================================================================
// 2. CITIZEN REPORTS API
// ============================================================================

export async function submitCitizenReport(data: {
  report_type: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  image_data?: string;
  citizen_name?: string;
  citizen_contact?: string;
}): Promise<CitizenReportRecord> {
  const url = `${API_BASE_URL}/api/citizen-reports`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status} submitting citizen report`);
  return res.json();
}

export async function fetchCitizenReports(statusFilter?: string): Promise<CitizenReportRecord[]> {
  const params = new URLSearchParams();
  if (statusFilter) params.append('status_filter', statusFilter);

  const url = `${API_BASE_URL}/api/citizen-reports${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status} fetching citizen reports`);
  return res.json();
}

export async function fetchCitizenReportDetail(reportId: string): Promise<{
  report: CitizenReportRecord;
  environmental_context: {
    weather: Record<string, any>;
    air_quality: Record<string, any>;
    satellite_fires: any[];
  };
}> {
  const url = `${API_BASE_URL}/api/citizen-reports/${reportId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status} fetching report detail`);
  return res.json();
}

export async function verifyCitizenReport(
  reportId: string,
  action: 'verify' | 'reject' | 'convert_to_incident',
  notes?: string,
  verifiedBy: string = 'Government Officer',
  severity: string = 'medium',
  incidentType?: string
): Promise<{ status: string; action: string; report_id: string; converted_incident_id?: string }> {
  const url = `${API_BASE_URL}/api/citizen-reports/${reportId}/verify`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      notes,
      verified_by: verifiedBy,
      severity,
      incident_type: incidentType,
    }),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status} verifying report`);
  return res.json();
}

// ============================================================================
// 3. ANOMALIES & TEST DEMO API
// ============================================================================

export async function fetchAnomalies(): Promise<EnvironmentalAnomalyRecord[]> {
  const url = `${API_BASE_URL}/api/anomalies`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status} fetching anomalies`);
  return res.json();
}

export async function triggerTestAnomaly(params?: {
  parameter?: string;
  observed_value?: number;
  baseline_value?: number;
  station_name?: string;
}): Promise<EnvironmentalAnomalyRecord> {
  const url = `${API_BASE_URL}/api/anomalies/trigger-test`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params || {}),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status} triggering test anomaly`);
  return res.json();
}

// ============================================================================
// 4. DATA SOURCES & ANALYTICS API
// ============================================================================

export async function fetchDataSourcesHealth(): Promise<DataSourceHealthRecord[]> {
  const url = `${API_BASE_URL}/api/data-sources/health`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status} fetching data sources health`);
  return res.json();
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummaryRecord> {
  const url = `${API_BASE_URL}/api/analytics/summary`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status} fetching analytics summary`);
  return res.json();
}

// ============================================================================
// 5. LIVE ENVIRONMENTAL TELEMETRY (GWALIOR)
// ============================================================================

export async function fetchBackendAQStations(city: string = 'gwalior'): Promise<AQStationMarker[]> {
  const url = `${API_BASE_URL}/api/environment/${city}/aq-stations`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`HTTP ${res.status}: Failed to fetch AQ stations from backend`);
  }
  const data: BackendAQStation[] = await res.json();

  return data.map((st) => {
    const rawMeasurements = st.latest_measurements || [];
    const cleanUnit = (u: string) => (u || '')
      .replace(/g\/m/g, 'µg/m³')
      .replace(/ug\/m3/g, 'µg/m³')
      .replace(/Aµg\/mA3/g, 'µg/m³');

    const pm25Meas = rawMeasurements.find((m) => m.parameter.toLowerCase() === 'pm25');
    const pm10Meas = rawMeasurements.find((m) => m.parameter.toLowerCase() === 'pm10');
    const no2Meas = rawMeasurements.find((m) => m.parameter.toLowerCase() === 'no2');
    const so2Meas = rawMeasurements.find((m) => m.parameter.toLowerCase() === 'so2');
    const coMeas = rawMeasurements.find((m) => m.parameter.toLowerCase() === 'co');
    const o3Meas = rawMeasurements.find((m) => m.parameter.toLowerCase() === 'o3');
    const nh3Meas = rawMeasurements.find((m) => m.parameter.toLowerCase() === 'nh3');

    const pollutantList = rawMeasurements.map((m) => ({
      name: m.parameter.toUpperCase(),
      value: m.value,
      unit: cleanUnit(m.unit),
      parameter: m.parameter,
      measuredAt: m.measured_at,
      source: m.source || 'OpenAQ',
    }));

    const latestTs = rawMeasurements.length > 0
      ? rawMeasurements[0].measured_at
      : st.last_seen_at || new Date().toISOString();

    return {
      id: `backend-${st.id}`,
      name: st.name,
      city: 'Gwalior',
      state: 'Madhya Pradesh',
      latitude: st.latitude,
      longitude: st.longitude,
      pm25: pm25Meas?.value,
      pm10: pm10Meas?.value,
      no2: no2Meas?.value,
      so2: so2Meas?.value,
      co: coMeas?.value,
      o3: o3Meas?.value,
      nh3: nh3Meas?.value,
      measurementTime: latestTs,
      source: 'OpenAQ',
      provider: st.provider || 'CPCB',
      status: st.is_active ? 'Active Monitoring' : 'Offline',
      pollutantList,
      sensors: (st.sensors || []).map((s) => ({
        id: s.id,
        name: s.parameter,
        parameter: s.parameter,
        units: cleanUnit(s.unit || ''),
        unit: cleanUnit(s.unit || ''),
      })),
      latestMeasurements: rawMeasurements.map((m) => ({
        ...m,
        unit: cleanUnit(m.unit),
      })),
    };
  });
}

export async function fetchBackendFires(city: string = 'gwalior'): Promise<FireDetectionMarker[]> {
  const url = `${API_BASE_URL}/api/environment/${city}/fires`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`HTTP ${res.status}: Failed to fetch fire detections from backend`);
  }
  const data: BackendFireDetection[] = await res.json();

  return data.map((f) => ({
    id: `firms-${f.id}`,
    latitude: f.latitude,
    longitude: f.longitude,
    detectionTime: f.detected_at,
    satellite: f.satellite || 'VIIRS NOAA-20',
    confidence: f.confidence || 'nominal',
    frp: f.frp != null ? f.frp : 0,
    source: 'NASA FIRMS',
  }));
}

export async function fetchBackendWeather(city: string = 'gwalior'): Promise<WeatherData> {
  const url = `${API_BASE_URL}/api/environment/${city}/weather`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Failed to fetch weather data from backend`);
  }
  const data: BackendWeatherObservation | null = await res.json();
  if (!data) {
    throw new Error('No weather observation recorded for city');
  }

  const windDeg = data.wind_direction != null ? data.wind_direction : 0;
  const cardinal = getWindCardinal(windDeg);
  const condition = getWeatherCondition(data.weather_code);
  return {
    temperature: data.temperature != null ? data.temperature : 0,
    apparentTemperature: data.temperature != null ? data.temperature : 0,
    humidity: data.humidity != null ? data.humidity : 0,
    windSpeed: data.wind_speed != null ? data.wind_speed : 0,
    windDirection: windDeg,
    windDirectionCardinal: cardinal,
    windCardinal: cardinal,
    pressure: data.pressure != null ? data.pressure : 1013,
    weatherCode: data.weather_code != null ? data.weather_code : 0,
    weatherCondition: condition,
    condition: condition,
    timestamp: data.observed_at,
    observedAt: data.observed_at,
    source: data.source || 'Open-Meteo',
  };
}
