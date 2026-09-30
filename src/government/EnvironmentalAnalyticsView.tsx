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
  TrendingUp,
  Activity,
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
    <div className="space-y-5">
      {/* ===== HERO HEADER ===== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0f2744] to-[#0a1e3d] shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-64 bg-sky-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-2 bg-sky-500/20 rounded-xl border border-sky-400/30 inline-flex">
                  <BarChart3 className="w-5 h-5 text-sky-400" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Operational Environmental Intelligence Analytics
                </h1>
                <span className="inline-flex text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 rounded-full font-mono">
                  Gwalior Jurisdiction Telemetry
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Real data-driven historical analysis of incident volume, resolution metrics, and citizen observation trends.
              </p>
            </div>
            <button
              onClick={loadAnalytics}
              disabled={loading}
              className="flex-shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[13px] font-semibold py-2.5 px-5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Metrics
            </button>
          </div>
        </div>
      </div>

      {/* ===== 4 KEY METRICS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 rounded-l-2xl" />
          <div className="pl-2">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Active Incidents</span>
            </div>
            <span className="text-4xl font-black font-mono text-slate-900 block leading-none mb-1.5">
              {summary ? summary.active_incidents_count : '—'}
            </span>
            <span className="text-[11px] text-slate-400">Currently in response queue</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-2xl" />
          <div className="pl-2">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Resolved</span>
            </div>
            <span className="text-4xl font-black font-mono text-emerald-700 block leading-none mb-1.5">
              {summary ? summary.resolved_incidents_count : '—'}
            </span>
            <span className="text-[11px] text-slate-400">Mitigated and closed out</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-sky-500 rounded-l-2xl" />
          <div className="pl-2">
            <div className="flex items-center gap-1.5 mb-2">
              <FileCheck2 className="w-4 h-4 text-sky-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Citizen Submissions</span>
            </div>
            <span className="text-4xl font-black font-mono text-sky-800 block leading-none mb-1.5">
              {summary ? summary.total_citizen_reports_count : '—'}
            </span>
            <span className="text-[11px] text-slate-400">Total community reports</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-600 rounded-l-2xl" />
          <div className="pl-2">
            <div className="flex items-center gap-1.5 mb-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Anomalies</span>
            </div>
            <span className="text-4xl font-black font-mono text-purple-700 block leading-none mb-1.5">
              {summary ? summary.anomalies_count : '—'}
            </span>
            <span className="text-[11px] text-slate-400">Atmospheric surges detected</span>
          </div>
        </div>
      </div>

      {/* ===== ANALYTICS BREAKDOWNS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Incidents by Type */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center gap-2">
            <div className="w-1 h-5 bg-rose-500 rounded-full" />
            <span className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Incident Distribution by Classification
            </span>
          </div>
          <div className="p-5 space-y-4">
            {summary && Object.keys(summary.incidents_by_type).length > 0 ? (
              Object.entries(summary.incidents_by_type).map(([type, count]) => (
                <div key={type} className="space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="font-semibold text-slate-700 capitalize">
                      {type.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#003366] to-sky-600 h-full rounded-full transition-all"
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
              <div className="text-[12px] text-slate-400 italic py-8 text-center">
                No incident classifications recorded (Insufficient historical data).
              </div>
            )}
          </div>
        </div>

        {/* Incidents by Lifecycle Status */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 to-white flex items-center gap-2">
            <div className="w-1 h-5 bg-emerald-600 rounded-full" />
            <span className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              Operational Resolution Lifecycle Status
            </span>
          </div>
          <div className="p-5 space-y-4">
            {summary && Object.keys(summary.incidents_by_status).length > 0 ? (
              Object.entries(summary.incidents_by_status).map(([statusKey, count]) => (
                <div key={statusKey} className="space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="font-semibold text-slate-700 uppercase font-mono">
                      {statusKey.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all"
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
              <div className="text-[12px] text-slate-400 italic py-8 text-center">
                No lifecycle status records present (Insufficient historical data).
              </div>
            )}
          </div>
        </div>

        {/* Citizen Reports by Category */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-sky-50/50 to-white flex items-center gap-2">
            <div className="w-1 h-5 bg-sky-600 rounded-full" />
            <span className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-sky-700" />
              Citizen Crowdsourced Reports by Category
            </span>
          </div>
          <div className="p-5 space-y-4">
            {summary && Object.keys(summary.reports_by_type).length > 0 ? (
              Object.entries(summary.reports_by_type).map(([cat, count]) => (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="font-semibold text-slate-700 capitalize">
                      {cat.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">{count} reports</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-600 to-sky-400 h-full rounded-full transition-all"
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
              <div className="text-[12px] text-slate-400 italic py-8 text-center">
                No citizen report categories recorded (Insufficient historical data).
              </div>
            )}
          </div>
        </div>

        {/* Incidents by Area */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-rose-50/40 to-white flex items-center gap-2">
            <div className="w-1 h-5 bg-rose-600 rounded-full" />
            <span className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-600" />
              Incident Concentration by Airshed / Area
            </span>
          </div>
          <div className="p-5 space-y-2.5">
            {summary && Object.keys(summary.incidents_by_area).length > 0 ? (
              Object.entries(summary.incidents_by_area).map(([area, count]) => (
                <div
                  key={area}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="text-[12px] font-semibold text-slate-800">{area}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-sky-900 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                    {count} incident{count > 1 ? 's' : ''}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-[12px] text-slate-400 italic py-8 text-center">
                No area concentration records present (Insufficient historical data).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
