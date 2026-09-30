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
    <div className="space-y-5">
      {/* ===== HERO HEADER ===== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0f2744] to-[#0a1e3d] shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-2 bg-rose-500/20 rounded-xl border border-rose-400/30 inline-flex">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Environmental Incident &amp; Response Management
                </h1>
                <span className="inline-flex items-center text-[11px] font-bold text-sky-300 bg-sky-500/15 border border-sky-400/30 px-3 py-1 rounded-full font-mono">
                  Operational Workflow
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Track, assess, corroborate evidence, and progress environmental anomalies through verification and tactical response.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={loadIncidents}
                disabled={loading}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[13px] font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white text-[13px] font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Register Incident
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search incident ID, title, jurisdiction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 focus:outline-none transition-all"
            />
          </div>

          <div className="md:col-span-5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap mr-1">Status:</span>
            {['all', 'detected', 'verified', 'investigating', 'response_initiated', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-[11px] rounded-full font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  statusFilter === st
                    ? 'bg-[#003366] text-white border-[#003366] shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st === 'all' ? 'All' : st.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>

          <div className="md:col-span-3 flex items-center gap-1.5 flex-wrap justify-end">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap mr-1">Severity:</span>
            {['all', 'critical', 'high', 'medium', 'low'].map((sev) => {
              const activeColor = sev === 'critical' ? 'bg-rose-600 border-rose-600 text-white' :
                sev === 'high' ? 'bg-amber-500 border-amber-500 text-white' :
                sev === 'medium' ? 'bg-sky-600 border-sky-600 text-white' :
                sev === 'low' ? 'bg-emerald-600 border-emerald-600 text-white' :
                'bg-slate-800 border-slate-800 text-white';
              return (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 text-[11px] rounded-full font-bold capitalize transition-all cursor-pointer border ${
                    severityFilter === sev
                      ? activeColor
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {sev}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {filteredIncidents.length > 0 ? (
          filteredIncidents.map((inc) => {
            const severityBorderColor =
              inc.severity === 'critical' ? 'border-l-rose-600' :
              inc.severity === 'high' ? 'border-l-amber-500' :
              inc.severity === 'medium' ? 'border-l-sky-500' :
              'border-l-emerald-500';
            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`bg-white border border-slate-200 border-l-4 ${severityBorderColor} hover:border-slate-300 rounded-2xl p-5 transition-all cursor-pointer hover:shadow-md group`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-bold text-[#003366] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                      {inc.incident_id}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getSeverityBadge(inc.severity)}`}>
                      {inc.severity} Severity
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(inc.status)}`}>
                      {inc.status.replace(/_/g, ' ')}
                    </span>
                    {inc.is_test_data && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300 px-1.5 py-0.5 rounded-full font-mono">
                        [DEMO TEST]
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatTimestamp(inc.detected_at)}
                  </div>
                </div>

                <div className="mb-3">
                  <h3 className="font-bold text-[14px] text-slate-900 leading-snug group-hover:text-[#003366] transition-colors">{inc.title}</h3>
                  <p className="text-[12px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{inc.description}</p>
                </div>

                {/* Multi-source Indicators Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <strong className="text-slate-700">{inc.location_name}</strong>
                    </span>
                    {inc.pm25_value != null && (
                      <span className="flex items-center gap-1 font-mono text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                        <Radio className="w-3 h-3 text-sky-500" />
                        PM2.5: <strong>{inc.pm25_value} µg/m³</strong>
                      </span>
                    )}
                    {inc.wind_cardinal && (
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <Wind className="w-3 h-3 text-sky-500" />
                        {inc.wind_cardinal} @ {inc.wind_speed} km/h
                      </span>
                    )}
                    <span className="font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                      {inc.evidence_items.length} Signal{inc.evidence_items.length !== 1 ? 's' : ''} Corroborated
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-[12px] text-[#003366] group-hover:text-sky-700 transition-colors">
                    Inspect Details
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-200">
              <AlertTriangle className="w-7 h-7 text-slate-300" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-slate-700">No Active Incidents Detected</h3>
              <p className="text-[12px] text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                There are currently no active environmental incidents matching the selected filters in the Gwalior jurisdiction.
              </p>
            </div>
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
