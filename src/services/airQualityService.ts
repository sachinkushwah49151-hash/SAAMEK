// Real Air Quality Service via Open-Meteo Air Quality API
import type { AirQualityData } from '../types/environmental';

/**
 * Determine National Air Quality Category & Health Advisory based on AQI / PM2.5 / PM10
 */
export function evaluateAqiCategory(
  aqi: number,
  pm25: number
): {
  category: AirQualityData['category'];
  categoryColor: string;
  categoryBg: string;
  healthAdvisory: string;
} {
  // Using standard CPCB / EPA AQI categorization
  if (aqi <= 50 || pm25 <= 30) {
    return {
      category: 'Good',
      categoryColor: 'text-emerald-700',
      categoryBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      healthAdvisory: 'Air quality is satisfactory and poses minimal or no health risk.',
    };
  }
  if (aqi <= 100 || pm25 <= 60) {
    return {
      category: 'Satisfactory',
      categoryColor: 'text-lime-700',
      categoryBg: 'bg-lime-50 text-lime-800 border-lime-300',
      healthAdvisory: 'Minor breathing discomfort to sensitive individuals and asthmatics.',
    };
  }
  if (aqi <= 200 || pm25 <= 90) {
    return {
      category: 'Moderate',
      categoryColor: 'text-amber-700',
      categoryBg: 'bg-amber-50 text-amber-900 border-amber-300',
      healthAdvisory: 'Breathing discomfort to people with lung, asthma, and heart conditions upon prolonged exertion.',
    };
  }
  if (aqi <= 300 || pm25 <= 120) {
    return {
      category: 'Poor',
      categoryColor: 'text-orange-700',
      categoryBg: 'bg-orange-50 text-orange-900 border-orange-300',
      healthAdvisory: 'Breathing discomfort to most people on prolonged exposure. Limit strenuous outdoor activities.',
    };
  }
  if (aqi <= 400 || pm25 <= 250) {
    return {
      category: 'Very Poor',
      categoryColor: 'text-red-700',
      categoryBg: 'bg-red-50 text-red-900 border-red-300',
      healthAdvisory: 'Respiratory illness on prolonged exposure. Sensitive groups should remain indoors.',
    };
  }
  return {
    category: 'Severe',
    categoryColor: 'text-rose-800',
    categoryBg: 'bg-rose-100 text-rose-950 border-rose-400',
    healthAdvisory: 'Affects healthy individuals and severely impacts vulnerable populations. Avoid all outdoor activity.',
  };
}

/**
 * Fetch real live air quality telemetry from Open-Meteo Air Quality API
 */
export async function fetchRealAirQualityData(
  latitude: number,
  longitude: number
): Promise<AirQualityData> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,uv_index&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo Air Quality API responded with HTTP status ${response.status}`);
  }

  const json = await response.json();
  const current = json.current;

  if (!current) {
    throw new Error('Open-Meteo response did not contain current air quality telemetry');
  }

  const usAqi = current.us_aqi ?? 0;
  const pm25 = current.pm2_5 != null ? Math.round(current.pm2_5 * 10) / 10 : 0;
  const pm10 = current.pm10 != null ? Math.round(current.pm10 * 10) / 10 : 0;

  const evaluation = evaluateAqiCategory(usAqi, pm25);

  return {
    usAqi,
    europeanAqi: current.european_aqi,
    pm25,
    pm10,
    carbonMonoxide: current.carbon_monoxide != null ? Math.round(current.carbon_monoxide * 10) / 10 : undefined,
    nitrogenDioxide: current.nitrogen_dioxide != null ? Math.round(current.nitrogen_dioxide * 10) / 10 : undefined,
    sulphurDioxide: current.sulphur_dioxide != null ? Math.round(current.sulphur_dioxide * 10) / 10 : undefined,
    ozone: current.ozone != null ? Math.round(current.ozone * 10) / 10 : undefined,
    uvIndex: current.uv_index != null ? Math.round(current.uv_index * 10) / 10 : undefined,
    category: evaluation.category,
    categoryColor: evaluation.categoryColor,
    categoryBg: evaluation.categoryBg,
    healthAdvisory: evaluation.healthAdvisory,
    timestamp: current.time || new Date().toISOString(),
    source: 'Open-Meteo Air Quality',
  };
}
