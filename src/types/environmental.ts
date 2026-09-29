// Types for Real Environmental Data & Geolocation

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  formattedAddress?: string;
  timestamp: number;
}

export type GeolocationStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'error';

export interface WeatherData {
  temperature: number;
  apparentTemperature?: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windDirectionCardinal?: string;
  windCardinal?: string;
  pressure?: number;
  uvIndex?: number;
  weatherCode?: number;
  weatherCondition?: string;
  condition?: string;
  isDay?: boolean;
  timestamp?: string;
  observedAt?: string;
  source: string;
}

export interface AirQualityData {
  usAqi: number;
  europeanAqi?: number;
  pm25: number;
  pm10: number;
  carbonMonoxide?: number;
  nitrogenDioxide?: number;
  sulphurDioxide?: number;
  ozone?: number;
  uvIndex?: number;
  category: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  categoryColor: string;
  categoryBg: string;
  healthAdvisory: string;
  timestamp: string;
  source: string;
}

export interface AQStationMarker {
  id: string;
  locationId?: number | string;
  name: string;
  provider?: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  aqi?: number;
  officialMppcbAqi?: number;
  officialMppcbLabel?: string;
  isMppcbMatched?: boolean;
  pm25?: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
  nh3?: number;
  city?: string;
  state?: string;
  sensors?: { id: number; name: string; parameter: string; units?: string; unit?: string }[];
  pollutantList?: { label?: string; name?: string; parameter?: string; value: number; unit: string; measuredAt?: string; source?: string }[];
  latestMeasurements?: { parameter: string; value: number; unit: string; measured_at: string; source?: string }[];
  dataFreshness?: string;
  measurementTime: string;
  source: string;
  status: string;
}

export interface FireDetectionMarker {
  id: string;
  latitude: number;
  longitude: number;
  detectionTime: string;
  confidence: string;
  satellite: string;
  frp?: number; // Fire Radiative Power (MW)
  brightness?: number; // Kelvin
  source: string;
}

export interface DerivedHotspotMarker {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  severity: 'high' | 'moderate' | 'low';
  explanation: string;
  detectionCount: number;
  sources: string[];
  lastUpdated: string;
}

export interface DataFetchState<T> {
  data: T | null;
  status: 'idle' | 'loading' | 'success' | 'error' | 'unconfigured';
  errorMessage?: string;
  lastUpdated?: Date;
}

