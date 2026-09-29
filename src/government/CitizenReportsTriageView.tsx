import React, { useState, useEffect } from 'react';
import type { CitizenReportRecord } from '../types/incident';
import {
  fetchCitizenReports,
  fetchCitizenReportDetail,
  verifyCitizenReport,
  formatTimestamp,
  getWindCardinal,
} from '../services/saamekBackendService';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Flame,
  Radio,
  Wind,
  Image as ImageIcon,
  Send,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface CitizenReportsTriageViewProps {
  onIncidentCreated?: (incidentId: string) => void;
  officerName?: string;
}

export const CitizenReportsTriageView: React.FC<CitizenReportsTriageViewProps> = ({
  onIncidentCreated,
  officerName = 'Government Officer',
}) => {
  const [reports, setReports] = useState<CitizenReportRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedReportDetail, setSelectedReportDetail] = useState<{
    report: CitizenReportRecord;
    environmental_context: {
      weather: Record<string, any>;
      air_quality: Record<string, any>;
      satellite_fires: any[];
    };
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [actionSeverity, setActionSeverity] = useState('medium');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchCitizenReports(statusFilter === 'all' ? undefined : statusFilter);
      setReports(data);
      if (data.length > 0 && !selectedReportId) {
        setSelectedReportId(data[0].report_id);
      }
    } catch (err) {
      console.error('Failed to load citizen reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  useEffect(() => {
    if (!selectedReportId) {
      setSelectedReportDetail(null);
      return;
    }
    fetchCitizenReportDetail(selectedReportId)
      .then((data) => setSelectedReportDetail(data))
      .catch((err) => console.error('Failed to load report detail:', err));
  }, [selectedReportId]);

  const handleAction = async (action: 'verify' | 'reject' | 'convert_to_incident') => {
    if (!selectedReportId) return;
    setSubmittingAction(true);
    setSuccessMessage(null);
    try {
      const res = await verifyCitizenReport(
        selectedReportId,
        action,
        actionNotes.trim() || undefined,
        officerName,
        actionSeverity
      );
      setSuccessMessage(
        action === 'convert_to_incident'
          ? `Report successfully converted to Official Incident #${res.converted_incident_id}!`
          : `Report successfully marked as ${action.toUpperCase()}!`
      );
      setActionNotes('');
      await loadReports();
      // Reload selected report detail
      const updatedDetail = await fetchCitizenReportDetail(selectedReportId);
      setSelectedReportDetail(updatedDetail);
      if (res.converted_incident_id) {
        onIncidentCreated?.(res.converted_incident_id);
      }
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.title.toLowerCase().includes(term) ||
      r.report_id.toLowerCase().includes(term) ||
      r.location_name.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'verified':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'converted_to_incident':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'rejected':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-sky-800" />
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Citizen Environmental Observations Triage
            </h1>
            <span className="text-[10px] font-mono bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 rounded font-bold">
              Gwalior Jurisdiction
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review community-reported environmental events, corroborate with live atmospheric telemetry, and verify or convert into actionable response incidents.
          </p>
        </div>
        <button
          onClick={loadReports}
          disabled={loading}
          className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Reports</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Left List (Triage Queue) + Right Corroboration Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Reports List */}
        <div className="lg:col-span-5 space-y-3">
          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search report ID, location, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                { key: 'all', label: 'All Reports' },
                { key: 'pending_verification', label: 'Pending Verification' },
                { key: 'converted_to_incident', label: 'Converted' },
                { key: 'verified', label: 'Verified' },
                { key: 'rejected', label: 'Rejected' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-2.5 py-1 text-[11px] rounded-md font-semibold transition-all cursor-pointer ${
                    statusFilter === f.key
                      ? 'bg-[#003366] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reports Scrollable List */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredReports.length > 0 ? (
              filteredReports.map((r) => {
                const isSelected = selectedReportId === r.report_id;
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedReportId(r.report_id);
                      setSuccessMessage(null);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-white border-[#003366] ring-2 ring-[#003366]/20 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-sky-900 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded">
                        {r.report_id}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(
                          r.status
                        )}`}
                      >
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">{r.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{r.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="truncate max-w-[140px]">{r.location_name}</span>
                      </span>
                      <span className="font-mono text-[10px]">{formatTimestamp(r.submitted_at)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-2">
                <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
                <span className="font-bold text-xs text-slate-700 block">No reports matching filter</span>
                <p className="text-[11px] text-slate-500">
                  When citizens submit environmental issues, they will appear here for verification.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Corroboration & Verification Workspace */}
        <div className="lg:col-span-7">
          {selectedReportDetail ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-xs">
              {/* Report Header */}
              <div className="border-b border-slate-200 pb-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-[#003366] text-white px-2 py-0.5 rounded">
                      {selectedReportDetail.report.report_id}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Category: {selectedReportDetail.report.report_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(
                      selectedReportDetail.report.status
                    )}`}
                  >
                    {selectedReportDetail.report.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedReportDetail.report.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                  <span>Submitted: {formatTimestamp(selectedReportDetail.report.submitted_at)}</span>
                  <span>Citizen: {selectedReportDetail.report.citizen_name || 'Anonymous'}</span>
                </div>
              </div>

              {/* Citizen Narrative & Image Attachment */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono block">
                  Citizen Narrative Description
                </span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-line">
                  {selectedReportDetail.report.description}
                </p>

                {/* Attached Photographic Evidence if present */}
                {(selectedReportDetail.report.image_data || selectedReportDetail.report.image_url) && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-sky-700" />
                      Citizen Photographic Evidence Attachment
                    </span>
                    <div className="max-h-56 rounded-md overflow-hidden border border-slate-300">
                      <img
                        src={selectedReportDetail.report.image_data || selectedReportDetail.report.image_url}
                        alt="Citizen Evidence"
                        className="w-full h-auto object-cover max-h-56"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Environmental Corroboration Matrix */}
              <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-950 font-mono flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-sky-700" />
                  Correlated Real Environmental Telemetry Matrix
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {/* Air Quality Station */}
                  <div className="p-2.5 bg-white rounded-lg border border-sky-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Ambient AQ Telemetry
                    </span>
                    <span className="font-bold text-slate-900 block truncate">
                      {selectedReportDetail.environmental_context.air_quality.nearest_station}
                    </span>
                    <div className="text-[11px] font-mono text-sky-900">
                      PM2.5: <strong>{selectedReportDetail.environmental_context.air_quality.pm25} µg/m³</strong>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Distance: ~{selectedReportDetail.environmental_context.air_quality.distance_km} km
                    </div>
                  </div>

                  {/* Weather & Wind */}
                  <div className="p-2.5 bg-white rounded-lg border border-sky-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Atmospheric Vector
                    </span>
                    <span className="font-bold text-slate-900 block">
                      {selectedReportDetail.environmental_context.weather.wind_cardinal} @ {selectedReportDetail.environmental_context.weather.wind_speed} km/h
                    </span>
                    <div className="text-[11px] font-mono text-slate-700">
                      Temp: {selectedReportDetail.environmental_context.weather.temperature}°C, RH: {selectedReportDetail.environmental_context.weather.humidity}%
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">Source: Open-Meteo</div>
                  </div>

                  {/* Satellite Fire Pass */}
                  <div className="p-2.5 bg-white rounded-lg border border-sky-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      NASA FIRMS Satellite Pass
                    </span>
                    <span className="font-bold text-slate-900 block">
                      {selectedReportDetail.environmental_context.satellite_fires.length > 0
                        ? `${selectedReportDetail.environmental_context.satellite_fires.length} Nearby Detections`
                        : '0 Thermal Anomalies'}
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono">
                      SURVEILLANCE: VIIRS / MODIS
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification & Action Panel */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono block">
                  Official Verification Decision & Actions
                </span>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Officer Remarks & Triage Notes:
                  </label>
                  <input
                    type="text"
                    placeholder="Enter verification rationale or field dispatch notes..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                {selectedReportDetail.report.status === 'converted_to_incident' ? (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900 font-semibold flex items-center justify-between">
                    <span>Converted to Official Incident #{selectedReportDetail.report.converted_incident_id}</span>
                    <span className="font-mono text-purple-700">Verified by {selectedReportDetail.report.verified_by}</span>
                  </div>
                ) : (
                  <div className="pt-2 flex flex-wrap gap-2 justify-end">
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={submittingAction}
                      className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Reject / Dismiss</span>
                    </button>
                    <button
                      onClick={() => handleAction('verify')}
                      disabled={submittingAction}
                      className="px-4 py-2 text-xs font-bold text-sky-900 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-700" />
                      <span>Mark Verified</span>
                    </button>
                    <button
                      onClick={() => handleAction('convert_to_incident')}
                      disabled={submittingAction}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#003366] hover:bg-[#002244] rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                      <span>Convert to Incident</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-2">
              <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto" />
              <span className="font-bold text-sm text-slate-700 block">Select a Report to Triage</span>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Choose a citizen submission from the queue on the left to inspect multi-source environmental corroboration and register an incident.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
