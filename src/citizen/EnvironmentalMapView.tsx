import React from 'react';
import type { TranslationStrings } from '../i18n/translations';
import { useEnvironmentalData } from '../context/useEnvironmentalData';
import { getStoredReports } from './mockData';
import { GoogleSatelliteMap } from '../components/maps/GoogleSatelliteMap';
import {
  Layers,
  AlertTriangle,
  RefreshCw,
  Radio,
} from 'lucide-react';

interface EnvironmentalMapViewProps {
  t: TranslationStrings;
}

export const EnvironmentalMapView: React.FC<EnvironmentalMapViewProps> = ({ t }) => {
  const {
    location,
    locationStatus,
    requestLocation,
    stations,
    fires,
    refreshData,
    isRefreshing,
    lastUpdatedTimeText,
  } = useEnvironmentalData();

  const storedReports = getStoredReports();

  return (
    <div className="space-y-6">
      {/* =========================================================================
          ATMOSPHERIC SATELLITE MAP HERO (COHESIVE SAAMEK VISUAL LANGUAGE)
          ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0c2340] via-[#003366] to-[#0a2544] text-white rounded-2xl shadow-md border border-slate-700/50 p-6 sm:p-8 lg:p-9">
        {/* Subtle Ambient SVG Backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
          <svg viewBox="0 0 1200 400" className="w-full h-full object-cover" preserveAspectRatio="none" fill="none">
            <circle cx="980" cy="110" r="140" fill="#0284c7" />
            <path d="M0 320 Q300 230 600 290 T1200 250 L1200 400 L0 400 Z" fill="#ffffff" opacity="0.3" />
            <path d="M0 360 Q200 300 500 340 T1200 330 L1200 400 L0 400 Z" fill="#ffffff" opacity="0.4" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-sky-500/25 text-sky-200 border border-sky-400/40 backdrop-blur-md">
                <Layers className="w-4 h-4 text-sky-300" />
                Satellite Environmental Surveillance Grid
              </span>
              <span className="text-xs sm:text-sm text-slate-200 font-medium flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-400" />
                Live Geospatial Telemetry
              </span>
            </div>

            {/* LEVEL 1 — PAGE TITLE */}
            <h1 className="text-3xl sm:text-4xl lg:text-4.5xl font-bold tracking-tight text-white font-serif leading-tight">
              {t.mapHeading}
            </h1>

            {/* LEVEL 5 — BODY SUBTITLE */}
            <p className="text-base sm:text-lg text-slate-200/95 leading-relaxed font-normal">
              {t.mapSubtitle}
            </p>
          </div>

          {/* Right: Location & Telemetry Feeds Status */}
          <div className="flex flex-wrap items-center gap-3">
            {locationStatus === 'granted' && location ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-inner space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Location Active</span>
                </div>
                <div className="text-sm font-bold text-white truncate max-w-[200px]">
                  {location.locality || location.city}
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
                </div>
              </div>
            ) : locationStatus === 'requesting' ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-inner flex items-center gap-2 text-xs font-bold text-sky-200">
                <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                <span>Detecting Location...</span>
              </div>
            ) : null}

            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs sm:text-sm font-bold py-3.5 px-5 rounded-2xl backdrop-blur-md transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
              <span>{lastUpdatedTimeText}</span>
            </button>
          </div>
        </div>

        {/* Location Permission Alert (if denied) */}
        {locationStatus === 'denied' && (
          <div className="mt-4 bg-amber-500/20 backdrop-blur-md border border-amber-400/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-100 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-300 flex-shrink-0" />
              <span>
                Location access is required to center the satellite view on your exact area.
              </span>
            </div>
            <button
              onClick={requestLocation}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer flex-shrink-0"
            >
              Allow Location
            </button>
          </div>
        )}
      </div>

      {/* Real Interactive Satellite Map */}
      <GoogleSatelliteMap
        userLocation={location}
        stations={stations.data || []}
        fires={fires.data || []}
        reports={storedReports}
        stationsStatus={stations.status}
        firesStatus={fires.status}
        onRefresh={refreshData}
        isRefreshing={isRefreshing}
      />
    </div>
  );
};
