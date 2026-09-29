import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Tooltip, Popup, useMap } from 'react-leaflet';
import type { Map as LeafletMap, LatLngExpression } from 'leaflet';
import type {
  WeatherData,
  AQStationMarker,
  FireDetectionMarker,
  DerivedHotspotMarker,
  DataFetchState,
} from '../types/environmental';
import type { IncidentRecord, CitizenReportRecord } from '../types/incident';
import { ACTIVE_MONITORING_CITY, type CityConfig } from '../config/cityConfig';
import {
  Radio,
  Flame,
  AlertTriangle,
  CloudSun,
  Wind,
  Layers,
  Crosshair,
  RefreshCw,
  X,
  Compass,
  Droplets,
  Gauge,
  Info,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import { formatTimestamp } from '../services/saamekBackendService';

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatPollutantName(param: string): string {
  const p = (param || '').toLowerCase().trim();
  switch (p) {
    case 'pm25':
    case 'pm2.5':
      return 'PM2.5';
    case 'pm10':
      return 'PM10';
    case 'no2':
      return 'NO2';
    case 'so2':
      return 'SO2';
    case 'o3':
    case 'ozone':
      return 'O3';
    case 'co':
      return 'CO';
    case 'nh3':
      return 'NH3';
    case 'no':
      return 'NO';
    case 'nox':
      return 'NOx';
    case 'temperature':
      return 'Temperature';
    case 'relativehumidity':
      return 'Relative Humidity';
    case 'wind_speed':
      return 'Wind Speed';
    case 'wind_direction':
      return 'Wind Direction';
    default:
      return param ? param.toUpperCase() : 'Unknown';
  }
}

function formatMeasurementTimestamp(isoString?: string | null): string {
  if (!isoString) return 'No timestamp';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface SelectedEntity {
  type: 'station' | 'fire' | 'hotspot' | 'incident' | 'citizen_report';
  title: string;
  categoryLabel: string;
  locationText: string;
  coordinates: { lat: number; lng: number };
  timestamp: string;
  source: string;
  status: string;
  // Specific payload for rich modal display
  stationData?: AQStationMarker;
  fireData?: FireDetectionMarker;
  hotspotData?: DerivedHotspotMarker;
  incidentData?: IncidentRecord;
  citizenReportData?: CitizenReportRecord;
  attributes: { label: string; value: string }[];
}

export interface GovCleanEnvironmentalMapProps {
  cityConfig?: CityConfig;
  weather: DataFetchState<WeatherData>;
  stations: DataFetchState<AQStationMarker[]>;
  fires: DataFetchState<FireDetectionMarker[]>;
  hotspots?: DerivedHotspotMarker[];
  incidents?: IncidentRecord[];
  citizenReports?: CitizenReportRecord[];
  onInspectIncident?: (incident: IncidentRecord) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdatedText: string;
  lastSuccessfulUpdateText?: string;
}

// ─── Internal helper: captures map instance and handles auto-recenter ────────

function MapController({
  onMap,
  targetCenter,
}: {
  onMap: (map: LeafletMap) => void;
  targetCenter: { latitude: number; longitude: number };
}) {
  const map = useMap();
  const recenteredRef = useRef(false);

  useEffect(() => {
    onMap(map);
  }, [map, onMap]);

  useEffect(() => {
    if (!recenteredRef.current) {
      map.setView([targetCenter.latitude, targetCenter.longitude], 12);
      recenteredRef.current = true;
    }
  }, [targetCenter, map]);

  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const GovCleanEnvironmentalMap: React.FC<GovCleanEnvironmentalMapProps> = ({
  cityConfig = ACTIVE_MONITORING_CITY,
  weather,
  stations,
  fires,
  hotspots = [],
  incidents = [],
  citizenReports = [],
  onInspectIncident,
  onRefresh,
  isRefreshing,
  lastUpdatedText,
  lastSuccessfulUpdateText,
}) => {
  // ── Layer toggles ──
  const [showIncidents, setShowIncidents] = useState(true);
  const [showCitizenReports, setShowCitizenReports] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showFires, setShowFires] = useState(true);
  const [showHotspots, setShowHotspots] = useState(false);
  const [showWeather, setShowWeather] = useState(true);
  const [showWind, setShowWind] = useState(true);

  // ── Entity inspector modal/panel ──
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);

  // ── "View All Stations" slide-over drawer ──
  const [showStationListDrawer, setShowStationListDrawer] = useState(false);

  // ── Map instance reference for programmatic controls ──
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);

  // ── Derived data ──
  const weatherData = weather.data;
  const stationsList = useMemo(() => stations.data ?? [], [stations.data]);
  const firesList = useMemo(() => fires.data ?? [], [fires.data]);

  const centerLat = cityConfig.center.latitude;
  const centerLng = cityConfig.center.longitude;
  const center: LatLngExpression = [centerLat, centerLng];

  const windSpeed = weatherData?.windSpeed ?? 0;
  const windDirDeg = weatherData?.windDirection ?? 0;
  const windCardinal = weatherData?.windDirectionCardinal ?? 'N';

  return (
    <div className="space-y-4">
      {/* =====================================================================
          1. REAL-TIME SOURCE STATUS TELEMETRY BAR (Dynamic connection states)
          ===================================================================== */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Active Monitoring Area Tag */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-xs font-bold text-slate-200">
                Live Pilot Area: <strong className="text-sky-400">{cityConfig.name}, {cityConfig.state}</strong>
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                Bounding Box: [{cityConfig.boundingBox.minLongitude}°E, {cityConfig.boundingBox.minLatitude}°N to {cityConfig.boundingBox.maxLongitude}°E, {cityConfig.boundingBox.maxLatitude}°N]
              </span>
            </div>
          </div>

          {/* Center: Real Dynamic Source Status Pills (Section 11) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* 1. OpenAQ Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md ${
              stations.status === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : stations.status === 'loading'
                ? 'bg-sky-950/40 border-sky-500/40 text-sky-200'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                stations.status === 'success' ? 'bg-emerald-400' : stations.status === 'loading' ? 'bg-sky-400 animate-spin' : 'bg-amber-400'
              }`} />
              <div className="leading-tight">
                <span className="font-bold">OpenAQ</span>
                <span className="text-[10px] text-slate-300 block font-mono">
                  {stations.status === 'success'
                    ? `● Backend Connected | Stations: ${stationsList.length}`
                    : stations.status === 'empty'
                    ? '● Operational | 0 stations in bounding box'
                    : stations.status === 'loading'
                    ? '● Connecting to backend...'
                    : '● Backend Offline / Error'}
                </span>
              </div>
            </div>

            {/* 2. NASA FIRMS Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md ${
              fires.status === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : fires.status === 'loading'
                ? 'bg-sky-950/40 border-sky-500/40 text-sky-200'
                : 'bg-red-950/40 border-red-500/40 text-red-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                fires.status === 'success' ? 'bg-emerald-400' : fires.status === 'loading' ? 'bg-sky-400 animate-spin' : 'bg-red-400'
              }`} />
              <div className="leading-tight">
                <span className="font-bold">NASA FIRMS</span>
                <span className="text-[10px] text-slate-300 block font-mono">
                  {fires.status === 'success'
                    ? `● Backend Connected | Detections: ${firesList.length}`
                    : fires.status === 'loading'
                    ? '● Connecting to backend...'
                    : '● Backend Offline / Error'}
                </span>
              </div>
            </div>

            {/* 3. Open-Meteo Weather Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md ${
              weather.status === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : weather.status === 'loading'
                ? 'bg-sky-950/40 border-sky-500/40 text-sky-200'
                : 'bg-red-950/40 border-red-500/40 text-red-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                weather.status === 'success' ? 'bg-emerald-400' : weather.status === 'loading' ? 'bg-sky-400 animate-spin' : 'bg-red-400'
              }`} />
              <div className="leading-tight">
                <span className="font-bold">Open-Meteo</span>
                <span className="text-[10px] text-slate-300 block font-mono">
                  {weather.status === 'success' && weatherData
                    ? `● Backend Connected | ${weatherData.temperature}°C, ${weatherData.windSpeed} km/h`
                    : weather.status === 'loading'
                    ? '● Connecting to backend...'
                    : '● Weather data unavailable'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Refresh button with real timestamp */}
          <div className="flex flex-col items-end">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
              <span>Refresh Environmental Data</span>
            </button>
            <span className="text-[10px] text-slate-400 font-mono mt-1">
              Updated: {lastUpdatedText}
              {lastSuccessfulUpdateText && ` • Synced: ${lastSuccessfulUpdateText}`}
            </span>
          </div>
        </div>

        {/* Diagnostic notification if any backend feed encountered error */}
        {(stations.status === 'error' || fires.status === 'error' || weather.status === 'error') && (
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>SAAMEK Backend Status:</strong>{' '}
              {stations.errorMessage || fires.errorMessage || weather.errorMessage || 'Unable to connect to SAAMEK backend on http://localhost:8000.'}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          2. ENVIRONMENTAL LAYER TOGGLE CONTROLS BAR
          ===================================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Left: Base Map info & "View all Gwalior stations" */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl">
            <Layers className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-700">OpenStreetMap</span>
            <span className="text-[10px] text-slate-500 font-mono">© OSM contributors</span>
          </div>

          <button
            onClick={() => setShowStationListDrawer(true)}
            className="inline-flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold py-1.5 px-3 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <Radio className="w-3.5 h-3.5 text-sky-600" />
            <span>View All Gwalior Stations ({stationsList.length})</span>
          </button>
        </div>

        {/* Center: Environmental Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* 1. Environmental Incidents */}
          <label
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold select-none border transition-all ${
              showIncidents
                ? 'bg-rose-100 text-rose-950 border-rose-300 cursor-pointer shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              checked={showIncidents}
              onChange={(e) => setShowIncidents(e.target.checked)}
              className="accent-rose-700 rounded"
            />
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Incidents ({incidents.length} Active)</span>
          </label>

          {/* 2. Citizen Reports */}
          <label
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold select-none border transition-all ${
              showCitizenReports
                ? 'bg-amber-100 text-amber-950 border-amber-300 cursor-pointer shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              checked={showCitizenReports}
              onChange={(e) => setShowCitizenReports(e.target.checked)}
              className="accent-amber-700 rounded"
            />
            <FileCheck2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Citizen Reports ({citizenReports.length})</span>
          </label>

          {/* 3. AQ Monitoring Stations */}
          <label
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold select-none border transition-all ${
              stations.status === 'success'
                ? showStations
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              checked={showStations}
              onChange={(e) => setShowStations(e.target.checked)}
              className="accent-sky-700 rounded"
            />
            <Radio className="w-3.5 h-3.5 text-sky-600" />
            <span>AQ Stations ({stationsList.length})</span>
          </label>

          {/* 4. Satellite Fires */}
          <label
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold select-none border transition-all ${
              showFires
                ? 'bg-red-100 text-red-950 border-red-300 cursor-pointer shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              checked={showFires}
              onChange={(e) => setShowFires(e.target.checked)}
              className="accent-red-700 rounded"
            />
            <Flame className="w-3.5 h-3.5 text-red-600" />
            <span>NASA Fires ({firesList.length})</span>
          </label>

          {/* 3. Environmental Hotspots */}
          <label
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold select-none border transition-all ${
              showHotspots
                ? 'bg-amber-100 text-amber-950 border-amber-300 cursor-pointer shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={(e) => setShowHotspots(e.target.checked)}
              className="accent-amber-700 rounded"
            />
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Environmental Hotspots ({hotspots.length} Derived)</span>
          </label>

          {/* 4. Weather */}
          <label
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold select-none border transition-all ${
              weatherData
                ? showWeather
                  ? 'bg-indigo-100 text-indigo-950 border-indigo-300 cursor-pointer shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            <input
              type="checkbox"
              checked={showWeather}
              disabled={!weatherData}
              onChange={(e) => setShowWeather(e.target.checked)}
              className="accent-indigo-700 rounded"
            />
            <CloudSun className="w-3.5 h-3.5 text-indigo-600" />
            <span>Weather Context</span>
          </label>

          {/* 5. Wind */}
          <label
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold select-none border transition-all ${
              weatherData
                ? showWind
                  ? 'bg-teal-100 text-teal-950 border-teal-300 cursor-pointer shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            <input
              type="checkbox"
              checked={showWind}
              disabled={!weatherData}
              onChange={(e) => setShowWind(e.target.checked)}
              className="accent-teal-700 rounded"
            />
            <Wind className="w-3.5 h-3.5 text-teal-700" />
            <span>Wind ({windCardinal} • {windSpeed} km/h)</span>
          </label>
        </div>

        {/* Right: Locate Gwalior Center button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => mapInstance?.flyTo([cityConfig.center.latitude, cityConfig.center.longitude], 13, { duration: 1 })}
            className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Crosshair className="w-4 h-4" />
            <span>Center on {cityConfig.name}</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          3. MAIN LEAFLET MAP CANVAS (HERO ELEMENT)
          ===================================================================== */}
      <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-300 shadow-md">
        <MapContainer
          center={center}
          zoom={cityConfig.zoom}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
          attributionControl={true}
        >
          {/* ── OSM Base Tile Layer ── */}
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />

          {/* ── LAYER 0: Environmental Incidents (Incident Engine) ── */}
          {showIncidents && incidents.map((inc) => {
            const markerColor = inc.severity === 'critical' ? '#dc2626' : inc.severity === 'high' ? '#e11d48' : inc.severity === 'medium' ? '#ea580c' : '#2563eb';

            return (
              <CircleMarker
                key={`inc-${inc.id}`}
                center={[inc.latitude, inc.longitude]}
                radius={13}
                pathOptions={{
                  color: '#ffffff',
                  weight: 3,
                  fillColor: markerColor,
                  fillOpacity: 0.95,
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedEntity({
                      type: 'incident',
                      title: inc.title,
                      categoryLabel: 'Environmental Incident',
                      locationText: `${inc.latitude.toFixed(6)}° N, ${inc.longitude.toFixed(6)}° E`,
                      coordinates: { lat: inc.latitude, lng: inc.longitude },
                      timestamp: inc.detected_at,
                      source: inc.origin,
                      status: inc.status,
                      incidentData: inc,
                      attributes: [
                        { label: 'Incident ID', value: inc.incident_id },
                        { label: 'Classification', value: inc.incident_type.replace(/_/g, ' ') },
                        { label: 'Severity', value: `${inc.severity.toUpperCase()}` },
                        { label: 'Response Status', value: inc.status.replace(/_/g, ' ').toUpperCase() },
                        { label: 'Location', value: inc.location_name },
                        { label: 'Assigned Unit', value: inc.assigned_officer || 'Municipal Squad' },
                        { label: 'Corroborated Signals', value: `${inc.evidence_items.length} signals` },
                      ],
                    });
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <div className="text-xs font-bold leading-tight">
                    <div className="text-rose-600 uppercase font-mono text-[10px]">{inc.incident_id} • {inc.severity}</div>
                    <div>{inc.title}</div>
                    <div className="text-[10px] text-slate-500 font-normal">Status: {inc.status.replace(/_/g, ' ')}</div>
                  </div>
                </Tooltip>

                <Popup className="saamek-station-popup">
                  <div className="p-1.5 space-y-2 text-xs min-w-[270px] max-w-[320px]">
                    <div className="border-b border-slate-200 pb-1.5 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                          {inc.incident_id}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                          {inc.severity} Severity
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug pt-1">
                        {inc.title}
                      </h4>
                      <div className="text-[11px] text-slate-600">
                        Location: <strong>{inc.location_name}</strong>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Status:</span>
                        <span className="font-bold uppercase font-mono text-sky-900">{inc.status.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500">Evidence Signals:</span>
                        <span className="font-mono font-semibold text-slate-800">{inc.evidence_items.length} verified signals</span>
                      </div>
                    </div>

                    {onInspectIncident && (
                      <button
                        onClick={() => onInspectIncident(inc)}
                        className="w-full mt-2 py-1.5 px-3 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                        <span>Inspect & Update Response</span>
                      </button>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* ── LAYER 0.5: Citizen Reports (Crowdsourced Ingestion) ── */}
          {showCitizenReports && citizenReports.map((cr) => (
            <CircleMarker
              key={`cr-${cr.id}`}
              center={[cr.latitude, cr.longitude]}
              radius={8}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillColor: '#d97706', // Amber-600
                fillOpacity: 0.95,
              }}
              eventHandlers={{
                click: () => {
                  setSelectedEntity({
                    type: 'citizen_report',
                    title: cr.title,
                    categoryLabel: 'Citizen Report',
                    locationText: `${cr.latitude.toFixed(6)}° N, ${cr.longitude.toFixed(6)}° E`,
                    coordinates: { lat: cr.latitude, lng: cr.longitude },
                    timestamp: cr.submitted_at,
                    source: 'Citizen Crowdsourced',
                    status: cr.status,
                    citizenReportData: cr,
                    attributes: [
                      { label: 'Report ID', value: cr.report_id },
                      { label: 'Category', value: cr.report_type.replace(/_/g, ' ') },
                      { label: 'Triage Status', value: cr.status.replace(/_/g, ' ').toUpperCase() },
                      { label: 'Location', value: cr.location_name },
                      { label: 'Submitted By', value: cr.citizen_name || 'Citizen' },
                      { label: 'Submission Time', value: formatTimestamp(cr.submitted_at) },
                    ],
                  });
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                <div className="text-xs font-bold leading-tight">
                  <div className="text-amber-700 uppercase font-mono text-[10px]">{cr.report_id} • {cr.status.replace(/_/g, ' ')}</div>
                  <div>{cr.title}</div>
                </div>
              </Tooltip>

              <Popup className="saamek-station-popup">
                <div className="p-1.5 space-y-2 text-xs min-w-[250px] max-w-[300px]">
                  <div className="border-b border-slate-200 pb-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                        {cr.report_id}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        {cr.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 leading-snug pt-1">
                      {cr.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3">{cr.description}</p>
                  <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-100">
                    Location: {cr.location_name}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* ── LAYER 1: AQ Monitoring Stations (Dynamic OpenAQ discovery) ── */}
          {showStations && stationsList.map((st) => {
            const measurements = st.latestMeasurements || st.pollutantList || [];
            const hasMeasurements = measurements.length > 0;
            const distinctSensors = Array.from(
              new Set((st.sensors || []).map((s) => s.parameter.toUpperCase()))
            );

            return (
              <CircleMarker
                key={st.id}
                center={[st.latitude, st.longitude]}
                radius={10}
                pathOptions={{
                  color: '#ffffff',
                  weight: 2.5,
                  fillColor: '#0284c7', // Sky-600
                  fillOpacity: 0.95,
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedEntity({
                      type: 'station',
                      title: st.name,
                      categoryLabel: 'Air Quality Monitoring Station',
                      locationText: `${st.latitude.toFixed(6)}° N, ${st.longitude.toFixed(6)}° E`,
                      coordinates: { lat: st.latitude, lng: st.longitude },
                      timestamp: st.measurementTime,
                      source: 'OpenAQ',
                      status: st.status || 'Active Monitoring',
                      stationData: st,
                      attributes: [
                        { label: 'Location', value: 'Gwalior, Madhya Pradesh, India' },
                        { label: 'Station Name', value: st.name },
                        { label: 'Provider', value: st.provider || 'CPCB' },
                        { label: 'Exact Latitude', value: `${st.latitude.toFixed(6)}° N` },
                        { label: 'Exact Longitude', value: `${st.longitude.toFixed(6)}° E` },
                        { label: 'Data Source', value: 'OpenAQ' },
                        {
                          label: 'Measurement Status',
                          value: hasMeasurements
                            ? `${measurements.length} live pollutant readings`
                            : 'No current measurement',
                        },
                      ],
                    });
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <div className="text-xs font-bold leading-tight">
                    <div>{st.name}</div>
                    <div className="text-[10px] text-slate-600 font-normal">Gwalior, Madhya Pradesh, India</div>
                    <div className="text-[10px] text-sky-600 font-mono">Source: OpenAQ</div>
                  </div>
                </Tooltip>

                <Popup className="saamek-station-popup">
                  <div className="p-1.5 space-y-2.5 text-xs min-w-[270px] max-w-[320px]">
                    {/* Header: Station Name, Location, Provider, Coordinates */}
                    <div className="border-b border-slate-200 pb-2">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider font-mono">
                          AQ Monitoring Station
                        </span>
                        <span className="text-[9px] font-bold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono">
                          Source: OpenAQ
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">
                        {st.name}
                      </h4>
                      <div className="text-[11px] text-slate-700 mt-1">
                        Location: <strong>Gwalior, Madhya Pradesh, India</strong>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Provider: <strong>{st.provider || 'CPCB'}</strong>
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                        Exact Coordinates: {st.latitude.toFixed(6)}° N, {st.longitude.toFixed(6)}° E
                      </div>
                    </div>

                    {/* Available Sensors / Pollutants */}
                    {distinctSensors.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                          Available Sensors / Pollutants ({distinctSensors.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {distinctSensors.map((p, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded font-mono font-semibold"
                            >
                              {formatPollutantName(p)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Latest Pollutant Telemetry */}
                    <div className="pt-2 border-t border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                          Pollutant Telemetry
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          Source: OpenAQ
                        </span>
                      </div>

                      {hasMeasurements ? (
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                          {measurements.map((m: any, idx: number) => {
                            const rawParam = m.parameter || m.label || '';
                            const pName = formatPollutantName(rawParam);
                            const measTime = m.measured_at || m.measuredAt;

                            return (
                              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-2 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-900">
                                    {pName}
                                  </span>
                                  <div className="text-right">
                                    <span className="font-mono font-bold text-xs text-sky-900">
                                      {m.value}
                                    </span>{' '}
                                    <span className="text-[10px] text-slate-600 font-medium">{m.unit}</span>
                                  </div>
                                </div>
                                <div className="text-[9px] text-slate-500 font-mono">
                                  Last measured: {formatMeasurementTimestamp(measTime)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-medium">
                          No current measurement
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* ── LAYER 2: Satellite Fire Detections (NASA FIRMS real data) ── */}
          {showFires && firesList.map((f) => (
            <CircleMarker
              key={f.id}
              center={[f.latitude, f.longitude]}
              radius={9}
              pathOptions={{
                color: '#fef08a',
                weight: 3,
                fillColor: '#dc2626',
                fillOpacity: 0.95,
              }}
              eventHandlers={{
                click: () => {
                  setSelectedEntity({
                    type: 'fire',
                    title: `Satellite Thermal Anomaly (${f.satellite})`,
                    categoryLabel: 'Satellite Fire Detection',
                    locationText: `${f.latitude.toFixed(4)}°N, ${f.longitude.toFixed(4)}°E`,
                    coordinates: { lat: f.latitude, lng: f.longitude },
                    timestamp: f.detectionTime,
                    source: 'NASA FIRMS',
                    status: f.confidence ? `Confidence: ${f.confidence}` : 'Orbital Radiative Anomaly',
                    fireData: f,
                    attributes: [
                      { label: 'Detection Date / Time', value: f.detectionTime },
                      { label: 'Latitude', value: f.latitude.toFixed(4) },
                      { label: 'Longitude', value: f.longitude.toFixed(4) },
                      { label: 'Satellite', value: f.satellite },
                      { label: 'Confidence', value: f.confidence },
                      { label: 'Fire Radiative Power (FRP)', value: f.frp != null ? `${f.frp} MW` : 'N/A' },
                      { label: 'Source', value: 'NASA FIRMS' },
                    ],
                  });
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                <span className="text-xs font-bold">🔥 Thermal Anomaly ({f.satellite})</span>
              </Tooltip>
            </CircleMarker>
          ))}

          {/* ── LAYER 3: Derived Environmental Hotspots (only when real clusters exist) ── */}
          {showHotspots && hotspots.map((h) => (
            <Circle
              key={h.id}
              center={[h.latitude, h.longitude]}
              radius={h.radiusMeters}
              pathOptions={{
                color: '#f97316',
                weight: 2,
                fillColor: '#ea580c',
                fillOpacity: 0.18,
                dashArray: '6 4',
              }}
              eventHandlers={{
                click: () => {
                  setSelectedEntity({
                    type: 'hotspot',
                    title: h.title,
                    categoryLabel: 'Derived Environmental Hotspot',
                    locationText: `${h.latitude.toFixed(4)}°N, ${h.longitude.toFixed(4)}°E`,
                    coordinates: { lat: h.latitude, lng: h.longitude },
                    timestamp: h.lastUpdated,
                    source: 'Multi-Source Signal Correlation',
                    status: `Severity: ${h.severity.toUpperCase()}`,
                    hotspotData: h,
                    attributes: [
                      { label: 'Hotspot Title', value: h.title },
                      { label: 'Center Coordinates', value: `${h.latitude.toFixed(4)}°N, ${h.longitude.toFixed(4)}°E` },
                      { label: 'Calculated Plume Radius', value: `${h.radiusMeters / 1000} km` },
                      { label: 'Cluster Detections', value: `${h.detectionCount} points` },
                      { label: 'Explanation', value: h.explanation },
                    ],
                  });
                },
              }}
            />
          ))}

          {/* ── Captures map instance & auto-recenters on Gwalior ── */}
          <MapController onMap={setMapInstance} targetCenter={cityConfig.center} />
        </MapContainer>


        {/* ── FLOATING WEATHER HUD (Top-Left, Real Open-Meteo Gwalior data) ── */}
        {showWeather && (
          <div className="absolute top-4 left-4 z-[500] bg-slate-950/85 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl p-4 shadow-xl max-w-[280px] space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-sky-400" />
                <span>{cityConfig.name} Weather</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Open-Meteo</span>
            </div>

            {weatherData ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black font-mono text-white">
                    {weatherData.temperature}°C
                  </span>
                  <span className="text-xs font-semibold text-sky-300">
                    {weatherData.weatherCondition}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Hum: <strong>{weatherData.humidity}%</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Gauge className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Pres: <strong>{weatherData.pressure} hPa</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300 col-span-2">
                    <Compass className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Wind: <strong>{windCardinal} ({windDirDeg}°) @ {windSpeed} km/h</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>Weather data unavailable</span>
              </div>
            )}
          </div>
        )}

        {/* ── COMPACT ENVIRONMENTAL LEGEND (Bottom-Left) ── */}
        <div className="absolute bottom-8 left-4 z-[500] bg-slate-950/85 backdrop-blur-md text-white border border-slate-700/80 rounded-xl p-3.5 shadow-xl text-xs space-y-2 max-w-[280px]">
          <div className="font-bold text-[11px] text-slate-300 uppercase tracking-wider">
            Environmental Legend
          </div>
          <div className="flex flex-col gap-1.5 text-[11px] text-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block border border-white" />
              <div className="leading-tight">
                <span className="block">{stationsList.length} monitoring stations</span>
                <span className="text-[9px] text-slate-400 font-mono">Source: OpenAQ</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block border-2 border-yellow-200" />
              <span>
                {firesList.length > 0
                  ? `Satellite Fire (${firesList.length} active)`
                  : '0 satellite fire detections'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block opacity-60" />
              <span>
                {hotspots.length > 0
                  ? `Hotspots (${hotspots.length} active)`
                  : 'No significant hotspot detected'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-3 h-3 text-sky-400 inline-block" />
              <span>Wind: {windCardinal} ({windSpeed} km/h)</span>
            </div>
          </div>
        </div>

        {/* ── SELECTED ENTITY INSPECTOR PANEL (Top-Right Slide-Over) ── */}
        {selectedEntity && (
          <div className="absolute top-4 right-4 z-[600] bg-slate-900 text-white rounded-2xl p-5 shadow-2xl border border-slate-700 w-88 max-w-[calc(100vw-32px)] space-y-3.5 animate-fade-in">
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 font-mono block">
                  {selectedEntity.categoryLabel}
                </span>
                <h4 className="font-bold text-sm text-white mt-0.5 leading-snug">
                  {selectedEntity.title}
                </h4>
                {selectedEntity.stationData?.provider && (
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Provider: {selectedEntity.stationData.provider}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[420px] overflow-y-auto pr-1">
              {/* Coordinates Pill */}
              <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Coordinates</span>
                  <span className="font-mono text-xs font-bold text-white mt-0.5 block">
                    {selectedEntity.locationText}
                  </span>
                </div>
                <Crosshair className="w-4 h-4 text-sky-400" />
              </div>

              {/* AQ STATION SPECIFIC DETAILS: Detailed Sensor Telemetry View */}
              {selectedEntity.type === 'station' && selectedEntity.stationData && (() => {
                const st = selectedEntity.stationData;
                const measurements = st.latestMeasurements || st.pollutantList || [];
                const distinctSensors = Array.from(
                  new Set((st.sensors || []).map((s) => s.parameter.toUpperCase()))
                );

                return (
                  <div className="space-y-3.5">
                    {/* Location & Jurisdiction Header */}
                    <div className="p-3 rounded-xl bg-sky-950/50 border border-sky-500/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider font-mono">
                          Location
                        </span>
                        <span className="text-[10px] font-mono bg-sky-900/80 text-sky-200 border border-sky-400/40 px-2 py-0.5 rounded font-bold">
                          Source: OpenAQ
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white">
                        Gwalior, Madhya Pradesh, India
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Provider: <strong className="text-white">{st.provider || 'CPCB'}</strong>
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        Coordinates: {st.latitude.toFixed(6)}° N, {st.longitude.toFixed(6)}° E
                      </div>
                    </div>

                    {/* Available Sensors / Pollutants */}
                    <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                          Available Sensors / Pollutants
                        </span>
                        <span className="text-[10px] font-mono text-sky-400 font-bold">
                          {distinctSensors.length} registered
                        </span>
                      </div>
                      {distinctSensors.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {distinctSensors.map((p, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-900 text-sky-300 border border-slate-700 px-2 py-0.5 rounded font-mono font-medium"
                            >
                              {formatPollutantName(p)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          No registered sensors listed for this station.
                        </span>
                      )}
                    </div>

                    {/* Detailed Pollutant Telemetry */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                          Latest Pollutant Readings
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Source: OpenAQ
                        </span>
                      </div>

                      {measurements.length > 0 ? (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {measurements.map((m: any, idx: number) => {
                            const rawParam = m.parameter || m.label || '';
                            const pName = formatPollutantName(rawParam);
                            const measTime = m.measured_at || m.measuredAt;

                            return (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-slate-800/95 border border-slate-700/90 space-y-1 hover:border-slate-600 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-100">
                                    {pName}
                                  </span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="font-mono font-bold text-sm text-sky-300">
                                      {m.value}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {m.unit}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-0.5 border-t border-slate-700/50">
                                  <span>Last measured:</span>
                                  <span className="text-slate-300 font-medium">
                                    {formatMeasurementTimestamp(measTime)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs text-center font-medium">
                          No current measurement
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* SATELLITE FIRE SPECIFIC DETAILS */}
              {selectedEntity.type === 'fire' && selectedEntity.fireData && (
                <div className="space-y-1.5 bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 text-[11px]">
                  <div className="flex justify-between py-0.5 border-b border-slate-800">
                    <span className="text-slate-400">Satellite Sensor:</span>
                    <span className="font-bold text-slate-200">{selectedEntity.fireData.satellite}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-800">
                    <span className="text-slate-400">Detection Confidence:</span>
                    <span className="font-bold text-amber-300">{selectedEntity.fireData.confidence}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-800">
                    <span className="text-slate-400">Fire Radiative Power (FRP):</span>
                    <span className="font-bold text-white font-mono">
                      {selectedEntity.fireData.frp != null ? `${selectedEntity.fireData.frp} MW` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-400">Detection Timestamp:</span>
                    <span className="font-mono text-slate-200">{selectedEntity.fireData.detectionTime}</span>
                  </div>
                </div>
              )}

              {/* DERIVED HOTSPOT SPECIFIC DETAILS */}
              {selectedEntity.type === 'hotspot' && selectedEntity.hotspotData && (
                <div className="space-y-2 bg-amber-950/30 p-3 rounded-xl border border-amber-500/40 text-[11px]">
                  <span className="font-bold text-amber-300 block">Hotspot Derivation Details</span>
                  <p className="text-slate-300 leading-relaxed">{selectedEntity.hotspotData.explanation}</p>
                  <div className="flex justify-between text-slate-400 pt-1 border-t border-amber-500/20">
                    <span>Source Signals:</span>
                    <span className="font-bold text-slate-200">{selectedEntity.hotspotData.sources.join(', ')}</span>
                  </div>
                </div>
              )}

              {/* Standard Attributes List */}
              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                {selectedEntity.attributes.map((attr, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] py-0.5">
                    <span className="text-slate-400">{attr.label}:</span>
                    <span className="font-semibold text-slate-200 text-right">{attr.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-0.5">
                <div>Source: <strong className="text-slate-200">{selectedEntity.source}</strong></div>
                <div>Status: <span className="text-emerald-400 font-semibold">{selectedEntity.status}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          4. "VIEW ALL GWALIOR STATIONS" SLIDE-OVER DRAWER (Section 10)
          ===================================================================== */}
      {showStationListDrawer && (
        <div className="fixed inset-0 z-[1200] flex justify-end bg-slate-950/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 font-mono">
                  City Ambient Monitoring Grid
                </span>
                <h3 className="font-bold text-lg text-slate-900">
                  {cityConfig.name} AQ Stations ({stationsList.length})
                </h3>
              </div>
              <button
                onClick={() => setShowStationListDrawer(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Telemetry Discovery Summary */}
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  Dynamic Discovery Scope: {cityConfig.name} Bounding Box
                </span>
                <p className="text-[11px] text-sky-900 leading-relaxed">
                  OpenAQ API v3 dynamically queries all coordinates within {cityConfig.radiusMeters / 1000} km of Gwalior center.
                </p>
              </div>

              {/* Discovered Stations List */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Discovered OpenAQ Locations ({stationsList.length})
                </span>

                {stationsList.length > 0 ? (
                  stationsList.map((st) => {
                    const measurements = st.latestMeasurements || st.pollutantList || [];
                    const hasMeasurements = measurements.length > 0;

                    return (
                      <div
                        key={st.id}
                        onClick={() => {
                          setShowStationListDrawer(false);
                          mapInstance?.flyTo([st.latitude, st.longitude], 14, { duration: 1 });
                          setSelectedEntity({
                            type: 'station',
                            title: st.name,
                            categoryLabel: 'Air Quality Monitoring Station',
                            locationText: `${st.latitude.toFixed(6)}° N, ${st.longitude.toFixed(6)}° E`,
                            coordinates: { lat: st.latitude, lng: st.longitude },
                            timestamp: st.measurementTime,
                            source: 'OpenAQ',
                            status: st.status || 'Active Monitoring',
                            stationData: st,
                            attributes: [
                              { label: 'Location', value: 'Gwalior, Madhya Pradesh, India' },
                              { label: 'Station Name', value: st.name },
                              { label: 'Provider', value: st.provider || 'CPCB' },
                              { label: 'Exact Latitude', value: `${st.latitude.toFixed(6)}° N` },
                              { label: 'Exact Longitude', value: `${st.longitude.toFixed(6)}° E` },
                              { label: 'Data Source', value: 'OpenAQ' },
                              {
                                label: 'Measurement Status',
                                value: hasMeasurements
                                  ? `${measurements.length} live pollutant readings`
                                  : 'No current measurement',
                              },
                            ],
                          });
                        }}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 cursor-pointer transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">{st.name}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {st.latitude.toFixed(6)}° N, {st.longitude.toFixed(6)}° E
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                          <span>Location: <strong>Gwalior, Madhya Pradesh, India</strong></span>
                          <span className="text-sky-800 font-mono text-[10px]">Source: OpenAQ</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <Info className="w-6 h-6 text-slate-400 mx-auto" />
                    <span className="font-bold text-xs text-slate-700 block">
                      {stations.status === 'error'
                        ? 'OpenAQ Authentication Error (HTTP 401)'
                        : 'No OpenAQ stations currently discovered'}
                    </span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {stations.status === 'error'
                        ? stations.errorMessage
                        : 'When OpenAQ returns stations inside the Gwalior perimeter, they will appear dynamically.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Reference MPPCB Stations validation list */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Official MPPCB Reference Stations (Validation Benchmarks)
                </span>
                <div className="space-y-2">
                  {cityConfig.referenceStations.map((ref, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-800 block">{ref.name}</span>
                        <span className="text-[10px] text-slate-500 block">{ref.authority}</span>
                      </div>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                        Reference
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
              <span className="text-slate-500">Source: OpenAQ API v3</span>
              <button
                onClick={() => setShowStationListDrawer(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-1.5 px-4 rounded-xl cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          5. 5-LAYER TELEMETRY STATUS FOOTNOTES (Truthful data representation)
          ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs text-slate-600">
        {/* 1. AQ Stations */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-sky-600" />
            AQ Monitoring Stations
          </span>
          <span className="text-slate-500 block text-[11px]">
            {stations.status === 'success'
              ? `${stationsList.length} monitoring stations`
              : stations.status === 'empty'
              ? '0 monitoring stations (clean baseline)'
              : stations.status === 'loading'
              ? 'Connecting to backend...'
              : 'Backend offline / error'}
          </span>
          <span className="text-[10px] text-sky-700 font-mono font-semibold">Source: OpenAQ</span>
        </div>

        {/* 2. NASA FIRMS Fires */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            Satellite Fires ({cityConfig.name})
          </span>
          <span className="text-slate-500 block text-[11px]">
            {fires.status === 'success'
              ? firesList.length > 0
                ? `${firesList.length} Thermal Anomaly Detections`
                : '0 satellite fire detections in selected period'
              : fires.status === 'loading'
              ? 'Querying NASA FIRMS...'
              : 'FIRMS Telemetry Error'}
          </span>
        </div>

        {/* 3. Hotspots */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Hotspot Analysis
          </span>
          <span className="text-slate-500 block text-[11px]">
            {hotspots.length > 0
              ? `${hotspots.length} Active Hotspot Clusters`
              : 'No significant environmental hotspot detected'}
          </span>
        </div>

        {/* 4. Weather */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <CloudSun className="w-3.5 h-3.5 text-indigo-600" />
            Weather Telemetry
          </span>
          <span className="text-slate-500 block text-[11px]">
            {weatherData
              ? `${weatherData.temperature}°C · ${weatherData.weatherCondition}`
              : 'Weather data unavailable'}
          </span>
        </div>

        {/* 5. Wind */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-teal-700" />
            Wind Dispersion
          </span>
          <span className="text-slate-500 block text-[11px]">
            {weatherData
              ? `${windCardinal} (${windDirDeg}°) @ ${windSpeed} km/h`
              : 'Wind data unavailable'}
          </span>
        </div>
      </div>
    </div>
  );
};
