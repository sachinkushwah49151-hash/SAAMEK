import React, { useState, useEffect } from 'react';
import type {
  IncidentRecord,
  EnvironmentalAnomalyRecord,
  DataSourceHealthRecord,
  AnalyticsSummaryRecord,
} from '../types/incident';
import {
  fetchIncidents,
  fetchAnomalies,
  fetchDataSourcesHealth,
  fetchAnalyticsSummary,
  triggerTestAnomaly,
  formatTimestamp,
} from '../services/saamekBackendService';
import { IncidentDetailModal } from './IncidentDetailModal';
import {
  Activity,
  AlertTriangle,
  FileCheck2,
  Radio,
  Zap,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Clock,
  Wind,
  ShieldAlert,
  ChevronRight,
  Flame,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface CommandCenterViewProps {
  onNavigateTab: (tab: any) => void;
  onSelectIncident?: (incidentId: string) => void;
  officerName?: string;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  onNavigateTab,
  onSelectIncident,
  officerName = 'Government Officer',
}) => {
  const [summary, setSummary] = useState<AnalyticsSummaryRecord | null>(null);
  const [activeIncidents, setActiveIncidents] = useState<IncidentRecord[]>([]);
  const [anomalies, setAnomalies] = useState<EnvironmentalAnomalyRecord[]>([]);
  const [dataSources, setDataSources] = useState<DataSourceHealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [triggeringTest, setTriggeringTest] = useState(false);
  const [testNotification, setTestNotification] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, incRes, anomRes, dsRes] = await Promise.allSettled([
        fetchAnalyticsSummary(),
        fetchIncidents(),
        fetchAnomalies(),
        fetchDataSourcesHealth(),
      ]);

      if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      if (incRes.status === 'fulfilled') setActiveIncidents(incRes.value.filter((i) => i.status !== 'resolved'));
      if (anomRes.status === 'fulfilled') setAnomalies(anomRes.value);
      if (dsRes.status === 'fulfilled') setDataSources(dsRes.value);
    } catch (err) {
      console.error('Failed to load Command Center telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleTriggerTestDemo = async () => {
    setTriggeringTest(true);
    setTestNotification(null);
    try {
      const res = await triggerTestAnomaly({
        parameter: 'pm25',
        observed_value: 168.5,
        baseline_value: 45.0,
        station_name: 'Maharaj Bada, Gwalior - MPPCB',
      });
      setTestNotification(
        `Controlled Demo Anomaly Triggered (#${res.anomaly_id}): PM2.5 Surge Spike (3.7x baseline) registered for demonstration!`
      );
      await loadDashboardData();
    } catch (err: any) {
      alert(`Failed to trigger test demo: ${err.message}`);
    } finally {
      setTriggeringTest(false);
    }
  };

  const getSeverityConfig = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'critical':
        return { badge: 'bg-rose-100 text-rose-800 border-rose-300', border: 'border-l-rose-500', dot: 'bg-rose-500' };
      case 'high':
        return { badge: 'bg-amber-100 text-amber-800 border-amber-300', border: 'border-l-amber-500', dot: 'bg-amber-500' };
      case 'medium':
        return { badge: 'bg-sky-100 text-sky-800 border-sky-300', border: 'border-l-sky-500', dot: 'bg-sky-500' };
      default:
        return { badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', border: 'border-l-emerald-500', dot: 'bg-emerald-500' };
    }
  };

  return (
    <div className="space-y-5">
      {/* ===== HERO HEADER ===== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0f2744] to-[#0a1e3d] shadow-xl">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-sky-500/20 rounded-xl border border-sky-400/30">
                    <Activity className="w-5 h-5 text-sky-400" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    LIVE ENVIRONMENTAL SITUATION COMMAND CENTER
                  </h1>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-300 bg-sky-500/15 border border-sky-400/30 px-3 py-1 rounded-full font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  Gwalior, Madhya Pradesh, India
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Real-time synthesis of atmospheric sensors, orbital thermal surveillance, and citizen field reports for coordinated municipal response.
              </p>
            </div>

            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="flex-shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[13px] font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Live Telemetry</span>
            </button>
          </div>
        </div>
      </div>

      {testNotification && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-sm text-purple-900 font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>{testNotification}</span>
          </div>
          <button
            onClick={() => setTestNotification(null)}
            className="text-purple-600 hover:text-purple-900 text-xs font-bold ml-3 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ===== 6 METRIC CARDS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Active Incidents */}
        <div
          onClick={() => onNavigateTab('incidents')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 rounded-l-xl" />
          <div className="pl-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Active Incidents</span>
              <AlertTriangle className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-3xl font-black font-mono text-slate-900 block leading-none mb-1">
              {summary ? summary.active_incidents_count : '—'}
            </span>
            <span className="text-[10px] text-slate-400">Under active mitigation</span>
          </div>
        </div>

        {/* 2. High/Critical */}
        <div
          onClick={() => onNavigateTab('incidents')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-700 rounded-l-xl" />
          <div className="pl-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">High / Critical</span>
              <ShieldAlert className="w-4 h-4 text-rose-700 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-3xl font-black font-mono text-rose-700 block leading-none mb-1">
              {summary ? summary.high_critical_incidents_count : '—'}
            </span>
            <span className="text-[10px] text-slate-400">Priority response tier</span>
          </div>
        </div>

        {/* 3. Pending Triage */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-xl" />
          <div className="pl-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Pending Triage</span>
              <FileCheck2 className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-3xl font-black font-mono text-amber-600 block leading-none mb-1">
              {summary ? summary.pending_verification_reports_count : '—'}
            </span>
            <span className="text-[10px] text-slate-400">Citizen reports to verify</span>
          </div>
        </div>

        {/* 4. Citizen Reports */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-sky-500 rounded-l-xl" />
          <div className="pl-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Citizen Reports</span>
              <Radio className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-3xl font-black font-mono text-slate-900 block leading-none mb-1">
              {summary ? summary.total_citizen_reports_count : '—'}
            </span>
            <span className="text-[10px] text-slate-400">Community submissions</span>
          </div>
        </div>

        {/* 5. Anomalies */}
        <div
          onClick={() => onNavigateTab('command-center')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-600 rounded-l-xl" />
          <div className="pl-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Anomalies</span>
              <Zap className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-3xl font-black font-mono text-purple-700 block leading-none mb-1">
              {summary ? summary.anomalies_count : '—'}
            </span>
            <span className="text-[10px] text-slate-400">Sensor threshold spikes</span>
          </div>
        </div>

        {/* 6. Data Feeds */}
        <div
          onClick={() => onNavigateTab('data-sources')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-xl" />
          <div className="pl-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Data Feeds</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-3xl font-black font-mono text-emerald-700 block leading-none mb-1">
              {summary ? `${summary.data_sources_healthy_count}/${summary.total_data_sources_count}` : '—'}
            </span>
            <span className="text-[10px] text-slate-400">Operational pipelines</span>
          </div>
        </div>
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Active Incident Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-5 bg-[#003366] rounded-full" />
                <span className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#003366]" />
                  Active Environmental Incident Queue
                  <span className="ml-1 text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                    {activeIncidents.length}
                  </span>
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('incidents')}
                className="text-[12px] font-bold text-[#003366] hover:text-sky-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                View All
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {activeIncidents.length > 0 ? (
                activeIncidents.map((inc) => {
                  const sev = getSeverityConfig(inc.severity);
                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`p-4 rounded-xl border border-slate-200 border-l-4 ${sev.border} hover:bg-slate-50 hover:shadow-sm transition-all cursor-pointer`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-mono font-bold text-[#003366] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                            {inc.incident_id}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${sev.badge}`}>
                            {inc.severity}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 hidden sm:block">
                          STATUS: <strong className="text-[#003366] uppercase">{inc.status.replace(/_/g, ' ')}</strong>
                        </span>
                      </div>

                      <h4 className="font-bold text-[13px] text-slate-900 leading-snug mb-2">{inc.title}</h4>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {inc.location_name}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(inc.detected_at)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-200">
                    <Info className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-700">No Active Incidents Detected</p>
                    <p className="text-[12px] text-slate-500 mt-1 max-w-sm mx-auto">
                      Ambient monitoring stations and thermal satellites are operating with no active threshold violations in Gwalior.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Anomaly Feed + Test Demo + Data Sources */}
        <div className="lg:col-span-5 space-y-4">
          {/* Anomaly Engine */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50/60 to-white">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-purple-600 rounded-full" />
                <span className="text-[13px] font-bold text-purple-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-purple-600" />
                  Environmental Anomaly Feed
                  <span className="ml-1 text-[11px] font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                    {anomalies.length}
                  </span>
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                Dynamic Threshold
              </span>
            </div>

            <div className="p-4 space-y-2.5 max-h-72 overflow-y-auto scrollbar-thin">
              {anomalies.length > 0 ? (
                anomalies.map((anom) => (
                  <div
                    key={anom.id}
                    className="p-3.5 bg-gradient-to-r from-purple-50 to-white border border-purple-200 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-bold text-purple-950">{anom.title}</span>
                      <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200 shrink-0">
                        {anom.threshold_ratio}x
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{anom.explanation}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1.5 border-t border-purple-100">
                      <span>Station: {anom.station_name}</span>
                      <span>{formatTimestamp(anom.detected_at)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-[12px] text-slate-500">
                  <Zap className="w-6 h-6 text-purple-200 mx-auto mb-2" />
                  No abnormal environmental anomalies currently detected.
                </div>
              )}
            </div>

            {/* Controlled Demo Tool */}
            <div className="px-4 pb-4 pt-3 border-t border-slate-100 space-y-2.5 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Controlled Demo Test Mechanism
                </span>
                <span className="text-[9px] font-bold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono border border-purple-200">
                  Demo Tool
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Trigger a controlled particulate spike simulation to test the full <strong>Detect → Correlate → Respond</strong> workflow without faking production live data.
              </p>
              <button
                onClick={handleTriggerTestDemo}
                disabled={triggeringTest}
                className="w-full py-2.5 px-3 text-[12px] font-bold text-purple-950 bg-gradient-to-r from-purple-100 to-purple-50 hover:from-purple-200 hover:to-purple-100 border border-purple-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-purple-700" />
                {triggeringTest ? 'Simulating Spike...' : 'Trigger Controlled Test Anomaly'}
              </button>
            </div>
          </div>

          {/* Data Sources Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-emerald-600 rounded-full" />
                <span className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-600" />
                  Data Pipelines Health
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('data-sources')}
                className="text-[12px] font-bold text-[#003366] hover:text-sky-700 cursor-pointer transition-colors"
              >
                Inspect →
              </button>
            </div>
            <div className="p-4 divide-y divide-slate-50">
              {dataSources.map((ds) => (
                <div key={ds.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <span className="text-[12px] font-semibold text-slate-700 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      ds.status === 'connected' ? 'bg-emerald-500' :
                      ds.status === 'available' ? 'bg-sky-500' :
                      'bg-rose-500'
                    }`} />
                    {ds.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                      ds.status === 'connected'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : ds.status === 'available'
                        ? 'bg-sky-50 text-sky-800 border-sky-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {ds.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onStatusUpdated={() => {
            loadDashboardData();
          }}
          officerName={officerName}
        />
      )}
    </div>
  );
};
