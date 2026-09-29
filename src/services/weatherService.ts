// Real Weather Data Service via Open-Meteo API
import type { WeatherData } from '../types/environmental';

/**
 * Maps WMO weather code to standard descriptive condition
 */
export function getWmoWeatherCondition(code: number): string {
  switch (code) {
    case 0:
      return 'Clear Sky';
    case 1:
      return 'Mainly Clear';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Overcast';
    case 45:
    case 48:
      return 'Fog & Depositing Rime Fog';
    case 51:
    case 53:
    case 55:
      return 'Drizzle (Light to Dense)';
    case 56:
    case 57:
      return 'Freezing Drizzle';
    case 61:
      return 'Slight Rain';
    case 63:
      return 'Moderate Rain';
    case 65:
      return 'Heavy Rain';
    case 66:
    case 67:
      return 'Freezing Rain';
    case 71:
    case 73:
    case 75:
      return 'Snow Fall';
    case 77:
      return 'Snow Grains';
    case 80:
    case 81:
    case 82:
      return 'Rain Showers';
    case 85:
    case 86:
      return 'Snow Showers';
    case 95:
      return 'Thunderstorm';
    case 96:
    case 99:
      return 'Thunderstorm with Hail';
    default:
      return 'Atmospheric Conditions';
  }
}

/**
 * Converts degree angle (0-360) to 8-point compass cardinal
 */
export function getWindCardinalDirection(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

/**
 * Fetch real live weather parameters from Open-Meteo for coordinates
 */
export async function fetchRealWeatherData(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo Weather API responded with HTTP status ${response.status}`);
  }

  const json = await response.json();
  const current = json.current;

  if (!current) {
    throw new Error('Open-Meteo response did not contain current weather data');
  }

  const windDeg = current.wind_direction_10m ?? 0;
  const windCardinal = getWindCardinalDirection(windDeg);
  const weatherCode = current.weather_code ?? 0;
  const weatherCondition = getWmoWeatherCondition(weatherCode);

  return {
    temperature: Math.round(current.temperature_2m * 10) / 10,
    apparentTemperature: Math.round((current.apparent_temperature ?? current.temperature_2m) * 10) / 10,
    humidity: Math.round(current.relative_humidity_2m ?? 0),
    windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
    windDirection: windDeg,
    windDirectionCardinal: windCardinal,
    pressure: Math.round(current.surface_pressure ?? 1013),
    uvIndex: 0, // UV Index is fetched in Air Quality endpoint or 0 at night
    weatherCode,
    weatherCondition,
    isDay: Boolean(current.is_day),
    timestamp: current.time || new Date().toISOString(),
    source: 'Open-Meteo',
  };
}
