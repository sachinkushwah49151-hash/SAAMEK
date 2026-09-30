import React, { useState, useEffect } from 'react';
import type { DataSourceHealthRecord } from '../types/incident';
import { fetchDataSourcesHealth, formatTimestamp } from '../services/saamekBackendService';
import {
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  CloudSun,
  Flame,
  Users,
  ShieldCheck,
  Server,
  Activity,
} from 'lucide-react';

export const DataSourcesHealthView: React.FC = () => {
  const [sources, setSources] = useState<DataSourceHealthRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const data = await fetchDataSourcesHealth();
      setSources(data);
    } catch (err) {
      console.error('Failed to load data sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const getSourceIcon = (key: string) => {
    switch (key) {
      case 'openaq':
        return <Radio className="w-6 h-6 text-sky-600" />;
      case 'nasa_firms':
        return <Flame className="w-6 h-6 text-rose-600" />;
      case 'open_meteo':
        return <CloudSun className="w-6 h-6 text-amber-600" />;
      case 'citizen_reports':
        return <Users className="w-6 h-6 text-indigo-600" />;
      case 'postgis_db':
        return <Database className="w-6 h-6 text-emerald-600" />;
      default:
        return <Server className="w-6 h-6 text-slate-600" />;
    }
  };

  const getSourceIconBg = (key: string) => {
    switch (key) {
      case 'openaq': return 'bg-sky-50 border-sky-200';
      case 'nasa_firms': return 'bg-rose-50 border-rose-200';
      case 'open_meteo': return 'bg-amber-50 border-amber-200';
      case 'citizen_reports': return 'bg-indigo-50 border-indigo-200';
      case 'postgis_db': return 'bg-emerald-50 border-emerald-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'connected':
        return { badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, bar: 'bg-emerald-500' };
      case 'available':
        return { badge: 'bg-sky-50 text-sky-800 border-sky-200', dot: 'bg-sky-500', icon: <Activity className="w-4 h-4 text-sky-600" />, bar: 'bg-sky-500' };
      case 'degraded':
        return { badge: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500 animate-pulse', icon: <AlertTriangle className="w-4 h-4 text-amber-600" />, bar: 'bg-amber-500' };
      case 'unavailable':
        return { badge: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-500', icon: <XCircle className="w-4 h-4 text-rose-600" />, bar: 'bg-rose-500' };
      default:
        return { badge: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-400', icon: <Radio className="w-4 h-4 text-slate-500" />, bar: 'bg-slate-400' };
    }
  };

  const healthyCount = sources.filter(s => s.status === 'connected' || s.status === 'available').length;

  return (
    <div className="space-y-5">
      {/* ===== HERO HEADER ===== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0f2744] to-[#0a1e3d] shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30 inline-flex">
                  <Radio className="w-5 h-5 text-emerald-400" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Data Pipeline &amp; Telemetry Source Health
                </h1>
                {sources.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 rounded-full font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {healthyCount}/{sources.length} Operational
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Real-time connectivity, latency, and telemetry ingestion health across all synchronized environmental surveillance feeds.
              </p>
            </div>
            <button
              onClick={loadHealth}
              disabled={loading}
              className="flex-shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[13px] font-semibold py-2.5 px-5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Ping All Pipelines
            </button>
          </div>
        </div>
      </div>

      {/* ===== SOURCES GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((source) => {
          const config = getStatusConfig(source.status);
          return (
            <div
              key={source.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col overflow-hidden"
            >
              {/* Card Top Status Bar */}
              <div className={`h-1 w-full ${config.bar}`} />

              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-3 rounded-xl border ${getSourceIconBg(source.source_key)}`}>
                    {getSourceIcon(source.source_key)}
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${config.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    {source.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-[14px] text-slate-900 leading-tight">{source.name}</h3>
                  <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">{source.category}</span>
                </div>

                {source.details && (
                  <p className="text-[12px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {source.details}
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-5 pb-4 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-medium">Endpoint:</span>
                  <span className="font-mono text-[10px] text-slate-700 truncate max-w-[160px]">{source.endpoint}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-medium">Records Synced:</span>
                  <span className="font-mono font-bold text-slate-900">{source.records_count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-medium">Last Ping:</span>
                  <span className="font-mono text-[10px] text-slate-600">{formatTimestamp(source.last_ping_at)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
