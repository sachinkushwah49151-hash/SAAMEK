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
      const [sumData, incData, anomData, dsData] = await Promise.all([
        fetchAnalyticsSummary(),
        fetchIncidents(),
        fetchAnomalies(),
        fetchDataSourcesHealth(),
      ]);
      setSummary(sumData);
      setActiveIncidents(incData.filter((i) => i.status !== 'resolved'));
      setAnomalies(anomData);
      setDataSources(dsData);
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

  return (
    <div className="space-y-4">
      {/* Top Header Strip with Gwalior Geographic Pilot Scope */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#003366]" />
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              LIVE ENVIRONMENTAL SITUATION COMMAND CENTER
            </h1>
            <span className="text-[10px] font-mono bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 rounded font-bold">
              Gwalior, Madhya Pradesh, India
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time synthesis of atmospheric sensors, orbital thermal surveillance, and citizen field reports for coordinated municipal response.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Telemetry</span>
          </button>
        </div>
      </div>

      {testNotification && (
        <div className="p-3.5 bg-purple-50 border border-purple-300 rounded-xl text-xs text-purple-950 font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-700 shrink-0" />
            <span>{testNotification}</span>
          </div>
          <button
            onClick={() => setTestNotification(null)}
            className="text-purple-700 hover:text-purple-900 text-xs font-bold ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =====================================================================
          1. 6 MANDATED OPERATIONAL METRICS (Section 3)
          ===================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Active Incidents */}
        <div
          onClick={() => onNavigateTab('incidents')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-400 transition-all cursor-pointer shadow-xs space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Active Incidents
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 block">
            {summary ? summary.active_incidents_count : '—'}
          </span>
          <span className="text-[10px] text-slate-500 block">Under active mitigation</span>
        </div>

        {/* 2. High/Critical Incidents */}
        <div
          onClick={() => onNavigateTab('incidents')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-rose-400 transition-all cursor-pointer shadow-xs space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              High / Critical
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-rose-600 block">
            {summary ? summary.high_critical_incidents_count : '—'}
          </span>
          <span className="text-[10px] text-slate-500 block">Priority response tier</span>
        </div>

        {/* 3. Pending Verification */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Pending Triage
            </span>
            <FileCheck2 className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-600 block">
            {summary ? summary.pending_verification_reports_count : '—'}
          </span>
          <span className="text-[10px] text-slate-500 block">Citizen reports to verify</span>
        </div>

        {/* 4. Total Citizen Reports */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-400 transition-all cursor-pointer shadow-xs space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Citizen Reports
            </span>
            <Radio className="w-4 h-4 text-sky-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 block">
            {summary ? summary.total_citizen_reports_count : '—'}
          </span>
          <span className="text-[10px] text-slate-500 block">Community submissions</span>
        </div>

        {/* 5. Environmental Anomalies */}
        <div
          onClick={() => onNavigateTab('command-center')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-400 transition-all cursor-pointer shadow-xs space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Anomalies
            </span>
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-purple-700 block">
            {summary ? summary.anomalies_count : '—'}
          </span>
          <span className="text-[10px] text-slate-500 block">Sensor threshold spikes</span>
        </div>

        {/* 6. Data Source Status */}
        <div
          onClick={() => onNavigateTab('data-sources')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 transition-all cursor-pointer shadow-xs space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Data Feeds
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-700 block">
            {summary ? `${summary.data_sources_healthy_count}/${summary.total_data_sources_count}` : '—'}
          </span>
          <span className="text-[10px] text-slate-500 block">Operational pipelines</span>
        </div>
      </div>

      {/* =====================================================================
          2. MAIN OPERATIONAL GRID (Active Incidents + Anomaly Engine)
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (7 cols): Active Incidents Queue */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#003366]" />
                Active Environmental Incident Queue ({activeIncidents.length})
              </span>
              <button
                onClick={() => onNavigateTab('incidents')}
                className="text-xs font-bold text-[#003366] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Incidents</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {activeIncidents.length > 0 ? (
                activeIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className="p-3.5 rounded-lg border border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-sky-900 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded">
                          {inc.incident_id}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getSeverityBadge(inc.severity)}`}>
                          {inc.severity}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500 uppercase">
                        Status: <strong className="text-sky-900">{inc.status.replace(/_/g, ' ')}</strong>
                      </span>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">{inc.title}</h4>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {inc.location_name}
                      </span>
                      <span className="font-mono text-[10px]">{formatTimestamp(inc.detected_at)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center space-y-2 bg-slate-50 rounded-lg border border-slate-200">
                  <Info className="w-6 h-6 text-slate-400 mx-auto" />
                  <span className="font-bold text-xs text-slate-700 block">No Active Incidents Detected</span>
                  <p className="text-[11px] text-slate-500">
                    Ambient monitoring stations and thermal satellites are operating with no active threshold violations in Gwalior.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Environmental Anomaly Feed & Controlled Test Mode */}
        <div className="lg:col-span-5 space-y-3">
          {/* Anomaly Detection Engine */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-950 font-mono flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-700" />
                Environmental Anomaly Feed ({anomalies.length})
              </span>
              <span className="text-[10px] font-mono text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                Dynamic Threshold
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {anomalies.length > 0 ? (
                anomalies.map((anom) => (
                  <div
                    key={anom.id}
                    className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-purple-950">{anom.title}</span>
                      <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                        {anom.threshold_ratio}x Baseline
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{anom.explanation}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-purple-100">
                      <span>Station: {anom.station_name}</span>
                      <span>{formatTimestamp(anom.detected_at)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                  No abnormal environmental anomalies currently detected.
                </div>
              )}
            </div>

            {/* Controlled Test Data Demonstration Mechanism (Section 5 & 17) */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Controlled Demo Test Mechanism
                </span>
                <span className="text-[9px] font-bold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono">
                  Demo Tool
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Trigger a controlled particulate spike simulation to test the full <strong>Detect → Correlate → Respond</strong> workflow without faking production live data.
              </p>
              <button
                onClick={handleTriggerTestDemo}
                disabled={triggeringTest}
                className="w-full py-2 px-3 text-xs font-bold text-purple-950 bg-purple-100 hover:bg-purple-200 border border-purple-300 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-purple-700" />
                <span>{triggeringTest ? 'Simulating Spike...' : 'Trigger Controlled Test Anomaly'}</span>
              </button>
            </div>
          </div>

          {/* Quick Data Sources Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Data Pipelines Health
              </span>
              <button
                onClick={() => onNavigateTab('data-sources')}
                className="text-xs font-bold text-[#003366] hover:underline"
              >
                Inspect
              </button>
            </div>
            <div className="space-y-1.5 text-xs">
              {dataSources.map((ds) => (
                <div key={ds.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                  <span className="font-medium text-slate-800">{ds.name}</span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      ds.status === 'connected'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ds.status === 'available'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-rose-100 text-rose-800'
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

      {/* Incident Detail Modal */}
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
