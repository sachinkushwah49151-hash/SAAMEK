import React from 'react';
import type { TranslationStrings } from '../i18n/translations';
import { useEnvironmentalData } from '../context/useEnvironmentalData';
import {
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  ShieldCheck,
  FilePlus,
  Map,
  Activity,
  Trees,
  Gauge,
  Radio,
  Sparkles,
  RefreshCw,
  Sun,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudFog,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface OverviewViewProps {
  t: TranslationStrings;
  onNavigateToReport: () => void;
  onNavigateToMap: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  t,
  onNavigateToReport,
  onNavigateToMap,
}) => {
  const {
    location,
    locationStatus,
    requestLocation,
    weather,
    airQuality,
    refreshData,
    isRefreshing,
    lastUpdatedTimeText,
  } = useEnvironmentalData();

  const weatherData = weather.data;
  const aqiData = airQuality.data;

  // Weather Icon helper
  const getWeatherIcon = (code: number, isDay = true) => {
    if (code === 0 || code === 1) {
      return isDay ? <Sun className="w-16 h-16 text-amber-400 animate-pulse" /> : <Sun className="w-16 h-16 text-sky-200" />;
    }
    if (code === 2 || code === 3) {
      return <CloudSun className="w-16 h-16 text-amber-200" />;
    }
    if (code >= 45 && code <= 48) {
      return <CloudFog className="w-16 h-16 text-slate-300" />;
    }
    if (code >= 51 && code <= 82) {
      return <CloudRain className="w-16 h-16 text-sky-300" />;
    }
    if (code >= 95) {
      return <CloudLightning className="w-16 h-16 text-amber-400" />;
    }
    return <CloudSun className="w-16 h-16 text-amber-200" />;
  };

  return (
    <div className="space-y-6">
      {/* Location Permission Notification Banner (if denied) */}
      {locationStatus === 'denied' && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-950 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base">Location Access Required</div>
              <div className="text-xs sm:text-sm text-amber-900 mt-0.5">
                Location access is required to provide area-specific environmental conditions. Currently showing regional fallback telemetry.
              </div>
            </div>
          </div>
          <button
            onClick={requestLocation}
            className="bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex-shrink-0"
          >
            Allow Location
          </button>
        </div>
      )}

      {/* =========================================================================
          1. ATMOSPHERIC CLIMATE & WEATHER STATUS HERO (REAL DATA POWERED)
          ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0c2340] via-[#003366] to-[#0a2544] text-white rounded-2xl shadow-md border border-slate-700/50">
        {/* Subtle Ambient Background Landscape Silhouette & Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
          <svg
            viewBox="0 0 1200 400"
            className="w-full h-full object-cover"
            preserveAspectRatio="none"
            fill="none"
          >
            <circle cx="950" cy="110" r="140" fill="url(#sunGlowHero)" />
            <path
              d="M0 340 Q250 210 550 280 T1050 220 L1200 290 L1200 400 L0 400 Z"
              fill="#ffffff"
              opacity="0.25"
            />
            <path
              d="M0 370 Q180 290 420 330 T850 310 T1200 350 L1200 400 L0 400 Z"
              fill="#ffffff"
              opacity="0.35"
            />
            <defs>
              <radialGradient id="sunGlowHero" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-9 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Location-Aware Environmental Overview Details */}
          <div className="space-y-4 max-w-2xl">
            {/* Official Station & Status Pills */}
            <div className="flex flex-wrap items-center gap-3">
              {locationStatus === 'granted' && location ? (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 backdrop-blur-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Location detected: {location.locality || location.city}
                </span>
              ) : locationStatus === 'requesting' ? (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-sky-500/25 text-sky-200 border border-sky-400/40 backdrop-blur-md">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Detecting your location...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-amber-500/25 text-amber-200 border border-amber-400/40 backdrop-blur-md">
                  <MapPin className="w-3.5 h-3.5" />
                  Regional Grid (Location Permitted)
                </span>
              )}

              <span className="text-xs sm:text-sm text-slate-200 font-medium flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-sky-400" />
                {location?.formattedAddress || 'National Ambient Monitoring Grid'}
              </span>
            </div>

            {/* LEVEL 1 — PAGE TITLE */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-sky-300">
                Environmental conditions near you
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-4.5xl font-bold tracking-tight text-white font-serif leading-tight mt-1">
                {location?.locality || location?.city || t.overviewHeading}
              </h1>
              {/* LEVEL 5 — BODY SUBTITLE */}
              <p className="text-base sm:text-lg text-slate-200/95 leading-relaxed mt-2 font-normal">
                {t.overviewSubtitle}
              </p>
            </div>

            {/* MAIN REAL WEATHER CONDITION & TEMPERATURE */}
            {weather.status === 'loading' && !weatherData ? (
              <div className="py-4 space-y-2">
                <div className="h-16 w-48 bg-white/10 animate-pulse rounded-xl" />
                <span className="text-xs text-sky-200">Loading live weather data from Open-Meteo...</span>
              </div>
            ) : weather.status === 'error' && !weatherData ? (
              <div className="py-3 px-4 bg-red-900/40 border border-red-500/40 rounded-xl text-red-200 text-xs sm:text-sm">
                Weather: Temporarily unavailable ({weather.errorMessage || 'Data source offline'})
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
                <div className="flex items-baseline space-x-2">
                  {/* LEVEL 3 Key Data Value - Massive Real Temperature */}
                  <span className="text-6xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tighter text-white">
                    {weatherData?.temperature ?? '--'}°
                  </span>
                  <span className="text-3xl sm:text-4xl text-sky-200 font-bold">C</span>
                </div>

                <div className="space-y-1">
                  {/* Weather Condition Label */}
                  <div className="text-xl sm:text-2xl font-bold text-sky-100 tracking-wide">
                    {weatherData?.weatherCondition || 'Atmospheric Monitoring'}
                  </div>
                  <div className="text-sm sm:text-base text-slate-200 flex items-center gap-3.5">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Thermometer className="w-4 h-4 text-amber-300" />
                      Feels like <strong className="text-white font-mono text-base sm:text-lg">{weatherData?.apparentTemperature ?? '--'}°C</strong>
                    </span>
                    <span>•</span>
                    <span>Source: <strong className="text-sky-200 font-medium">Open-Meteo</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Actions & Live Refresh Trigger */}
            <div className="flex flex-wrap items-center gap-3.5 pt-3">
              <button
                onClick={onNavigateToReport}
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm sm:text-base py-3 px-6 rounded-xl shadow-md transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <FilePlus className="w-5 h-5 text-slate-950" />
                <span>{t.tabReport}</span>
              </button>
              <button
                onClick={onNavigateToMap}
                className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold text-sm sm:text-base py-3 px-6 rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-xs"
              >
                <Map className="w-5 h-5 text-sky-300" />
                <span>{t.tabMap}</span>
              </button>
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/15 text-slate-200 border border-white/20 text-xs sm:text-sm py-3 px-4 rounded-xl backdrop-blur-md transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
                <span>{lastUpdatedTimeText}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Real Atmospheric Metrics Strip inside Hero */}
          <div className="lg:w-88 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-inner">
            {/* Visual Weather Scene Icon */}
            <div className="relative w-48 h-28 flex items-center justify-center">
              {weatherData ? (
                getWeatherIcon(weatherData.weatherCode ?? 0, weatherData.isDay ?? true)
              ) : (
                <Sun className="w-16 h-16 text-amber-400 animate-pulse" />
              )}
            </div>

            {/* Atmospheric Metrics Strip inside Hero */}
            <div className="w-full grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/20 text-xs sm:text-sm">
              <div className="flex items-center space-x-2.5 text-slate-200">
                <Wind className="w-5 h-5 text-sky-300 flex-shrink-0" />
                <div>
                  <span style={{ fontWeight: 500, fontSize: '0.85rem', color: '#2d4a2d' }} className="block">Wind Speed</span>
                  <span className="font-bold font-mono text-base sm:text-lg text-white">
                    {weatherData ? `${weatherData.windSpeed} km/h ${weatherData.windDirectionCardinal}` : '--'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 text-slate-200">
                <Droplets className="w-5 h-5 text-blue-300 flex-shrink-0" />
                <div>
                  <span style={{ fontWeight: 500, fontSize: '0.85rem', color: '#2d4a2d' }} className="block">Humidity</span>
                  <span className="font-bold font-mono text-base sm:text-lg text-white">
                    {weatherData ? `${weatherData.humidity}%` : '--'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 text-slate-200 mt-1">
                <Gauge className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                <div>
                  <span style={{ fontWeight: 500, fontSize: '0.85rem', color: '#2d4a2d' }} className="block">Pressure</span>
                  <span className="font-bold font-mono text-base sm:text-lg text-white">
                    {weatherData ? `${weatherData.pressure} hPa` : '--'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 text-slate-200 mt-1">
                <Sparkles className="w-5 h-5 text-amber-300 flex-shrink-0" />
                <div>
                  <span style={{ fontWeight: 500, fontSize: '0.85rem', color: '#2d4a2d' }} className="block">Telemetry Source</span>
                  <span className="font-bold text-xs sm:text-sm text-sky-200">Open-Meteo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. ENVIRONMENTAL INTELLIGENCE: REAL AQI GAUGE & PARTICULATE BREAKDOWN
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Real Air Quality Gauge & Particulates (7 of 12 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-6 flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/70">
                  <Trees className="w-6 h-6" />
                </div>
                <div>
                  {/* LEVEL 2 — MAJOR SECTION HEADING */}
                  <h2 style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1a2e1a' }} className="leading-tight">
                    {t.aqiLabel} — Air Quality Index
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Air Quality · Live data · Source: <strong>Open-Meteo Air Quality</strong>
                  </p>
                </div>
              </div>

              {aqiData ? (
                <span className={`text-sm sm:text-base font-bold px-3.5 py-1 rounded-full border ${aqiData.categoryBg}`}>
                  {aqiData.category}
                </span>
              ) : airQuality.status === 'loading' ? (
                <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full animate-pulse">
                  Loading...
                </span>
              ) : (
                <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                  Unavailable
                </span>
              )}
            </div>

            {/* Error or Loading Banner */}
            {airQuality.status === 'loading' && !aqiData ? (
              <div className="my-8 p-6 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
                <RefreshCw className="w-7 h-7 text-sky-600 animate-spin mx-auto" />
                <div className="text-sm font-bold text-slate-700">Loading air quality telemetry...</div>
                <div className="text-xs text-slate-500">Retrieving PM2.5, PM10, and atmospheric pollutants from Open-Meteo</div>
              </div>
            ) : airQuality.status === 'error' && !aqiData ? (
              <div className="my-8 p-6 text-center space-y-2 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
                <AlertTriangle className="w-7 h-7 text-amber-600 mx-auto" />
                <div className="text-base font-bold">Air quality data unavailable for this location</div>
                <div className="text-xs text-amber-800">{airQuality.errorMessage || 'Unable to connect to air quality telemetry source'}</div>
              </div>
            ) : (
              <>
                {/* Gauge & Main Score Visualization Area */}
                <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6 px-2">
                  {/* Semi-Circular Segmented Visual Gauge */}
                  <div className="relative w-64 h-32 flex items-end justify-center flex-shrink-0">
                    <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
                      {/* Background Track */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="16"
                        strokeLinecap="round"
                      />
                      {/* Colored Segments */}
                      <path d="M 20 100 A 80 80 0 0 1 45 45" fill="none" stroke="#10b981" strokeWidth="16" />
                      <path d="M 45 45 A 80 80 0 0 1 85 22" fill="none" stroke="#84cc16" strokeWidth="16" />
                      <path d="M 85 22 A 80 80 0 0 1 140 32" fill="none" stroke="#f59e0b" strokeWidth="16" />
                      <path d="M 140 32 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="16" strokeLinecap="round" />

                      {/* Indicator Needle positioned based on real AQI */}
                      {(() => {
                        const aqiScore = aqiData?.usAqi ?? 50;
                        const angle = Math.min(Math.max((aqiScore / 300) * 180, 10), 170);
                        const rad = (Math.PI * (180 - angle)) / 180;
                        const nx = 100 + 60 * Math.cos(rad);
                        const ny = 100 - 60 * Math.sin(rad);
                        return (
                          <>
                            <circle cx="100" cy="100" r="7.5" fill="#003366" />
                            <line
                              x1="100"
                              y1="100"
                              x2={nx}
                              y2={ny}
                              stroke="#003366"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                          </>
                        );
                      })()}
                    </svg>

                    {/* Score Number inside Gauge */}
                    <div className="absolute bottom-0 text-center">
                      <span className="text-5xl sm:text-6xl font-black text-amber-600 font-mono tracking-tight leading-none block">
                        {aqiData?.usAqi ?? '--'}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-0.5 block">
                        US AQI Score
                      </span>
                    </div>
                  </div>

                  {/* Health Impact Note & Status Description */}
                  <div className="flex-1 bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4.5 space-y-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-950">
                      <Activity className="w-4.5 h-4.5 text-amber-700" />
                      <span>Ambient Health Advisory</span>
                    </div>
                    {/* LEVEL 5 Body text */}
                    <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
                      {aqiData?.healthAdvisory || 'Monitoring continuous air quality parameters in your area.'}
                    </p>
                  </div>
                </div>

                {/* Segment Range Legend */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 font-semibold px-4 mt-4">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> 0-50 Good</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#84cc16]"></span> 51-100 Sat</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span> 101-200 Mod</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span> 201+ Poor</span>
                </div>

                {/* Real Particulate Breakdowns Matrix */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-slate-100">
                  {/* PM2.5 */}
                  <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                    <span style={{ fontWeight: 500, fontSize: '0.85rem', color: '#2d4a2d' }} className="block">{t.pm25Label}</span>
                    <div className="flex items-baseline justify-between">
                      <span style={{ fontWeight: 700, fontSize: '1.6rem' }} className="text-slate-900 font-mono">
                        {aqiData?.pm25 ?? '--'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">µg/m³</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(((aqiData?.pm25 ?? 30) / 120) * 100, 100)}%` }}
                      />
                    </div>
                    <span style={{ fontWeight: 400, fontSize: '0.78rem', color: '#4a6741' }} className="block pt-0.5">
                      {aqiData && aqiData.pm25 <= 30 ? 'Good' : aqiData && aqiData.pm25 <= 60 ? 'Satisfactory' : 'Elevated'} (Std: 60)
                    </span>
                  </div>

                  {/* PM10 */}
                  <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                    <span style={{ fontWeight: 500, fontSize: '0.85rem', color: '#2d4a2d' }} className="block">{t.pm10Label}</span>
                    <div className="flex items-baseline justify-between">
                      <span style={{ fontWeight: 700, fontSize: '1.6rem' }} className="text-slate-900 font-mono">
                        {aqiData?.pm10 ?? '--'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">µg/m³</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(((aqiData?.pm10 ?? 50) / 250) * 100, 100)}%` }}
                      />
                    </div>
                    <span style={{ fontWeight: 400, fontSize: '0.78rem', color: '#4a6741' }} className="block pt-0.5">
                      {aqiData && aqiData.pm10 <= 100 ? 'Satisfactory' : 'Moderate'} (Std: 100)
                    </span>
                  </div>

                  {/* Carbon Monoxide (CO) */}
                  <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                    <span style={{ fontWeight: 500, fontSize: '0.85rem', color: '#2d4a2d' }} className="block">Carbon Monoxide (CO)</span>
                    <div className="flex items-baseline justify-between">
                      <span style={{ fontWeight: 700, fontSize: '1.6rem' }} className="text-slate-900 font-mono">
                        {aqiData?.carbonMonoxide ?? '--'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">µg/m³</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full w-[35%]" />
                    </div>
                    <span style={{ fontWeight: 400, fontSize: '0.78rem', color: '#4a6741' }} className="block pt-0.5">Within Safe Limit</span>
                  </div>

                  {/* Nitrogen Dioxide (NO2) */}
                  <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                    <span style={{ fontWeight: 500, fontSize: '0.85rem', color: '#2d4a2d' }} className="block">Nitrogen Dioxide (NO₂)</span>
                    <div className="flex items-baseline justify-between">
                      <span style={{ fontWeight: 700, fontSize: '1.6rem' }} className="text-slate-900 font-mono">
                        {aqiData?.nitrogenDioxide ?? '--'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">µg/m³</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-lime-500 h-full rounded-full w-[45%]" />
                    </div>
                    <span style={{ fontWeight: 400, fontSize: '0.78rem', color: '#4a6741' }} className="block pt-0.5">Standard: 80 µg/m³</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Multi-Source Telemetry Assurance & Data Sources (5 of 12 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Data Sources Transparency Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-200/80">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1a2e1a' }} className="leading-tight">
                  Data Source Transparency
                </h3>
                <p className="text-xs text-slate-500">Active External Public & Satellite APIs</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Weather Telemetry</div>
                  <div className="text-slate-500 text-xs">Temperature, Humidity, Wind & Pressure</div>
                </div>
                <span className="font-mono text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-md">
                  Open-Meteo
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Air Quality Telemetry</div>
                  <div className="text-slate-500 text-xs">PM2.5, PM10, AQI & Gaseous Indicators</div>
                </div>
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md">
                  Open-Meteo AQ
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Satellite Map Tiles</div>
                  <div className="text-slate-500 text-xs">High-resolution Earth Imagery</div>
                </div>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md">
                  Google Maps
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Satellite Fire Detections</div>
                  <div className="text-slate-500 text-xs">VIIRS / MODIS Thermal Hotspots</div>
                </div>
                <span className="font-mono text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-md">
                  NASA FIRMS
                </span>
              </div>
            </div>
          </div>

          {/* Citizen Reporting Quick Action Card */}
          <div className="bg-gradient-to-br from-[#003366] to-[#002244] text-white rounded-2xl p-6 shadow-sm border border-slate-700 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950">
                <FilePlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">Report an Environmental Incident</h3>
                <p className="text-xs text-slate-300">Ground-level observation linked to your coordinates</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Your observation will be correlated with regional telemetry and satellite anomaly feeds.
            </p>
            <button
              onClick={onNavigateToReport}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Submit Ground Observation</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
