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
        return <Radio className="w-5 h-5 text-sky-600" />;
      case 'nasa_firms':
        return <Flame className="w-5 h-5 text-rose-600" />;
      case 'open_meteo':
        return <CloudSun className="w-5 h-5 text-amber-600" />;
      case 'citizen_reports':
        return <Users className="w-5 h-5 text-indigo-600" />;
      case 'postgis_db':
        return <Database className="w-5 h-5 text-emerald-600" />;
      default:
        return <Server className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'available':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'degraded':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'unavailable':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#003366]" />
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Data Pipeline & Telemetry Source Health
            </h1>
            <span className="text-[10px] font-mono bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 rounded font-bold">
              Surveillance Grid
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time connectivity, latency, and telemetry ingestion health across all synchronized environmental surveillance feeds.
          </p>
        </div>

        <button
          onClick={loadHealth}
          disabled={loading}
          className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Ping All Pipelines</span>
        </button>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((source) => (
          <div
            key={source.id}
            className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-3 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  {getSourceIcon(source.source_key)}
                </div>
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(
                    source.status
                  )}`}
                >
                  {source.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-snug">{source.name}</h3>
                <span className="text-[11px] font-semibold text-slate-500 block">{source.category}</span>
              </div>

              {source.details && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                  {source.details}
                </p>
              )}
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between py-0.5 text-slate-500">
                <span>Ingestion Endpoint:</span>
                <span className="font-mono text-[11px] text-slate-700 truncate max-w-[170px]">{source.endpoint}</span>
              </div>
              <div className="flex justify-between py-0.5 text-slate-500">
                <span>Records Synchronized:</span>
                <span className="font-mono font-bold text-slate-900">{source.records_count} records</span>
              </div>
              <div className="flex justify-between py-0.5 text-slate-500">
                <span>Last Verified Ping:</span>
                <span className="font-mono text-[10px] text-slate-700">{formatTimestamp(source.last_ping_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
