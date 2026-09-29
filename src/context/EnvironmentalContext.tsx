import React, { useState, useEffect, useCallback } from 'react';
import type {
  UserCoordinates,
  GeolocationStatus,
  WeatherData,
  AirQualityData,
  AQStationMarker,
  FireDetectionMarker,
  DataFetchState,
} from '../types/environmental';
import { EnvironmentalContext } from './environmentalContextDef';
import { reverseGeocode } from '../services/geocodingService';
import { fetchRealWeatherData } from '../services/weatherService';
import { fetchRealAirQualityData } from '../services/airQualityService';
import { fetchRealAQStations } from '../services/stationService';
import { fetchRealSatelliteFires } from '../services/fireService';

// Default national capital coordinates used purely as fallback if user has not yet permitted geolocation
const FALLBACK_DEFAULT_COORDS = {
  latitude: 28.6139,
  longitude: 77.2090,
  accuracy: 1000,
  locality: 'National Capital Region',
  city: 'New Delhi',
  state: 'Delhi',
  country: 'India',
  formattedAddress: 'National Capital Region, New Delhi, India',
};

export const EnvironmentalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<UserCoordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<GeolocationStatus>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isFallbackLocation, setIsFallbackLocation] = useState(false);

  const [weather, setWeather] = useState<DataFetchState<WeatherData>>({
    data: null,
    status: 'idle',
  });
  const [airQuality, setAirQuality] = useState<DataFetchState<AirQualityData>>({
    data: null,
    status: 'idle',
  });
  const [stations, setStations] = useState<DataFetchState<AQStationMarker[]>>({
    data: null,
    status: 'idle',
  });
  const [fires, setFires] = useState<DataFetchState<FireDetectionMarker[]>>({
    data: null,
    status: 'idle',
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  // Fetch all environmental data for given coordinates
  const fetchAllTelemetry = useCallback(async (lat: number, lon: number) => {
    setIsRefreshing(true);

    // 1. Weather
    setWeather((prev) => ({ ...prev, status: 'loading' }));
    fetchRealWeatherData(lat, lon)
      .then((data) => {
        setWeather({
          data,
          status: 'success',
          lastUpdated: new Date(),
        });
      })
      .catch((err) => {
        setWeather({
          data: null,
          status: 'error',
          errorMessage: err.message || 'Weather telemetry temporarily unavailable',
          lastUpdated: new Date(),
        });
      });

    // 2. Air Quality
    setAirQuality((prev) => ({ ...prev, status: 'loading' }));
    fetchRealAirQualityData(lat, lon)
      .then((data) => {
        setAirQuality({
          data,
          status: 'success',
          lastUpdated: new Date(),
        });
      })
      .catch((err) => {
        setAirQuality({
          data: null,
          status: 'error',
          errorMessage: err.message || 'Air quality telemetry unavailable',
          lastUpdated: new Date(),
        });
      });

    // 3. Ambient Stations
    setStations((prev) => ({ ...prev, status: 'loading' }));
    fetchRealAQStations(lat, lon)
      .then((res) => {
        setStations(res);
      })
      .catch((err) => {
        setStations({
          data: [],
          status: 'error',
          errorMessage: err.message || 'Station feed unavailable',
          lastUpdated: new Date(),
        });
      });

    // 4. Satellite Fires (NASA FIRMS)
    setFires((prev) => ({ ...prev, status: 'loading' }));
    fetchRealSatelliteFires(lat, lon)
      .then((res) => {
        setFires(res);
      })
      .catch((err) => {
        setFires({
          data: [],
          status: 'error',
          errorMessage: err.message || 'Satellite fire telemetry unavailable',
          lastUpdated: new Date(),
        });
      });

    setLastRefreshedAt(new Date());
    setIsRefreshing(false);
  }, []);

  // Browser Geolocation trigger
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Geolocation is not supported by your browser.');
      setIsFallbackLocation(true);
      fetchAllTelemetry(FALLBACK_DEFAULT_COORDS.latitude, FALLBACK_DEFAULT_COORDS.longitude);
      return;
    }

    setLocationStatus('requesting');
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLocationStatus('granted');
        setIsFallbackLocation(false);

        // Reverse geocode to get real locality/area
        let geoInfo = {
          locality: 'Local Area',
          city: 'City',
          state: '',
          country: 'India',
          formattedAddress: `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`,
        };

        try {
          const rev = await reverseGeocode(latitude, longitude);
          geoInfo = rev;
        } catch {
          // ignore reverse geocoding error
        }

        const userLoc: UserCoordinates = {
          latitude,
          longitude,
          accuracy,
          locality: geoInfo.locality,
          city: geoInfo.city,
          state: geoInfo.state,
          country: geoInfo.country,
          formattedAddress: geoInfo.formattedAddress,
          timestamp: pos.timestamp || Date.now(),
        };

        setLocation(userLoc);
        fetchAllTelemetry(latitude, longitude);
      },
      (err) => {
        console.warn('Geolocation permission error or timeout:', err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('denied');
          setLocationError('Location access is required to provide area-specific environmental conditions.');
        } else {
          setLocationStatus('error');
          setLocationError(`Location request failed: ${err.message}`);
        }
        setIsFallbackLocation(true);
        // Fallback default coordinates so the rest of the application remains functional
        setLocation({
          ...FALLBACK_DEFAULT_COORDS,
          timestamp: Date.now(),
        });
        fetchAllTelemetry(FALLBACK_DEFAULT_COORDS.latitude, FALLBACK_DEFAULT_COORDS.longitude);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  }, [fetchAllTelemetry]);

  // Request location asynchronously upon mount
  useEffect(() => {
    const timer = setTimeout(() => {
      requestLocation();
    }, 0);
    return () => clearTimeout(timer);
  }, [requestLocation]);

  // Refresh handler
  const refreshData = async () => {
    const lat = location?.latitude ?? FALLBACK_DEFAULT_COORDS.latitude;
    const lon = location?.longitude ?? FALLBACK_DEFAULT_COORDS.longitude;
    await fetchAllTelemetry(lat, lon);
  };

  // Human-readable "Updated X min ago"
  const [timeAgoText, setTimeAgoText] = useState('Updated just now');

  useEffect(() => {
    const updateLabel = () => {
      if (!lastRefreshedAt) {
        setTimeAgoText('Live data');
        return;
      }
      const diffSecs = Math.floor((Date.now() - lastRefreshedAt.getTime()) / 1000);
      if (diffSecs < 10) {
        setTimeAgoText('Updated just now');
      } else if (diffSecs < 60) {
        setTimeAgoText(`Updated ${diffSecs}s ago`);
      } else if (diffSecs < 3600) {
        const mins = Math.floor(diffSecs / 60);
        setTimeAgoText(`Updated ${mins} min${mins > 1 ? 's' : ''} ago`);
      } else {
        setTimeAgoText(
          `Updated at ${lastRefreshedAt.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}`
        );
      }
    };

    updateLabel();
    const interval = setInterval(updateLabel, 15000);
    return () => clearInterval(interval);
  }, [lastRefreshedAt]);

  return (
    <EnvironmentalContext.Provider
      value={{
        location,
        locationStatus,
        locationError,
        requestLocation,
        isFallbackLocation,
        weather,
        airQuality,
        stations,
        fires,
        isRefreshing,
        refreshData,
        lastUpdatedTimeText: timeAgoText,
      }}
    >
      {children}
    </EnvironmentalContext.Provider>
  );
};
