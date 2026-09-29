import React, { useState, useEffect, useCallback } from 'react';
import type { TranslationStrings } from '../i18n/translations';
import type {
  WeatherData,
  AQStationMarker,
  FireDetectionMarker,
  DerivedHotspotMarker,
  DataFetchState,
} from '../types/environmental';
import type { IncidentRecord, CitizenReportRecord } from '../types/incident';
import { ACTIVE_MONITORING_CITY } from '../config/cityConfig';
import {
  fetchBackendAQStations,
  fetchBackendFires,
  fetchBackendWeather,
  fetchIncidents,
  fetchCitizenReports,
} from '../services/saamekBackendService';
import { GovCleanEnvironmentalMap } from './GovCleanEnvironmentalMap';
import { IncidentDetailModal } from './IncidentDetailModal';
import {
  Map,
  Radio,
  Flame,
  RefreshCw,
  Building2,
  AlertTriangle,
  FileCheck2,
} from 'lucide-react';

interface GovIntelligenceMapViewProps {
  t?: TranslationStrings;
  onNavigateToIncident?: (incidentId: string) => void;
  officerName?: string;
}

const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export const GovIntelligenceMapView: React.FC<GovIntelligenceMapViewProps> = ({
  officerName = 'Government Officer',
}) => {
  const city = ACTIVE_MONITORING_CITY;

  const [weather, setWeather] = useState<DataFetchState<WeatherData>>({
    data: null,
    status: 'loading',
  });
  const [stations, setStations] = useState<DataFetchState<AQStationMarker[]>>({
    data: null,
    status: 'loading',
  });
  const [fires, setFires] = useState<DataFetchState<FireDetectionMarker[]>>({
    data: null,
    status: 'loading',
  });
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReportRecord[]>([]);
  const [hotspots, setHotspots] = useState<DerivedHotspotMarker[]>([]);

  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(() => new Date());
  const [lastSuccessfulUpdate, setLastSuccessfulUpdate] = useState<Date | null>(null);

  // Fetch all live environmental telemetry and incident records from backend
  const fetchAllCityTelemetry = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [weatherRes, stationsRes, firesRes, incList, crList] = await Promise.all([
        fetchBackendWeather(city.name.toLowerCase()),
        fetchBackendAQStations(city.name.toLowerCase()),
        fetchBackendFires(city.name.toLowerCase()),
        fetchIncidents(),
        fetchCitizenReports(),
      ]);

      setWeather({ data: weatherRes, status: 'success' });
      setStations({ data: stationsRes, status: 'success' });
      setFires({ data: firesRes, status: 'success' });
      setIncidents(incList);
      setCitizenReports(crList);
      setHotspots([]);

      setLastSuccessfulUpdate(new Date());
    } catch (err: any) {
      console.error(`[SAAMEK Backend Client] Error fetching from backend:`, err);
    } finally {
      setIsRefreshing(false);
      setLastRefreshedAt(new Date());
    }
  }, [city]);

  useEffect(() => {
    fetchAllCityTelemetry();
    const intervalTimer = setInterval(() => {
      fetchAllCityTelemetry();
    }, AUTO_REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalTimer);
  }, [fetchAllCityTelemetry]);

  const stationsCount = stations.data?.length || 0;
  const firesCount = fires.data?.length || 0;
  const activeIncCount = incidents.filter((i) => i.status !== 'resolved').length;
  const pendingCrCount = citizenReports.filter((r) => r.status === 'pending_verification').length;

  const lastUpdatedTimeText = lastRefreshedAt.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const lastSuccessText = lastSuccessfulUpdate
    ? lastSuccessfulUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : undefined;

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0c2340] via-[#003366] to-[#0a1f38] text-white rounded-2xl shadow-md border border-slate-700/50 p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-200 border border-sky-400/30 backdrop-blur-md">
                <Map className="w-3.5 h-3.5 text-sky-300" />
                <span>PRIMARY OPERATIONAL MAP</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30 backdrop-blur-md">
                <Building2 className="w-3.5 h-3.5 text-amber-300" />
                <span>PILOT CITY: {city.name.toUpperCase()} ({city.state.toUpperCase()})</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
              Live Environmental Intelligence Map — {city.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed">
              Unified operational geospatial layer: Environmental Incidents, Citizen Reports, NASA Thermal Detections, and OpenAQ Sensors.
            </p>
          </div>

          {/* Quick Telemetry Counters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-white/10 border border-white/15 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>
                Incidents: <strong>{activeIncCount} Active</strong>
              </span>
            </div>

            <div className="bg-white/10 border border-white/15 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
              <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Reports: <strong>{pendingCrCount} Pending</strong>
              </span>
            </div>

            <div className="bg-white/10 border border-white/15 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-sky-400" />
              <span>
                AQ Stations: <strong>{stationsCount}</strong>
              </span>
            </div>

            <button
              onClick={fetchAllCityTelemetry}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold py-2 px-3.5 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
              <span>{lastUpdatedTimeText}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Clean Leaflet Map */}
      <GovCleanEnvironmentalMap
        cityConfig={city}
        weather={weather}
        stations={stations}
        fires={fires}
        hotspots={hotspots}
        incidents={incidents}
        citizenReports={citizenReports}
        onInspectIncident={(inc) => setSelectedIncident(inc)}
        onRefresh={fetchAllCityTelemetry}
        isRefreshing={isRefreshing}
        lastUpdatedText={lastUpdatedTimeText}
        lastSuccessfulUpdateText={lastSuccessText}
      />

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onStatusUpdated={() => {
            fetchAllCityTelemetry();
          }}
          officerName={officerName}
        />
      )}
    </div>
  );
};
