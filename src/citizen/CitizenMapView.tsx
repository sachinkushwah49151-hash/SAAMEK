import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import type { AQStationMarker } from '../types/environmental';
import type { IncidentRecord, CitizenReportRecord } from '../types/incident';
import {
  fetchBackendAQStations,
  fetchIncidents,
  fetchCitizenReports,
  formatPollutantName,
  formatTimestamp,
} from '../services/saamekBackendService';
import { GWALIOR_COORDINATES } from '../config/cityConfig';
import {
  Map as MapIcon,
  Radio,
  AlertTriangle,
  FileCheck2,
  RefreshCw,
  Layers,
  Info,
  Clock,
  MapPin,
  Flame,
  ShieldCheck,
  Building2,
} from 'lucide-react';

// Marker Icons
const createStationIcon = () =>
  L.divIcon({
    className: 'custom-aq-marker',
    html: `<div style="
      background-color: #003366;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    ">📡</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const createIncidentIcon = (severity: string) => {
  const bg = severity === 'critical' || severity === 'high' ? '#dc2626' : '#ea580c';
  return L.divIcon({
    className: 'custom-incident-marker',
    html: `<div style="
      background-color: ${bg};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2.5px solid #ffffff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
    ">⚠️</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const createReportIcon = (status: string) => {
  const bg = status === 'verified' ? '#2563eb' : '#d97706';
  return L.divIcon({
    className: 'custom-report-marker',
    html: `<div style="
      background-color: ${bg};
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
    ">📍</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

export const CitizenMapView: React.FC = () => {
  const [stations, setStations] = useState<AQStationMarker[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [reports, setReports] = useState<CitizenReportRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Layer Toggles
  const [showStations, setShowStations] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showReports, setShowReports] = useState(true);

  const loadMapData = async () => {
    setLoading(true);
    try {
      const [stRes, incRes, repRes] = await Promise.allSettled([
        fetchBackendAQStations(),
        fetchIncidents(),
        fetchCitizenReports(),
      ]);

      if (stRes.status === 'fulfilled') setStations(stRes.value);
      if (incRes.status === 'fulfilled') setIncidents(incRes.value);
      if (repRes.status === 'fulfilled') setReports(repRes.value);
    } catch (err) {
      console.error('Error loading citizen map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  return (
    <div className="space-y-4">
      {/* Map Header & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-[#003366] border border-blue-100">
            <MapIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              Gwalior Environmental Map
            </h1>
            <p className="text-xs text-slate-500">
              Official OpenAQ ground stations, verified incidents, and civic reports
            </p>
          </div>
        </div>

        {/* Layer Toggles & Refresh */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowStations(!showStations)}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showStations
                ? 'bg-[#003366] text-white border-[#003366]'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <span>📡</span> Stations ({stations.length})
          </button>
          <button
            onClick={() => setShowIncidents(!showIncidents)}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showIncidents
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <span>⚠️</span> Incidents ({incidents.length})
          </button>
          <button
            onClick={() => setShowReports(!showReports)}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showReports
                ? 'bg-amber-500 text-slate-950 border-amber-500'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <span>📍</span> Reports ({reports.length})
          </button>
          <button
            onClick={loadMapData}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            title="Refresh map telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden relative" style={{ height: '580px' }}>
        <MapContainer
          center={[GWALIOR_COORDINATES.latitude, GWALIOR_COORDINATES.longitude]}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 1. AQ Monitoring Stations */}
          {showStations &&
            stations.map((st) => (
              <Marker
                key={`st-${st.id}`}
                position={[st.latitude, st.longitude]}
                icon={createStationIcon()}
              >
                <Popup>
                  <div className="p-1 space-y-2 max-w-xs">
                    <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1 flex items-center gap-1">
                      <span className="text-base">📡</span> {st.name}
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong>Provider:</strong> {st.provider}
                    </div>
                    <div className="text-xs text-slate-600 font-mono">
                      {st.latitude.toFixed(4)}°N, {st.longitude.toFixed(4)}°E
                    </div>

                    <div className="text-xs font-bold text-slate-700 mt-2">Sensor Measurements:</div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {(st.pollutantList || []).map((pollutant, idx) => (
                        <div key={idx} className="bg-slate-50 p-1.5 rounded border border-slate-200">
                          <div className="font-semibold text-slate-800">
                            {formatPollutantName(pollutant.parameter || pollutant.name || 'Pollutant')}
                          </div>
                          <div className="font-bold text-[#003366]">
                            {pollutant.value != null ? `${pollutant.value.toFixed(1)} ${pollutant.unit}` : 'No data'}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Sync: {formatTimestamp(st.measurementTime)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* 2. Official Incidents */}
          {showIncidents &&
            incidents.map((inc) => (
              <Marker
                key={`inc-${inc.id}`}
                position={[inc.latitude, inc.longitude]}
                icon={createIncidentIcon(inc.severity)}
              >
                <Popup>
                  <div className="p-1 space-y-2 max-w-xs">
                    <div className="font-bold text-rose-700 text-sm border-b border-slate-200 pb-1 flex items-center gap-1">
                      <span>⚠️</span> {inc.title}
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong>Status:</strong> <span className="capitalize font-semibold text-slate-900">{inc.status.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong>Severity:</strong> <span className="capitalize font-semibold text-rose-600">{inc.severity}</span>
                    </div>
                    <p className="text-xs text-slate-700">{inc.description}</p>
                    <div className="text-[10px] text-slate-400">
                      Incident Code: {inc.incident_id || `INC-${inc.id}`}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* 3. Citizen Reports */}
          {showReports &&
            reports.map((rep) => (
              <Marker
                key={`rep-${rep.id}`}
                position={[rep.latitude, rep.longitude]}
                icon={createReportIcon(rep.status)}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 max-w-xs">
                    <div className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">
                      📍 {rep.title || 'Citizen Report'}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>Type:</strong> {rep.report_type?.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>Status:</strong> <span className="capitalize font-semibold">{rep.status.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 line-clamp-2">{rep.description}</p>
                    <div className="text-[10px] text-slate-400">
                      Ref: {rep.report_id || `CR-${String(rep.id).substring(0, 8)}`}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {/* Bottom Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-slate-200 shadow-md text-xs space-y-1.5">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">
            Map Legend
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-3 h-3 rounded-full bg-[#003366]"></span>
            <span>OpenAQ Monitoring Station</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-3 h-3 rounded-full bg-rose-600"></span>
            <span>Official Environmental Incident</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Citizen Incident Report</span>
          </div>
        </div>
      </div>
    </div>
  );
};
