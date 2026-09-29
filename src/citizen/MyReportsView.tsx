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
  const [selectedReport, setSelectedReport] = useState<CitizenReportRecord | null>(null);

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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            Under Verification
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            Verified by Authorities
          </span>
        );
      case 'converted_to_incident':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-700" />
            Escalated to Official Incident
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Closed / Not Confirmed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-[#003366] border border-blue-100">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Track Environmental Reports
            </h1>
            <p className="text-xs text-slate-500">
              Real-time audit status of submitted citizen observations in Gwalior
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadReports()}
            disabled={loading}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => onNavigateTab('report')}
            className="px-4 py-2 text-xs font-bold bg-[#003366] hover:bg-[#002244] text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5" />
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-[#003366] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-[#003366] animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading your environmental reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No Environmental Reports Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
            You haven't submitted any reports matching this filter, or no reports are logged under this status yet.
          </p>
          <button
            onClick={() => onNavigateTab('report')}
            className="px-5 py-2.5 rounded-xl bg-[#003366] text-white font-bold text-xs shadow-xs hover:bg-[#002244] transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <FilePlus className="w-4 h-4" />
            Submit Your First Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-[#003366] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                    {report.report_id || `CR-${String(report.id).substring(0, 8)}`}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 capitalize">
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
                <div className="flex items-center gap-1 text-slate-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{report.location_name || 'Gwalior, MP'}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-500">
                  {report.latitude.toFixed(4)}°N, {report.longitude.toFixed(4)}°E
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimestamp(report.created_at)}</span>
                </div>
              </div>

              {/* Official Review / Escalation Notes */}
              {report.verification_notes && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#003366] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">
                      Officer Review ({report.verified_by || 'Government Authority'}):
                    </span>{' '}
                    {report.verification_notes}
                    {report.converted_incident_id && (
                      <div className="mt-1 text-[11px] font-semibold text-purple-800">
                        Official Action Code: {report.converted_incident_id}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
