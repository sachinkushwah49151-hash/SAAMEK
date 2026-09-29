import React, { useState } from 'react';
import type { IncidentRecord, IncidentStatus } from '../types/incident';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wind,
  Radio,
  Flame,
  Clock,
  MapPin,
  ShieldAlert,
  Send,
  History,
  Compass,
  FileText,
  User,
} from 'lucide-react';
import { formatTimestamp, updateIncidentStatus } from '../services/saamekBackendService';

interface IncidentDetailModalProps {
  incident: IncidentRecord;
  onClose: () => void;
  onStatusUpdated?: (updated: IncidentRecord) => void;
  officerName?: string;
}

const STATUS_STEPS: { key: IncidentStatus; label: string; step: number }[] = [
  { key: 'detected', label: 'Detected', step: 1 },
  { key: 'verified', label: 'Verified', step: 2 },
  { key: 'investigating', label: 'Investigating', step: 3 },
  { key: 'response_initiated', label: 'Response Initiated', step: 4 },
  { key: 'resolved', label: 'Resolved', step: 5 },
];

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onStatusUpdated,
  officerName = 'Government Officer',
}) => {
  const [currentIncident, setCurrentIncident] = useState<IncidentRecord>(incident);
  const [updatingStatus, setUpdatingStatus] = useState<IncidentStatus | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === currentIncident.status);

  const handleUpdateStatus = async (targetStatus: IncidentStatus) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const updated = await updateIncidentStatus(
        currentIncident.incident_id,
        targetStatus,
        statusNote.trim() || `Status updated to ${targetStatus.replace('_', ' ')} by ${officerName}`,
        officerName
      );
      setCurrentIncident(updated);
      setUpdatingStatus(null);
      setStatusNote('');
      onStatusUpdated?.(updated);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const getConfidenceBadge = (conf: string) => {
    switch (conf.toLowerCase()) {
      case 'high':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'medium':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 animate-fade-in">
        {/* Modal Header */}
        <div className="bg-[#003366] text-white px-5 py-4 flex items-center justify-between border-b border-[#002244]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-[#0a274c] text-sky-300 px-2 py-0.5 rounded border border-sky-600/40">
                {currentIncident.incident_id}
              </span>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getSeverityBadge(currentIncident.severity)}`}>
                {currentIncident.severity} Severity
              </span>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getConfidenceBadge(currentIncident.confidence)}`}>
                {currentIncident.confidence} Confidence
              </span>
              {currentIncident.is_test_data && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400 px-2 py-0.5 rounded font-mono">
                  [DEMO TEST DATA]
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold leading-tight text-white">
              {currentIncident.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Section 1: Response Status Lifecycle Pipeline */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Operational Response Progression
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Current Status: <strong className="text-sky-900 uppercase font-mono">{currentIncident.status.replace('_', ' ')}</strong>
              </span>
            </div>

            {/* Step Pipeline Bar */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
              {STATUS_STEPS.map((s, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <button
                    key={s.key}
                    onClick={() => setUpdatingStatus(s.key)}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isCurrent
                        ? 'bg-[#003366] text-white border-[#003366] ring-2 ring-[#003366]/30 font-bold'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-medium'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <span className="text-[10px] font-mono">{s.step}</span>
                    <span className="text-xs">{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Status Update Form */}
            {updatingStatus && (
              <div className="mt-3 p-3 bg-white border border-sky-200 rounded-lg space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-sky-950">
                    Transition status to: <span className="uppercase text-sky-700">{updatingStatus.replace('_', ' ')}</span>
                  </span>
                  <button
                    onClick={() => setUpdatingStatus(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Add operational notes or officer response remarks..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                />
                {errorMsg && (
                  <div className="text-rose-600 text-xs font-semibold">{errorMsg}</div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setUpdatingStatus(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-md hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(updatingStatus)}
                    disabled={isSubmitting}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#003366] hover:bg-[#002244] rounded-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? 'Updating...' : 'Confirm Status Update'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Incident Summary & Geographic Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono block">
                Incident Identification
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Incident Type:</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {currentIncident.incident_type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Primary Origin:</span>
                  <span className="font-semibold text-slate-900 capitalize font-mono">
                    {currentIncident.origin.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Assigned Officer / Unit:</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-sky-700" />
                    {currentIncident.assigned_officer || 'Unassigned'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Detection Timestamp:</span>
                  <span className="font-mono text-slate-800">
                    {formatTimestamp(currentIncident.detected_at)}
                  </span>
                </div>
                {currentIncident.citizen_report_id && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Linked Citizen Report:</span>
                    <span className="font-mono font-bold text-sky-700">
                      {currentIncident.citizen_report_id}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono block">
                Geographic Jurisdiction
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-start gap-2 py-1 border-b border-slate-100">
                  <MapPin className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">{currentIncident.location_name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {currentIncident.latitude.toFixed(6)}° N, {currentIncident.longitude.toFixed(6)}° E
                    </span>
                  </div>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Affected Airshed Area:</span>
                  <span className="font-semibold text-slate-900">{currentIncident.affected_area}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Impact Perimeter Radius:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {currentIncident.affected_radius_meters} meters (~{(currentIncident.affected_radius_meters / 1000).toFixed(1)} km)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Evidence Checklist (Multi-Source Corroboration) */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-sky-700" />
                Multi-Source Evidence Checklist ({currentIncident.evidence_items.length} Corroborations)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Rule-Based Synthesis
              </span>
            </div>

            <div className="space-y-2">
              {currentIncident.evidence_items.length > 0 ? (
                currentIncident.evidence_items.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
                      ev.is_supporting
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {ev.is_supporting ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{ev.title}</span>
                        <span className="text-[10px] font-mono text-slate-500 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
                          Source: {ev.source}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>
                      {ev.value_text && (
                        <span className="text-[11px] font-mono font-semibold text-slate-800 block pt-0.5">
                          Evidence Value: {ev.value_text}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-slate-50 text-slate-500 rounded-lg text-center text-xs">
                  No explicit evidence items attached.
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Environmental Context & Impact Direction View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Environmental Readings */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-sky-700" />
                Environmental Telemetry Context
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Nearby PM2.5</span>
                  <span className="text-sm font-bold font-mono text-slate-900">
                    {currentIncident.pm25_value != null ? `${currentIncident.pm25_value} µg/m³` : 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">Source: OpenAQ</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Nearby PM10</span>
                  <span className="text-sm font-bold font-mono text-slate-900">
                    {currentIncident.pm10_value != null ? `${currentIncident.pm10_value} µg/m³` : 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">Source: OpenAQ</span>
                </div>
              </div>
              {currentIncident.nearest_station_name && (
                <div className="text-[11px] text-slate-500 pt-1">
                  Nearest Station: <strong>{currentIncident.nearest_station_name}</strong>
                </div>
              )}
            </div>

            {/* Impact / Direction View (Section 9) */}
            <div className="p-4 bg-sky-50/50 border border-sky-200 rounded-xl space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-950 font-mono flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-sky-700" />
                Potential Impact Direction (Wind Dispersion)
              </span>
              <div className="space-y-2 text-xs text-sky-950">
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-sky-200">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-sky-700" />
                    <span>Wind Vector:</span>
                  </div>
                  <span className="font-mono font-bold">
                    {currentIncident.wind_cardinal || 'N/A'} ({currentIncident.wind_direction != null ? `${currentIncident.wind_direction}°` : 'N/A'}) @ {currentIncident.wind_speed != null ? `${currentIncident.wind_speed} km/h` : 'N/A'}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-sky-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Potential Impact Direction
                  </span>
                  <p className="font-semibold text-slate-800 text-xs">
                    {currentIncident.potential_impact_area || 'Downwind sector based on prevailing atmospheric vector'}
                  </p>
                  <span className="text-[10px] text-slate-500 italic block">
                    Directional indicator derived from Open-Meteo wind field. Not a scientific dispersion simulation.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Full Description & Incident Narrative */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-600" />
              Incident Description & Narrative
            </span>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-200">
              {currentIncident.description}
            </p>
          </div>

          {/* Section 6: Complete Status Audit Trail History */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-600" />
              Lifecycle Audit Trail History ({currentIncident.status_history.length} Events)
            </span>
            <div className="space-y-2">
              {currentIncident.status_history.map((hist) => (
                <div key={hist.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase font-mono">
                      {hist.previous_status ? `${hist.previous_status} → ` : ''}{hist.new_status}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {formatTimestamp(hist.changed_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>Changed By: <strong>{hist.changed_by}</strong></span>
                    {hist.notes && <span className="italic text-slate-500">{hist.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center">
          <div className="text-[11px] text-slate-500 font-mono">
            Platform Jurisdiction: Gwalior, Madhya Pradesh, India
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Close Incident View
          </button>
        </div>
      </div>
    </div>
  );
};
