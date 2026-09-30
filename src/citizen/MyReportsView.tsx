import React, { useState, useEffect } from 'react';
import type { CitizenTab } from '../types';
import type { CitizenReportRecord } from '../types/incident';
import { fetchCitizenReports, formatTimestamp } from '../services/saamekBackendService';
import {
  ClipboardList,
  RefreshCw,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Flame,
  FilePlus,
  Image as ImageIcon,
  Building2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface MyReportsViewProps {
  onNavigateTab: (tab: CitizenTab) => void;
}

export const MyReportsView: React.FC<MyReportsViewProps> = ({ onNavigateTab }) => {
  const [reports, setReports] = useState<CitizenReportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchCitizenReports(statusFilter === 'all' ? undefined : statusFilter);
      setReports(data);
    } catch (err) {
      console.error('Failed to load my citizen reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            Under Verification
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-900 border border-sky-300 shadow-2xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
            Verified by Authorities
          </span>
        );
      case 'converted_to_incident':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-900 border border-purple-300 shadow-2xs font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-700" />
            Escalated to Official Incident
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs font-mono">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Closed / Not Confirmed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 font-mono">
            {status}
          </span>
        );
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return 'border-l-amber-500';
      case 'verified':
        return 'border-l-sky-500';
      case 'converted_to_incident':
        return 'border-l-purple-600';
      case 'rejected':
        return 'border-l-slate-400';
      default:
        return 'border-l-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* ===== HERO HEADER ===== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0f2744] to-[#0a1e3d] shadow-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-400/30">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Track Environmental Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Live status and audit trail of citizen observations submitted in Gwalior
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadReports()}
            disabled={loading}
            className="px-4 py-2.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => onNavigateTab('report')}
            className="px-5 py-2.5 text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            New Report
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: 'All Reports' },
          { id: 'pending_verification', label: 'Under Verification' },
          { id: 'verified', label: 'Verified by Authorities' },
          { id: 'converted_to_incident', label: 'Escalated to Incidents' },
          { id: 'rejected', label: 'Closed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              statusFilter === tab.id
                ? 'bg-[#003366] text-white border-[#003366] shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <RefreshCw className="w-8 h-8 text-[#003366] animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-mono">Loading your environmental reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-3">
          <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-200">
            <ClipboardList className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Environmental Reports Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            You haven't submitted any reports matching this filter, or no reports are logged under this status yet.
          </p>
          <button
            onClick={() => onNavigateTab('report')}
            className="px-6 py-2.5 rounded-xl bg-[#003366] text-white font-bold text-xs shadow-md hover:bg-[#002244] transition-all cursor-pointer inline-flex items-center gap-2 mt-2"
          >
            <FilePlus className="w-4 h-4" />
            Submit Your First Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => {
            const statusBorder = getStatusBorder(report.status);
            return (
              <div
                key={report.id}
                className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${statusBorder} p-6 shadow-sm hover:shadow-md transition-all space-y-4`}
              >
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#003366] bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                      {report.report_id || `CR-${String(report.id).substring(0, 8)}`}
                    </span>
                    <span className="text-xs font-bold text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded">
                      {report.report_type?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>{getStatusBadge(report.status)}</div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {report.title || 'Environmental Incident Observation'}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                {/* Meta Info: Location, Coordinates, Date */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{report.location_name || 'Gwalior, MP'}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500">
                    {report.latitude.toFixed(4)}°N, {report.longitude.toFixed(4)}°E
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimestamp(report.created_at)}</span>
                  </div>
                </div>

                {/* Official Review / Escalation Notes */}
                {report.verification_notes && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <span className="font-bold text-slate-900">
                        Officer Review ({report.verified_by || 'Government Authority'}):
                      </span>{' '}
                      {report.verification_notes}
                      {report.converted_incident_id && (
                        <div className="mt-1 text-[11px] font-bold text-purple-800 font-mono">
                          Official Incident Escalation ID: #{report.converted_incident_id}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
