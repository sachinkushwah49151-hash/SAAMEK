import React, { useState, useEffect } from 'react';
import type { AnalyticsSummaryRecord } from '../types/incident';
import { fetchAnalyticsSummary } from '../services/saamekBackendService';
import {
  BarChart3,
  RefreshCw,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  MapPin,
  PieChart,
  TrendingUp,
} from 'lucide-react';

export const EnvironmentalAnalyticsView: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummaryRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await fetchAnalyticsSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#003366]" />
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Operational Environmental Intelligence Analytics
            </h1>
            <span className="text-[10px] font-mono bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 rounded font-bold">
              Gwalior Jurisdiction Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real data-driven historical analysis of incident volume, resolution metrics, and citizen observation trends.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          disabled={loading}
          className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Top 4 Key Analytical Pillars */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Active Incidents
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 block">
            {summary ? summary.active_incidents_count : '—'}
          </span>
          <span className="text-[10px] text-slate-500">Currently in response queue</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Resolved Incidents
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-700 block">
            {summary ? summary.resolved_incidents_count : '—'}
          </span>
          <span className="text-[10px] text-slate-500">Mitigated and closed out</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Citizen Submissions
          </span>
          <span className="text-2xl font-bold font-mono text-sky-800 block">
            {summary ? summary.total_citizen_reports_count : '—'}
          </span>
          <span className="text-[10px] text-slate-500">Total community reports</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Threshold Anomalies
          </span>
          <span className="text-2xl font-bold font-mono text-purple-700 block">
            {summary ? summary.anomalies_count : '—'}
          </span>
          <span className="text-[10px] text-slate-500">Atmospheric surges detected</span>
        </div>
      </div>

      {/* Analytics Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Incidents by Type */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#003366]" />
            Incident Distribution by Classification
          </span>
          <div className="space-y-2.5">
            {summary && Object.keys(summary.incidents_by_type).length > 0 ? (
              Object.entries(summary.incidents_by_type).map(([type, count]) => (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 capitalize">
                      {type.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#003366] h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (count / Math.max(1, summary.active_incidents_count + summary.resolved_incidents_count)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic p-4 text-center">
                No incident classifications recorded (Insufficient historical data).
              </div>
            )}
          </div>
        </div>

        {/* Incidents by Lifecycle Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            Operational Resolution Lifecycle Status
          </span>
          <div className="space-y-2.5">
            {summary && Object.keys(summary.incidents_by_status).length > 0 ? (
              Object.entries(summary.incidents_by_status).map(([statusKey, count]) => (
                <div key={statusKey} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 uppercase font-mono">
                      {statusKey.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (count / Math.max(1, summary.active_incidents_count + summary.resolved_incidents_count)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic p-4 text-center">
                No lifecycle status records present (Insufficient historical data).
              </div>
            )}
          </div>
        </div>

        {/* Citizen Reports by Category */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-sky-700" />
            Citizen Crowdsourced Reports by Category
          </span>
          <div className="space-y-2.5">
            {summary && Object.keys(summary.reports_by_type).length > 0 ? (
              Object.entries(summary.reports_by_type).map(([cat, count]) => (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 capitalize">
                      {cat.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{count} reports</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-600 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (count / Math.max(1, summary.total_citizen_reports_count)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic p-4 text-center">
                No citizen report categories recorded (Insufficient historical data).
              </div>
            )}
          </div>
        </div>

        {/* Incidents by Affected Jurisdiction Airshed Area */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-600" />
            Incident Concentration by Airshed / Area
          </span>
          <div className="space-y-2 text-xs">
            {summary && Object.keys(summary.incidents_by_area).length > 0 ? (
              Object.entries(summary.incidents_by_area).map(([area, count]) => (
                <div
                  key={area}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                >
                  <span className="font-medium text-slate-800">{area}</span>
                  <span className="font-mono font-bold text-sky-900 bg-sky-100 px-2 py-0.5 rounded">
                    {count} incident{count > 1 ? 's' : ''}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic p-4 text-center">
                No area concentration records present (Insufficient historical data).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
