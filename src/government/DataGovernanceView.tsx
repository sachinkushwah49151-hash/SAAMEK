import React, { useState } from 'react';
import {
  Server,
  Activity,
  RefreshCw,
  Database,
  CloudSun,
  Radio,
  Satellite,
  Users,
  ShieldCheck,
  Wifi,
  Clock,
  Check,
  Cpu,
} from 'lucide-react';
import { GOV_DATA_SOURCES } from './mockGovData';
import type { DataSourceFeed } from '../types';

export const DataGovernanceView: React.FC = () => {
  const [dataFeeds, setDataFeeds] = useState<DataSourceFeed[]>(GOV_DATA_SOURCES);
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [selectedFeed, setSelectedFeed] = useState<DataSourceFeed | null>(GOV_DATA_SOURCES[0]);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  const handlePingFeed = (feedId: string) => {
    setPingingId(feedId);
    setTimeout(() => {
      setDataFeeds((prev) =>
        prev.map((f) => {
          if (f.id === feedId) {
            const jitter = Math.floor(Math.random() * 30) - 15;
            const newLatency = Math.max(25, f.latencyMs + jitter);
            return {
              ...f,
              latencyMs: newLatency,
              lastSync: 'Just now (Pinged)',
              recordsToday: f.recordsToday + Math.floor(Math.random() * 12) + 1,
            };
          }
          return f;
        })
      );
      setPingingId(null);
      setLastRefreshed(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 600);
  };

  const handleRefreshAll = () => {
    setPingingId('ALL');
    setTimeout(() => {
      setDataFeeds((prev) =>
        prev.map((f) => {
          const jitter = Math.floor(Math.random() * 20) - 10;
          return {
            ...f,
            latencyMs: Math.max(30, f.latencyMs + jitter),
            lastSync: 'Just now (Synced)',
            recordsToday: f.recordsToday + Math.floor(Math.random() * 25) + 5,
          };
        })
      );
      setPingingId(null);
      setLastRefreshed(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 800);
  };

  const getCategoryIcon = (cat: DataSourceFeed['category']) => {
    switch (cat) {
      case 'weather':
        return <CloudSun className="w-5 h-5 text-sky-600" />;
      case 'air_quality':
        return <Radio className="w-5 h-5 text-indigo-600" />;
      case 'satellite':
        return <Satellite className="w-5 h-5 text-rose-600" />;
      case 'citizen':
        return <Users className="w-5 h-5 text-emerald-600" />;
      default:
        return <Database className="w-5 h-5 text-slate-600" />;
    }
  };

  const totalRecords = dataFeeds.reduce((acc, curr) => acc + curr.recordsToday, 0);
  const avgUptime = (dataFeeds.reduce((acc, curr) => acc + curr.uptime30d, 0) / dataFeeds.length).toFixed(2);
  const operationalCount = dataFeeds.filter((f) => f.status === 'Operational').length;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c2340] via-[#003366] to-[#0a192f] text-white p-6 md:p-8 shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold tracking-wide border border-white/15">
              <Server className="w-3.5 h-3.5" />
              <span>NATIONAL DATA INGESTION & PIPELINE GOVERNANCE</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Data Governance & Feed Health
            </h1>
            <p className="text-blue-100/90 text-sm md:text-base max-w-2xl leading-relaxed">
              Real-time audit of multi-source environmental telemetry pipelines, satellite orbital links, API SLA latencies, and citizen ground observation feeds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2 text-xs text-blue-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Synced: {lastRefreshed}</span>
            </div>
            <button
              onClick={handleRefreshAll}
              disabled={pingingId !== null}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${pingingId ? 'animate-spin' : ''}`} />
              <span>Ping All Feeds</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Pipeline Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Feed Status</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {operationalCount}/{dataFeeds.length}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              100% Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Zero pipeline interruptions</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Records Ingested Today</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalRecords.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-500">packets</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Continuous telemetry ingestion</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">30-Day SLA Uptime</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{avgUptime}%</span>
            <span className="text-xs font-bold text-emerald-700">Tier-3 Target</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">NIC Cloud infrastructure SLA</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Ingestion Latency</span>
            <Wifi className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {Math.round(dataFeeds.reduce((acc, f) => acc + f.latencyMs, 0) / dataFeeds.length)} ms
            </span>
            <span className="text-xs font-bold text-emerald-700">&lt; 500ms</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Sub-second stream processing</p>
        </div>
      </div>

      {/* 3. Feeds Grid & Detailed Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed Cards List (2 cols on large) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-700" />
              <span>Core Environmental Ingestion Channels</span>
            </h2>
            <span className="text-xs text-slate-500">4 Monitored Streams</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataFeeds.map((feed) => {
              const isSelected = selectedFeed?.id === feed.id;
              const isPinging = pingingId === feed.id || pingingId === 'ALL';

              return (
                <div
                  key={feed.id}
                  onClick={() => setSelectedFeed(feed)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all relative overflow-hidden bg-white shadow-sm hover:shadow-md ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Row: Icon + Name + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        {getCategoryIcon(feed.category)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">{feed.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">{feed.provider}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {feed.status}
                    </span>
                  </div>

                  {/* Metrics Snapshot */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 rounded-xl p-2">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Latency</span>
                      <span className="text-xs font-bold text-slate-900">{feed.latencyMs} ms</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Uptime</span>
                      <span className="text-xs font-bold text-emerald-700">{feed.uptime30d}%</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Integrity</span>
                      <span className="text-xs font-bold text-blue-700">{feed.dataIntegrityPct}%</span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{feed.lastSync}</span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePingFeed(feed.id);
                      }}
                      disabled={isPinging}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
                    >
                      <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin text-blue-600' : ''}`} />
                      <span>{isPinging ? 'Testing...' : 'Test Stream'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compliance & Data Policy Info Banner */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs text-slate-700 leading-relaxed">
              <h4 className="font-bold text-slate-900 text-sm">
                Compliance with National Environmental Data Architecture (NEDA)
              </h4>
              <p>
                All continuous emission and air quality data streams are cryptographically validated against CPCB digital certificates. Satellite telemetry passes through an automated false-positive reduction algorithm before feeding into the tactical intelligence map.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Feed Inspector Dossier */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          {selectedFeed ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    {getCategoryIcon(selectedFeed.category)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Feed Inspector</h3>
                    <p className="text-[11px] text-slate-500 font-mono">{selectedFeed.id}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Healthy
                </span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900">{selectedFeed.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{selectedFeed.provider}</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Endpoint Protocol</span>
                  <span className="font-mono text-slate-800 font-medium break-all mt-0.5 block">
                    {selectedFeed.endpoint}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Packets Today</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                      {selectedFeed.recordsToday.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Data Integrity</span>
                    <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                      {selectedFeed.dataIntegrityPct}%
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Pipeline Scope & Telemetry</span>
                  <p className="text-slate-700 leading-relaxed text-xs">{selectedFeed.notes}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => handlePingFeed(selectedFeed.id)}
                  disabled={pingingId !== null}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${pingingId === selectedFeed.id ? 'animate-spin' : ''}`} />
                  <span>{pingingId === selectedFeed.id ? 'Running Health Diagnostic...' : 'Execute Live Probe'}</span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Automated failover enabled via NIC Gateway</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <Server className="w-12 h-12 stroke-1 mb-2" />
              <p className="text-xs">Select a data feed to view live diagnostic details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
