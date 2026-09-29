import React, { useState, useEffect } from 'react';
import type { CitizenTab } from '../types';
import type { AQStationMarker, WeatherData } from '../types/environmental';
import type { AnalyticsSummaryRecord } from '../types/incident';
import {
  fetchBackendAQStations,
  fetchBackendWeather,
  fetchAnalyticsSummary,
  formatPollutantName,
  getWeatherCondition,
  getWindCardinal,
} from '../services/saamekBackendService';
import {
  FilePlus,
  Map as MapIcon,
  ClipboardList,
  ShieldCheck,
  Activity,
  Wind,
  CloudSun,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ChevronRight,
  Info,
  Layers,
  Thermometer,
  Droplets,
  Flame,
} from 'lucide-react';

interface CitizenHomeViewProps {
  onNavigateTab: (tab: CitizenTab) => void;
}

export const CitizenHomeView: React.FC<CitizenHomeViewProps> = ({ onNavigateTab }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [stations, setStations] = useState<AQStationMarker[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummaryRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      try {
        const [weatherRes, stationsRes, analyticsRes] = await Promise.allSettled([
          fetchBackendWeather(),
          fetchBackendAQStations(),
          fetchAnalyticsSummary(),
        ]);

        if (weatherRes.status === 'fulfilled') setWeather(weatherRes.value);
        if (stationsRes.status === 'fulfilled') setStations(stationsRes.value);
        if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
      } catch (err) {
        console.error('Error loading citizen home telemetry:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  // Compute key pollutants from primary station
  const primaryStation = stations[0];

  return (
    <div className="space-y-6">
      {/* 1. Official Civic Hero Banner */}
      <div className="bg-linear-to-r from-[#003366] via-[#0c2340] to-[#1a365d] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-[#1e4976]">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-400/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Official Citizen Environmental Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Environmental Incident Vigilance & Reporting
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6">
            Welcome to SAAMEK Gwalior. Help government authorities protect public health by reporting local environmental concerns such as open burning, abnormal smoke spikes, construction dust, or chemical emissions.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('report')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm shadow-md hover:bg-amber-300 transition-all cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              Report an Environmental Issue
            </button>
            <button
              onClick={() => onNavigateTab('map')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-xs border border-white/20 transition-all cursor-pointer"
            >
              <MapIcon className="w-4 h-4" />
              View Gwalior Map
            </button>
            <button
              onClick={() => onNavigateTab('my-reports')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-xs border border-white/20 transition-all cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              Track My Submissions
            </button>
          </div>
        </div>

        {/* Location Badge on Top Right */}
        <div className="absolute top-6 right-6 hidden md:flex flex-col items-end text-right">
          <div className="text-xs text-slate-300 font-medium">Jurisdiction Scoped To</div>
          <div className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-400" />
            Gwalior, Madhya Pradesh
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">MPPCB & Municipal Corporation</div>
        </div>
      </div>

      {/* 2. Live Environmental Situation in Gwalior */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-[#003366] rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Live Gwalior Environmental Situation</h2>
              <p className="text-xs text-slate-500">
                Live ground sensors & atmospheric conditions from official open data networks
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Live Telemetry Sync
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Weather Card */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Current Weather</span>
              <CloudSun className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              {weather ? `${weather.temperature.toFixed(1)} °C` : '--'}
            </div>
            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <span>{weather ? getWeatherCondition(weather.weatherCode) : 'Reading...'}</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-0.5">
                <Droplets className="w-3 h-3 text-sky-600" />
                {weather?.humidity ?? '--'}%
              </span>
            </div>
          </div>

          {/* Wind Conditions */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Wind & Dispersion</span>
              <Wind className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              {weather ? `${weather.windSpeed.toFixed(1)} km/h` : '--'}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Direction: <span className="font-semibold text-slate-800">{getWindCardinal(weather?.windDirection)} ({weather?.windDirection ?? '--'}°)</span>
            </div>
          </div>

          {/* Key Ground Pollutant (PM2.5) */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Fine Particles (PM2.5)</span>
              <Activity className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              {primaryStation?.pm25 != null ? `${primaryStation.pm25.toFixed(1)} µg/m³` : 'Monitoring'}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Station: <span className="font-semibold text-slate-800">{primaryStation?.name || 'Phoolbagh'}</span>
            </div>
          </div>

          {/* Key Ground Pollutant (PM10 / NO2) */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Coarse Particles (PM10)</span>
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              {primaryStation?.pm10 != null ? `${primaryStation.pm10.toFixed(1)} µg/m³` : 'Monitoring'}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Station: <span className="font-semibold text-slate-800">{primaryStation?.name || 'City Center'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Community Vigilance & Incident Response Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {analytics?.active_incidents_count ?? 0}
              </div>
              <div className="text-xs font-semibold text-slate-600">Active Incidents Under Response</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mt-2">
            Official environmental incidents verified and actively being mitigated by municipal and pollution control teams.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-blue-50 text-[#003366]">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {analytics?.pending_verification_reports_count ?? 0}
              </div>
              <div className="text-xs font-semibold text-slate-600">Reports Under Verification</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mt-2">
            Citizen-submitted observations currently undergoing correlation with satellite passes and ground sensor spikes.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {analytics?.resolved_incidents_count ?? 0}
              </div>
              <div className="text-xs font-semibold text-slate-600">Resolved Environmental Actions</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mt-2">
            Confirmed incidents where field teams deployed dust suppressants, extinguished waste fires, or halted unauthorized emissions.
          </p>
        </div>
      </div>

      {/* 4. How the SAAMEK Incident Pipeline Works for Citizens */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-[#003366]" />
          <h3 className="text-base font-bold text-slate-900">How SAAMEK Handles Your Reports</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-[#003366] text-white flex items-center justify-center text-xs font-bold mb-2">
              1
            </div>
            <div className="text-xs font-bold text-slate-900 mb-1">DETECT</div>
            <div className="text-[11px] text-slate-600">
              Citizen spots smoke, burning, or emissions and submits an observation report.
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold mb-2">
              2
            </div>
            <div className="text-xs font-bold text-slate-900 mb-1">CORRELATE</div>
            <div className="text-[11px] text-slate-600">
              Backend checks nearby OpenAQ sensors, NASA FIRMS satellites, and wind direction.
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold mb-2">
              3
            </div>
            <div className="text-xs font-bold text-slate-900 mb-1">ASSESS</div>
            <div className="text-[11px] text-slate-600">
              Government officials verify the multi-source evidence and triage severity.
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mb-2">
              4
            </div>
            <div className="text-xs font-bold text-slate-900 mb-1">RESPOND</div>
            <div className="text-[11px] text-slate-600">
              Field inspection team or fire engine is dispatched to the verified coordinates.
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold mb-2">
              5
            </div>
            <div className="text-xs font-bold text-slate-900 mb-1">RESOLVE</div>
            <div className="text-[11px] text-slate-600">
              Issue mitigated, audit log recorded, and report status marked as Resolved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
