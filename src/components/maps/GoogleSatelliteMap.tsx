import React, { useEffect, useRef, useState, useCallback } from 'react';
import type {
  UserCoordinates,
  AQStationMarker,
  FireDetectionMarker,
} from '../../types/environmental';
import type { CitizenReport, GovIncident } from '../../types';
import {
  MapPin,
  Flame,
  Radio,
  FileText,
  Layers,
  Crosshair,
  RefreshCw,
} from 'lucide-react';

interface GoogleSatelliteMapProps {
  userLocation: UserCoordinates | null;
  stations: AQStationMarker[];
  fires: FireDetectionMarker[];
  reports: CitizenReport[];
  incidents?: GovIncident[];
  stationsStatus?: string;
  firesStatus?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

declare global {
  interface Window {
    google?: any;
    __googleMapsLoadingPromise?: Promise<void>;
  }
}

// Helper to dynamically load Google Maps JS API script safely once
function loadGoogleMapsApi(apiKey: string): Promise<void> {
  if (window.google && window.google.maps) {
    return Promise.resolve();
  }
  if (window.__googleMapsLoadingPromise) {
    return window.__googleMapsLoadingPromise;
  }

  window.__googleMapsLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });

  return window.__googleMapsLoadingPromise;
}

export const GoogleSatelliteMap: React.FC<GoogleSatelliteMapProps> = ({
  userLocation,
  stations,
  fires,
  reports,
  incidents,
  onRefresh,
  isRefreshing = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const infoWindowRef = useRef<any>(null);

  const [, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeMapType, setActiveMapType] = useState<'hybrid' | 'satellite' | 'roadmap'>('hybrid');

  // Layer toggles
  const [showLocation, setShowLocation] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showFires, setShowFires] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isKeyConfigured = Boolean(apiKey && apiKey.trim() !== '');

  const centerLat = userLocation?.latitude ?? 28.6139;
  const centerLng = userLocation?.longitude ?? 77.2090;

  // Initialize or re-center Google Map
  useEffect(() => {
    if (!isKeyConfigured || !mapContainerRef.current) return;

    loadGoogleMapsApi(apiKey)
      .then(() => {
        if (!mapContainerRef.current || !window.google?.maps) return;

        if (!mapInstanceRef.current) {
          const map = new window.google.maps.Map(mapContainerRef.current, {
            center: { lat: centerLat, lng: centerLng },
            zoom: 14,
            mapTypeId: activeMapType,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            rotateControl: true,
            scaleControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          });

          mapInstanceRef.current = map;
          infoWindowRef.current = new window.google.maps.InfoWindow();
          setMapLoaded(true);
        }
      })
      .catch((err) => {
        console.warn('Failed to load Google Maps SDK:', err);
        setLoadError(
          'Unable to load Google Maps satellite tiles with the provided key. Please verify VITE_GOOGLE_MAPS_API_KEY.'
        );
      });
  }, [apiKey, isKeyConfigured, centerLat, centerLng, activeMapType]);

  // Update map type
  useEffect(() => {
    if (mapInstanceRef.current && window.google?.maps) {
      mapInstanceRef.current.setMapTypeId(activeMapType);
    }
  }, [activeMapType]);

  // Render & Sync Markers on Google Maps
  const syncMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return;
    const map = mapInstanceRef.current;
    const infoWindow = infoWindowRef.current;

    // Clear previous markers
    Object.values(markersRef.current).forEach((m: any) => m.setMap(null));
    markersRef.current = {};

    // 1. Current Location Marker
    if (showLocation && userLocation) {
      const pos = { lat: userLocation.latitude, lng: userLocation.longitude };
      const locMarker = new window.google.maps.Marker({
        position: pos,
        map,
        title: 'You are here (Current Location)',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#0284c7', // Sky-600
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        zIndex: 999,
      });

      locMarker.addListener('click', () => {
        infoWindow.setContent(`
          <div style="padding: 8px; font-family: sans-serif; color: #0f172a; max-width: 240px;">
            <div style="display: flex; align-items: center; gap: 6px; font-weight: bold; color: #003366; font-size: 14px;">
              📍 You Are Here
            </div>
            <div style="font-size: 12px; color: #475569; margin-top: 4px;">
              ${userLocation.locality || userLocation.formattedAddress || 'Detected Location'}
            </div>
            <div style="font-size: 11px; font-family: monospace; color: #64748b; margin-top: 4px;">
              ${userLocation.latitude.toFixed(5)}°N, ${userLocation.longitude.toFixed(5)}°E (±${Math.round(userLocation.accuracy)}m)
            </div>
          </div>
        `);
        infoWindow.open(map, locMarker);
      });

      markersRef.current['user-location'] = locMarker;
    }

    // 2. Real AQ Station Markers
    if (showStations) {
      stations.forEach((st) => {
        const marker = new window.google.maps.Marker({
          position: { lat: st.latitude, lng: st.longitude },
          map,
          title: st.name,
          icon: {
            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: '#2563eb', // Blue
            fillOpacity: 0.95,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        marker.addListener('click', () => {
          infoWindow.setContent(`
            <div style="padding: 8px; font-family: sans-serif; color: #0f172a; max-width: 260px;">
              <div style="font-weight: bold; color: #1e3a8a; font-size: 14px;">
                🏢 ${st.name}
              </div>
              <div style="font-size: 12px; color: #475569; margin-top: 2px;">
                ${st.status} ${st.distanceKm ? `• ${st.distanceKm} km away` : ''}
              </div>
              <div style="margin-top: 6px; font-size: 11px; background: #eff6ff; padding: 4px 6px; border-radius: 4px; border: 1px solid #bfdbfe;">
                Source: <strong>${st.source}</strong><br/>
                Last Recorded: ${st.measurementTime}
              </div>
            </div>
          `);
          infoWindow.open(map, marker);
        });

        markersRef.current[`station-${st.id}`] = marker;
      });
    }

    // 3. Real NASA FIRMS Satellite Fire Detections
    if (showFires) {
      fires.forEach((f) => {
        const marker = new window.google.maps.Marker({
          position: { lat: f.latitude, lng: f.longitude },
          map,
          title: `Satellite Fire Anomaly (${f.confidence})`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#dc2626', // Red
            fillOpacity: 0.9,
            strokeColor: '#fef08a', // Yellow outline
            strokeWeight: 3,
          },
        });

        marker.addListener('click', () => {
          infoWindow.setContent(`
            <div style="padding: 8px; font-family: sans-serif; color: #0f172a; max-width: 260px;">
              <div style="font-weight: bold; color: #b91c1c; font-size: 14px; display: flex; align-items: center; gap: 4px;">
                🔥 Satellite Thermal Anomaly
              </div>
              <div style="font-size: 12px; color: #475569; margin-top: 4px;">
                Confidence: <strong style="color: #991b1b;">${f.confidence}</strong>
                ${f.frp ? `• FRP: <strong>${f.frp} MW</strong>` : ''}
              </div>
              <div style="margin-top: 6px; font-size: 11px; background: #fef2f2; padding: 4px 6px; border-radius: 4px; border: 1px solid #fecaca;">
                Satellite: <strong>${f.satellite}</strong><br/>
                Acquisition: ${f.detectionTime}<br/>
                Telemetry: <strong>${f.source}</strong>
              </div>
            </div>
          `);
          infoWindow.open(map, marker);
        });

        markersRef.current[`fire-${f.id}`] = marker;
      });
    }

    // 4. Stored Citizen Reports
    if (showReports) {
      reports.forEach((rep) => {
        // Use exact stored coordinates or fallback to nearby offset for visual representation
        const repLat = rep.coordinates?.latitude ?? centerLat;
        const repLng = rep.coordinates?.longitude ?? centerLng;

        const marker = new window.google.maps.Marker({
          position: { lat: repLat, lng: repLng },
          map,
          title: `Report: ${rep.category.toUpperCase()}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#16a34a', // Green
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        marker.addListener('click', () => {
          infoWindow.setContent(`
            <div style="padding: 8px; font-family: sans-serif; color: #0f172a; max-width: 260px;">
              <div style="font-weight: bold; color: #166534; font-size: 14px;">
                📋 Citizen Report: ${rep.category.toUpperCase()}
              </div>
              <div style="font-size: 12px; color: #334155; margin-top: 3px;">
                <strong>ID:</strong> ${rep.id} • <strong>Status:</strong> ${rep.status}
              </div>
              <div style="font-size: 11px; color: #475569; margin-top: 4px;">
                ${rep.description}
              </div>
              <div style="margin-top: 6px; font-size: 10px; color: #64748b;">
                📍 ${rep.location} • Submitted: ${rep.submittedDate}
              </div>
            </div>
          `);
          infoWindow.open(map, marker);
        });

        markersRef.current[`rep-${rep.id}`] = marker;
      });
    }

    // 5. Government Tactical Incidents Layer
    if (showIncidents && incidents && incidents.length > 0) {
      incidents.forEach((inc) => {
        const incLat = inc.coordinates?.latitude ?? centerLat;
        const incLng = inc.coordinates?.longitude ?? centerLng;
        const isCritical = inc.severity === 'Critical';

        const marker = new window.google.maps.Marker({
          position: { lat: incLat, lng: incLng },
          map,
          title: `[${inc.priority}] ${inc.title}`,
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 8,
            fillColor: isCritical ? '#e11d48' : '#d97706', // Rose / Amber
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2.5,
          },
          zIndex: 900,
        });

        marker.addListener('click', () => {
          infoWindow.setContent(`
            <div style="padding: 8px; font-family: sans-serif; color: #0f172a; max-width: 280px;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
                <span style="font-family: monospace; font-size: 11px; font-weight: bold; background: #003366; color: #ffffff; padding: 2px 6px; border-radius: 4px;">
                  ${inc.id}
                </span>
                <span style="font-size: 10px; font-weight: bold; background: ${isCritical ? '#ffe4e6' : '#fef3c7'}; color: ${isCritical ? '#9f1239' : '#92400e'}; padding: 2px 6px; border-radius: 4px;">
                  ${inc.priority}
                </span>
              </div>
              <div style="font-weight: bold; color: #0f172a; font-size: 13px; line-height: 1.3;">
                ${inc.title}
              </div>
              <div style="font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.3;">
                ${inc.description}
              </div>
              <div style="margin-top: 6px; font-size: 10px; background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <div>📍 <strong>Location:</strong> ${inc.location}</div>
                <div>🛡️ <strong>Authority:</strong> ${inc.assignedAuthority}</div>
                <div>📊 <strong>Status:</strong> <span style="color: #003366; font-weight: bold;">${inc.status}</span></div>
              </div>
            </div>
          `);
          infoWindow.open(map, marker);
        });

        markersRef.current[`inc-${inc.id}`] = marker;
      });
    }
  }, [
    showLocation,
    showStations,
    showFires,
    showReports,
    showIncidents,
    userLocation,
    stations,
    fires,
    reports,
    incidents,
    centerLat,
    centerLng,
  ]);

  useEffect(() => {
    syncMarkers();
  }, [syncMarkers]);

  // Center on user location ("Locate Me")
  const handleLocateMe = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
      mapInstanceRef.current.setZoom(15);
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Map Type Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveMapType('hybrid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMapType === 'hybrid'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Satellite Hybrid
          </button>
          <button
            onClick={() => setActiveMapType('satellite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMapType === 'satellite'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Pure Satellite
          </button>
          <button
            onClick={() => setActiveMapType('roadmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMapType === 'roadmap'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Topographic / Road
          </button>
        </div>

        {/* Center: Real Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Current Location Toggle */}
          <label className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-900 border border-sky-200 px-3 py-1.5 rounded-lg cursor-pointer font-semibold select-none">
            <input
              type="checkbox"
              checked={showLocation}
              onChange={(e) => setShowLocation(e.target.checked)}
              className="accent-sky-600 rounded"
            />
            <span>📍 My Location</span>
          </label>

          {/* Government Incidents Layer (when available) */}
          {incidents && incidents.length > 0 && (
            <label className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg cursor-pointer font-semibold select-none">
              <input
                type="checkbox"
                checked={showIncidents}
                onChange={(e) => setShowIncidents(e.target.checked)}
                className="accent-amber-600 rounded"
              />
              <span>⚠️ Tactical Incidents ({incidents.length})</span>
            </label>
          )}

          {/* Citizen Reports Layer */}
          <label className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-lg cursor-pointer font-semibold select-none">
            <input
              type="checkbox"
              checked={showReports}
              onChange={(e) => setShowReports(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
            <span>📋 Citizen Reports ({reports.length})</span>
          </label>

          {/* AQ Stations Layer */}
          <label
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold select-none border ${
              stations.length > 0
                ? 'bg-blue-50 text-blue-900 border-blue-200 cursor-pointer'
                : 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed opacity-75'
            }`}
          >
            <input
              type="checkbox"
              checked={showStations}
              disabled={stations.length === 0}
              onChange={(e) => setShowStations(e.target.checked)}
              className="accent-blue-600 rounded"
            />
            <span>🏢 AQ Stations ({stations.length})</span>
          </label>

          {/* NASA FIRMS Fires Layer */}
          <label
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold select-none border ${
              fires.length > 0
                ? 'bg-red-50 text-red-900 border-red-200 cursor-pointer'
                : 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed opacity-75'
            }`}
          >
            <input
              type="checkbox"
              checked={showFires}
              disabled={fires.length === 0}
              onChange={(e) => setShowFires(e.target.checked)}
              className="accent-red-600 rounded"
            />
            <span>🔥 NASA Thermal Detections ({fires.length})</span>
          </label>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {userLocation && (
            <button
              onClick={handleLocateMe}
              className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Crosshair className="w-4 h-4" />
              <span>Locate Me</span>
            </button>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Feeds</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Map Surface */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-300 shadow-md bg-slate-900">
        {/* Google Maps Container */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* When Google Maps Key is not configured: Render Informative Satellite Visual Fallback */}
        {(!isKeyConfigured || loadError) && (
          <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-[#002244] text-white">
            {/* Top Bar inside Fallback: Real Coordinates & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/80">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30">
                  <MapPin className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block">
                    Real Browser Coordinates Active
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white">
                    {userLocation?.locality || 'Detected Location'} •{' '}
                    <span className="font-mono text-xs sm:text-sm text-slate-300">
                      {centerLat.toFixed(4)}°N, {centerLng.toFixed(4)}°E
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Satellite API Key Notice
                </span>
              </div>
            </div>

            {/* Center Content: API Key Guidance & Active Real Points Summary */}
            <div className="max-w-2xl mx-auto text-center space-y-4 py-4">
              <div className="inline-flex p-3 rounded-full bg-slate-800 text-sky-400 border border-slate-700 shadow-inner">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                Interactive Google Maps Satellite Layer
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                Real environmental telemetry (Open-Meteo weather, air quality, citizen reports) is currently loaded for your exact coordinates.
                To render live Google Maps satellite tiles, set <code className="bg-slate-800 px-2 py-0.5 rounded text-sky-300 font-mono text-xs">VITE_GOOGLE_MAPS_API_KEY</code> in your <code className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono text-xs">.env</code> file.
              </p>

              {/* Real Active Data Points List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-xs text-sky-300 font-bold block">User Location</span>
                  <span className="text-sm font-bold text-white block mt-0.5 font-mono">
                    {centerLat.toFixed(3)}°, {centerLng.toFixed(3)}°
                  </span>
                  <span className="text-[11px] text-slate-400">Live GPS Accuracy ±{Math.round(userLocation?.accuracy || 50)}m</span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-xs text-emerald-300 font-bold block">Citizen Reports</span>
                  <span className="text-sm font-bold text-white block mt-0.5">
                    {reports.length} Verified Submissions
                  </span>
                  <span className="text-[11px] text-slate-400">Plotted with geo-coordinates</span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-xs text-amber-300 font-bold block">Satellite Telemetry</span>
                  <span className="text-sm font-bold text-white block mt-0.5">
                    {fires.length > 0 ? `${fires.length} Thermal Hotspots` : 'NASA FIRMS Ready'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {import.meta.env.VITE_NASA_FIRMS_API_KEY ? 'Feed Active' : 'Key Unconfigured'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom: Attribution */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Map Platform: Google Maps JavaScript API (Satellite / Hybrid)</span>
              <span>Data Telemetry: Open-Meteo • OpenAQ • NASA FIRMS</span>
            </div>
          </div>
        )}

        {/* Live Satellite Watermark & Status Pill on Bottom Right */}
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
          <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SAAMEK Satellite Environmental Surveillance Grid</span>
          </div>
        </div>
      </div>

      {/* Layer Data Source & Status Footnotes */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-slate-600">
        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
          <span className="font-bold text-slate-900 block flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            User Coordinates
          </span>
          <span className="text-slate-500 block">
            {userLocation ? 'Acquired via navigator.geolocation' : 'Default National Grid'}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
          <span className="font-bold text-slate-900 block flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            AQ Monitoring Stations
          </span>
          <span className="text-slate-500 block">
            {stations.length > 0 ? `${stations.length} Active stations (OpenAQ)` : 'Station feed: OpenAQ (Key required in .env)'}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
          <span className="font-bold text-slate-900 block flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-red-600" />
            Satellite Fire Detections
          </span>
          <span className="text-slate-500 block">
            {fires.length > 0 ? `${fires.length} VIIRS/MODIS Detections` : 'NASA FIRMS (Key required in .env)'}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
          <span className="font-bold text-slate-900 block flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            Citizen Observations
          </span>
          <span className="text-slate-500 block">
            {reports.length} Local Observations Plotted
          </span>
        </div>
      </div>
    </div>
  );
};
