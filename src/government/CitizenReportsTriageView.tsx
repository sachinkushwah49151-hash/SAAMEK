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
  Sparkles,
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
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'verified':
        return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'converted_to_incident':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'rejected':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return 'border-l-amber-500';
      case 'converted_to_incident':
        return 'border-l-purple-600';
      case 'verified':
        return 'border-l-sky-500';
      case 'rejected':
        return 'border-l-slate-400';
      default:
        return 'border-l-slate-300';
    }
  };

  return (
    <div className="space-y-5">
      {/* ===== HERO HEADER ===== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0f2744] to-[#0a1e3d] shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-2 bg-sky-500/20 rounded-xl border border-sky-400/30 inline-flex">
                  <FileCheck2 className="w-5 h-5 text-sky-400" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Citizen Environmental Observations Triage
                </h1>
                <span className="inline-flex items-center text-[11px] font-bold text-sky-300 bg-sky-500/15 border border-sky-400/30 px-3 py-1 rounded-full font-mono">
                  Gwalior Jurisdiction
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Review community-reported environmental events, cross-reference live atmospheric telemetry, and verify or escalate into official incidents.
              </p>
            </div>
            <button
              onClick={loadReports}
              disabled={loading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[13px] font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Reports
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-sm text-emerald-900 font-semibold flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Left List (Triage Queue) + Right Corroboration Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Reports List */}
        <div className="lg:col-span-5 space-y-3">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search report ID, location, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 focus:outline-none transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'all', label: 'All Reports' },
                { key: 'pending_verification', label: 'Pending' },
                { key: 'converted_to_incident', label: 'Converted' },
                { key: 'verified', label: 'Verified' },
                { key: 'rejected', label: 'Rejected' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1 text-[11px] rounded-full font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    statusFilter === f.key
                      ? 'bg-[#003366] text-white border-[#003366] shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reports Scrollable List */}
          <div className="space-y-2.5 max-h-[660px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredReports.length > 0 ? (
              filteredReports.map((r) => {
                const isSelected = selectedReportId === r.report_id;
                const statusBorder = getStatusBorder(r.status);
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedReportId(r.report_id);
                      setSuccessMessage(null);
                    }}
                    className={`p-4 rounded-2xl border border-l-4 ${statusBorder} transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-white border-sky-400 ring-2 ring-sky-500/20 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-sky-900 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                        {r.report_id}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          r.status
                        )}`}
                      >
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-[13px] text-slate-900 leading-snug">{r.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{r.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate max-w-[160px] font-medium text-slate-700">{r.location_name}</span>
                      </span>
                      <span className="font-mono text-[10px]">{formatTimestamp(r.submitted_at)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
                <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
                <span className="font-bold text-sm text-slate-700 block">No reports matching filter</span>
                <p className="text-[12px] text-slate-500 max-w-xs mx-auto">
                  When citizens submit environmental issues, they will appear here for verification.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Corroboration & Verification Workspace */}
        <div className="lg:col-span-7">
          {selectedReportDetail ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
              {/* Report Header */}
              <div className="border-b border-slate-100 pb-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-[#003366] text-white px-2.5 py-1 rounded-md">
                      {selectedReportDetail.report.report_id}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded">
                      {selectedReportDetail.report.report_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusBadge(
                      selectedReportDetail.report.status
                    )}`}
                  >
                    {selectedReportDetail.report.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {selectedReportDetail.report.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Submitted: {formatTimestamp(selectedReportDetail.report.submitted_at)}
                  </span>
                  <span>Citizen: <strong className="text-slate-700">{selectedReportDetail.report.citizen_name || 'Anonymous'}</strong></span>
                </div>
              </div>

              {/* Citizen Narrative & Image Attachment */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 font-mono block">
                  Citizen Narrative Description
                </span>
                <p className="text-[13px] text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-line">
                  {selectedReportDetail.report.description}
                </p>

                {/* Attached Photographic Evidence if present */}
                {(selectedReportDetail.report.image_data || selectedReportDetail.report.image_url) && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-sky-700" />
                      Citizen Photographic Evidence Attachment
                    </span>
                    <div className="max-h-60 rounded-lg overflow-hidden border border-slate-300">
                      <img
                        src={selectedReportDetail.report.image_data || selectedReportDetail.report.image_url}
                        alt="Citizen Evidence"
                        className="w-full h-auto object-cover max-h-60"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Environmental Corroboration Matrix */}
              <div className="p-4 bg-gradient-to-r from-sky-50 to-blue-50/40 border border-sky-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-sky-600 rounded-full" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-950 font-mono flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-sky-700" />
                    Correlated Live Environmental Telemetry Matrix
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Air Quality Station */}
                  <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block font-mono">
                      Ambient AQ Telemetry
                    </span>
                    <span className="font-bold text-slate-900 block truncate">
                      {selectedReportDetail.environmental_context.air_quality.nearest_station}
                    </span>
                    <div className="text-[11px] font-mono text-sky-900 font-semibold">
                      PM2.5: {selectedReportDetail.environmental_context.air_quality.pm25} µg/m³
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Distance: ~{selectedReportDetail.environmental_context.air_quality.distance_km} km
                    </div>
                  </div>

                  {/* Weather & Wind */}
                  <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block font-mono">
                      Atmospheric Vector
                    </span>
                    <span className="font-bold text-slate-900 block">
                      {selectedReportDetail.environmental_context.weather.wind_cardinal} @ {selectedReportDetail.environmental_context.weather.wind_speed} km/h
                    </span>
                    <div className="text-[11px] font-mono text-slate-700">
                      Temp: {selectedReportDetail.environmental_context.weather.temperature}°C, RH: {selectedReportDetail.environmental_context.weather.humidity}%
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">Source: Open-Meteo</div>
                  </div>

                  {/* Satellite Fire Pass */}
                  <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block font-mono">
                      NASA FIRMS Satellite Pass
                    </span>
                    <span className="font-bold text-slate-900 block">
                      {selectedReportDetail.environmental_context.satellite_fires.length > 0
                        ? `${selectedReportDetail.environmental_context.satellite_fires.length} Nearby Detections`
                        : '0 Thermal Anomalies'}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">
                      SURVEILLANCE: VIIRS / MODIS
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification & Action Panel */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono block">
                  Official Verification Decision &amp; Actions
                </span>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Officer Remarks &amp; Triage Notes:
                  </label>
                  <input
                    type="text"
                    placeholder="Enter verification rationale or field dispatch notes..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 focus:outline-none transition-all"
                  />
                </div>

                {selectedReportDetail.report.status === 'converted_to_incident' ? (
                  <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 font-semibold flex items-center justify-between">
                    <span>Converted to Official Incident #{selectedReportDetail.report.converted_incident_id}</span>
                    <span className="font-mono text-purple-700">Verified by {selectedReportDetail.report.verified_by}</span>
                  </div>
                ) : (
                  <div className="pt-2 flex flex-wrap gap-2.5 justify-end">
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={submittingAction}
                      className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>Reject / Dismiss</span>
                    </button>
                    <button
                      onClick={() => handleAction('verify')}
                      disabled={submittingAction}
                      className="px-4 py-2.5 text-xs font-bold text-sky-900 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-sky-700" />
                      <span>Mark Verified</span>
                    </button>
                    <button
                      onClick={() => handleAction('convert_to_incident')}
                      disabled={submittingAction}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-[#003366] hover:bg-[#002244] rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>Convert to Incident</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-200">
                <FileCheck2 className="w-7 h-7 text-slate-300" />
              </div>
              <span className="font-bold text-[15px] text-slate-700 block">Select a Report to Triage</span>
              <p className="text-[12px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                Choose a citizen submission from the queue on the left to inspect multi-source environmental corroboration and register an incident.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
