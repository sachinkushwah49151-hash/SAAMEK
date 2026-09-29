import React, { useState, useEffect } from 'react';
import type { IncidentRecord, IncidentStatus, IncidentSeverity } from '../types/incident';
import {
  fetchIncidents,
  createIncident,
  formatTimestamp,
} from '../services/saamekBackendService';
import { IncidentDetailModal } from './IncidentDetailModal';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Clock,
  Radio,
  Wind,
  ShieldAlert,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';

interface IncidentManagementViewProps {
  initialIncidentId?: string | null;
  onOpenMap?: () => void;
  officerName?: string;
}

export const IncidentManagementView: React.FC<IncidentManagementViewProps> = ({
  initialIncidentId,
  onOpenMap,
  officerName = 'Government Officer',
}) => {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [loading, setLoading] = useState(false);

  // New Incident Creation Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('air_pollution_spike');
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>('medium');
  const [newLocation, setNewLocation] = useState('Maharaj Bada, Gwalior, Madhya Pradesh, India');
  const [newLatitude, setNewLatitude] = useState(26.200388);
  const [newLongitude, setNewLongitude] = useState(78.147714);
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await fetchIncidents({
        status: statusFilter === 'all' ? undefined : statusFilter,
        severity: severityFilter === 'all' ? undefined : severityFilter,
      });
      setIncidents(data);

      if (initialIncidentId) {
        const found = data.find((i) => i.incident_id === initialIncidentId);
        if (found) setSelectedIncident(found);
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [statusFilter, severityFilter]);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) return;
    setCreating(true);
    try {
      const created = await createIncident({
        title: newTitle,
        incident_type: newType,
        severity: newSeverity,
        status: 'detected',
        confidence: 'medium',
        origin: 'environmental_anomaly',
        description: newDescription,
        latitude: newLatitude,
        longitude: newLongitude,
        location_name: newLocation,
        affected_area: 'Gwalior Airshed',
        affected_radius_meters: 1500,
        assigned_officer: officerName,
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      await loadIncidents();
      setSelectedIncident(created);
    } catch (err: any) {
      alert(`Failed to create incident: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const filteredIncidents = incidents.filter((i) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      i.title.toLowerCase().includes(term) ||
      i.incident_id.toLowerCase().includes(term) ||
      i.location_name.toLowerCase().includes(term) ||
      i.incident_type.toLowerCase().includes(term)
    );
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'medium':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'detected':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'verified':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'investigating':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'response_initiated':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Action Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#003366]" />
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Environmental Incident & Response Management
            </h1>
            <span className="text-[10px] font-mono bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 rounded font-bold">
              Operational Workflow
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track, assess, corroborate evidence, and progress environmental anomalies through verification and tactical response.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadIncidents}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-[#003366] hover:bg-[#002244] rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Incident</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search incident ID, title, jurisdiction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Status:</span>
            {['all', 'detected', 'verified', 'investigating', 'response_initiated', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-[11px] rounded-md font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#003366] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'All' : st.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>

          <div className="md:col-span-3 flex items-center gap-2 justify-end">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Severity:</span>
            {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-1 text-[11px] rounded-md font-semibold capitalize transition-all cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incidents Table / Cards List */}
      <div className="space-y-2.5">
        {filteredIncidents.length > 0 ? (
          filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => setSelectedIncident(inc)}
              className="bg-white border border-slate-200 hover:border-[#003366]/60 rounded-xl p-4 transition-all cursor-pointer hover:shadow-md space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-sky-900 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                    {inc.incident_id}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getSeverityBadge(inc.severity)}`}>
                    {inc.severity} Severity
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(inc.status)}`}>
                    {inc.status.replace(/_/g, ' ')}
                  </span>
                  {inc.is_test_data && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300 px-1.5 py-0.5 rounded font-mono">
                      [DEMO TEST]
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatTimestamp(inc.detected_at)}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-snug">{inc.title}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{inc.description}</p>
              </div>

              {/* Multi-source Indicators Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-3 text-slate-600">
                  <span className="flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <strong>{inc.location_name}</strong>
                  </span>
                  {inc.pm25_value != null && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-sky-900">
                      <Radio className="w-3 h-3 text-sky-600" />
                      PM2.5: <strong>{inc.pm25_value} µg/m³</strong>
                    </span>
                  )}
                  {inc.wind_cardinal && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-700">
                      <Wind className="w-3 h-3 text-sky-600" />
                      Vector: {inc.wind_cardinal} @ {inc.wind_speed} km/h
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {inc.evidence_items.length} Corroborated Signals
                  </span>
                </div>

                <div className="flex items-center gap-1 font-bold text-xs text-[#003366]">
                  <span>Inspect Response Details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3 shadow-xs">
            <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800">No Active Incidents Detected</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are currently no active environmental incidents matching the selected filters in the Gwalior jurisdiction.
            </p>
          </div>
        )}
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onStatusUpdated={(updated) => {
            setSelectedIncident(updated);
            loadIncidents();
          }}
          officerName={officerName}
        />
      )}

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-lg p-5 space-y-4 animate-fade-in text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900">Register Environmental Incident</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Incident Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Severe Particulate Surging near Industrial Corridor"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Incident Type:</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="air_pollution_spike">Air Pollution Spike</option>
                    <option value="potential_open_burning">Potential Open-Burning</option>
                    <option value="waste_dumping_hazard">Waste Dumping Hazard</option>
                    <option value="industrial_emission">Industrial Emission</option>
                    <option value="water_contamination">Water Contamination</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Severity Level:</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as IncidentSeverity)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Location Name:</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Description & Narrative:</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide incident context, observed smoke/emissions, and immediate tactical actions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#003366] hover:bg-[#002244] rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {creating ? 'Registering...' : 'Register Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
