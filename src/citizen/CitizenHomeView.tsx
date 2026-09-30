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
  ArrowRight,
  Sparkles,
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003366] via-[#0a2747] to-[#0c1e33] p-7 sm:p-9 text-white shadow-xl border border-sky-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-400/30 shadow-2xs font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Official Citizen Environmental Vigilance Portal
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3 leading-tight">
            Environmental Incident Vigilance &amp; Reporting
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-7 max-w-2xl">
            Welcome to SAAMEK Gwalior. Partner with government authorities to safeguard community health by reporting open burning, abnormal smoke plumes, construction dust, or industrial chemical emissions.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('report')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-black text-sm shadow-md hover:from-amber-300 hover:to-amber-200 transition-all cursor-pointer active:scale-95"
            >
              <FilePlus className="w-4 h-4" />
              Report an Environmental Issue
            </button>
            <button
              onClick={() => onNavigateTab('map')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-xs border border-white/20 transition-all cursor-pointer"
            >
              <MapIcon className="w-4 h-4" />
              View Gwalior Map
            </button>
            <button
              onClick={() => onNavigateTab('my-reports')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-xs border border-white/20 transition-all cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              Track My Submissions
            </button>
          </div>
        </div>

        {/* Location Badge on Top Right */}
        <div className="absolute top-7 right-7 hidden md:flex flex-col items-end text-right">
          <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Jurisdiction Scoped To</div>
          <div className="text-sm font-black text-amber-300 flex items-center gap-1.5 mt-0.5">
            <Building2 className="w-4 h-4 text-amber-400" />
            Gwalior, Madhya Pradesh
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">MPPCB &amp; Municipal Corporation</div>
        </div>
      </div>

      {/* 2. Live Environmental Situation in Gwalior */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-[#003366] rounded-xl border border-blue-100">
              <Activity className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">Live Gwalior Environmental Situation</h2>
              <p className="text-xs text-slate-500">
                Ground monitoring sensors &amp; atmospheric vectors synchronized via SAAMEK backend
              </p>
            </div>
          </div>
          <div className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Telemetry Grid Sync
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Weather Card */}
          <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Current Temperature</span>
              <CloudSun className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {weather ? `${weather.temperature.toFixed(1)} °C` : '--'}
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-2 pt-1 border-t border-slate-200/60">
              <span>{weather ? getWeatherCondition(weather.weatherCode) : 'Reading...'}</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-500 font-mono">
                <Droplets className="w-3 h-3 text-sky-600" />
                {weather?.humidity ?? '--'}%
              </span>
            </div>
          </div>

          {/* Wind Conditions */}
          <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Wind &amp; Dispersion</span>
              <Wind className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {weather ? `${weather.windSpeed.toFixed(1)} km/h` : '--'}
            </div>
            <div className="text-xs text-slate-600 pt-1 border-t border-slate-200/60">
              Vector: <span className="font-bold text-slate-800">{getWindCardinal(weather?.windDirection)} ({weather?.windDirection ?? '--'}°)</span>
            </div>
          </div>

          {/* Key Ground Pollutant (PM2.5) */}
          <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Particulate Matter (PM2.5)</span>
              <Activity className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {primaryStation?.pm25 != null ? `${primaryStation.pm25.toFixed(1)} µg/m³` : 'Monitoring'}
            </div>
            <div className="text-xs text-slate-600 pt-1 border-t border-slate-200/60 truncate">
              Station: <span className="font-semibold text-slate-800">{primaryStation?.name || 'Maharaj Bada'}</span>
            </div>
          </div>

          {/* Key Ground Pollutant (PM10) */}
          <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Coarse Particles (PM10)</span>
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {primaryStation?.pm10 != null ? `${primaryStation.pm10.toFixed(1)} µg/m³` : 'Monitoring'}
            </div>
            <div className="text-xs text-slate-600 pt-1 border-t border-slate-200/60 truncate">
              Station: <span className="font-semibold text-slate-800">{primaryStation?.name || 'Deen Dayal Nagar'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Community Vigilance & Incident Response Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-amber-500 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-3xl font-black font-mono text-slate-900 leading-none">
                {analytics?.active_incidents_count ?? 0}
              </div>
              <div className="text-xs font-bold text-slate-700 mt-1">Active Incidents Under Response</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            Official environmental incidents verified and actively being mitigated by municipal and pollution control teams.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-sky-500 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-50 text-[#003366] border border-sky-200">
              <ClipboardList className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <div className="text-3xl font-black font-mono text-slate-900 leading-none">
                {analytics?.pending_verification_reports_count ?? 0}
              </div>
              <div className="text-xs font-bold text-slate-700 mt-1">Reports Under Triage</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            Citizen-submitted observations currently undergoing correlation with satellite passes and ground sensor spikes.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-emerald-500 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-3xl font-black font-mono text-slate-900 leading-none">
                {analytics?.resolved_incidents_count ?? 0}
              </div>
              <div className="text-xs font-bold text-slate-700 mt-1">Resolved Environmental Actions</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            Confirmed incidents where field teams deployed dust suppressants, extinguished waste fires, or halted unauthorized emissions.
          </p>
        </div>
      </div>

      {/* 4. How the SAAMEK Incident Pipeline Works for Citizens */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-5 bg-[#003366] rounded-full" />
          <ShieldCheck className="w-5 h-5 text-[#003366]" />
          <h3 className="text-base font-bold text-slate-900">How SAAMEK Operational Pipeline Works</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-full bg-[#003366] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              1
            </div>
            <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">DETECT</div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              Citizen spots smoke, burning, or emissions and submits an observation report with location coordinates.
            </div>
          </div>

          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              2
            </div>
            <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">CORRELATE</div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              Backend checks nearby OpenAQ sensors, NASA FIRMS satellites, and wind direction vectors automatically.
            </div>
          </div>

          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              3
            </div>
            <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">ASSESS</div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              Government officials verify the multi-source evidence matrix and triage severity in the Command Center.
            </div>
          </div>

          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              4
            </div>
            <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">RESPOND</div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              Field inspection team or municipal water tanker is dispatched to the verified coordinates.
            </div>
          </div>

          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              5
            </div>
            <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">RESOLVE</div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              Hazard mitigated, audit trail recorded, and status marked as Resolved on the citizen dashboard.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
