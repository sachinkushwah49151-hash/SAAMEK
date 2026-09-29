import { createContext } from 'react';
import type {
  UserCoordinates,
  GeolocationStatus,
  WeatherData,
  AirQualityData,
  AQStationMarker,
  FireDetectionMarker,
  DataFetchState,
} from '../types/environmental';

export interface EnvironmentalContextValue {
  // Geolocation
  location: UserCoordinates | null;
  locationStatus: GeolocationStatus;
  locationError: string | null;
  requestLocation: () => void;
  isFallbackLocation: boolean;

  // Real Environmental Telemetry
  weather: DataFetchState<WeatherData>;
  airQuality: DataFetchState<AirQualityData>;
  stations: DataFetchState<AQStationMarker[]>;
  fires: DataFetchState<FireDetectionMarker[]>;

  // Controls & Timestamps
  isRefreshing: boolean;
  refreshData: () => Promise<void>;
  lastUpdatedTimeText: string;
}

export const EnvironmentalContext = createContext<EnvironmentalContextValue | undefined>(undefined);
