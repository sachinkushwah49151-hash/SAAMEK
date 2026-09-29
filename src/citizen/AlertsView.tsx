import React, { useState } from 'react';
import type { EnvironmentalAlert } from '../types';
import type { TranslationStrings } from '../i18n/translations';
import { MOCK_ALERTS } from './mockData';
import {
  AlertTriangle,
  Flame,
  Wind,
  Info,
  Calendar,
  MapPin,
  ShieldAlert,
  BellRing,
  CloudSun,
  Droplets,
  Radio,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface AlertsViewProps {
  t: TranslationStrings;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ t }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filteredAlerts = MOCK_ALERTS.filter((alert) => {
    if (filterSeverity === 'all') return true;
    return alert.severity.toLowerCase() === filterSeverity.toLowerCase();
  });

  const criticalCount = MOCK_ALERTS.filter((a) => a.severity === 'Critical').length;
  const warningCount = MOCK_ALERTS.filter((a) => a.severity === 'Warning').length;

  const getSeverityStyles = (severity: EnvironmentalAlert['severity']) => {
    switch (severity) {
      case 'Critical':
        return {
          cardBorder: 'border-l-4 border-l-red-600 border-slate-200/90',
          badge: 'bg-red-50 text-red-900 border-red-200',
          iconBg: 'bg-red-100 text-red-700',
          icon: <ShieldAlert className="w-4.5 h-4.5 text-red-600" />,
        };
      case 'Warning':
        return {
          cardBorder: 'border-l-4 border-l-amber-500 border-slate-200/90',
          badge: 'bg-amber-50 text-amber-900 border-amber-200',
          iconBg: 'bg-amber-100 text-amber-700',
          icon: <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />,
        };
      case 'Advisory':
        return {
          cardBorder: 'border-l-4 border-l-blue-500 border-slate-200/90',
          badge: 'bg-blue-50 text-blue-900 border-blue-200',
          iconBg: 'bg-blue-100 text-blue-700',
          icon: <Info className="w-4.5 h-4.5 text-blue-600" />,
        };
    }
  };

  const getAlertIcon = (category: EnvironmentalAlert['category']) => {
    switch (category) {
      case 'fire':
        return <Flame className="w-5 h-5 text-red-600" />;
      case 'pollution':
        return <Wind className="w-5 h-5 text-[#003366]" />;
      case 'incident':
        return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'warning':
        return <CloudSun className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          ATMOSPHERIC HERO & ACTIVE ADVISORIES BANNER
          ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0c2340] via-[#003366] to-[#0a2544] text-white rounded-2xl shadow-md border border-slate-700/50 p-6 sm:p-8 lg:p-9">
        {/* Subtle Ambient SVG Backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
          <svg viewBox="0 0 1200 400" className="w-full h-full object-cover" preserveAspectRatio="none" fill="none">
            <circle cx="1020" cy="100" r="130" fill="#f59e0b" />
            <path d="M0 320 Q280 230 580 290 T1200 250 L1200 400 L0 400 Z" fill="#ffffff" opacity="0.3" />
            <path d="M0 360 Q190 300 490 340 T1200 330 L1200 400 L0 400 Z" fill="#ffffff" opacity="0.4" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-amber-500/25 text-amber-200 border border-amber-400/40 backdrop-blur-md">
                <BellRing className="w-4 h-4 text-amber-300 animate-pulse" />
                Active Early-Warning Telemetry
              </span>
              <span className="text-xs sm:text-sm text-slate-200 font-medium flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-sky-400" />
                Regional Meteorological & Environmental Grid
              </span>
            </div>

            {/* LEVEL 1 — PAGE TITLE */}
            <h1 className="text-3xl sm:text-4xl lg:text-4.5xl font-bold tracking-tight text-white font-serif leading-tight">
              {t.alertsHeading}
            </h1>

            {/* LEVEL 5 — BODY SUBTITLE */}
            <p className="text-base sm:text-lg text-slate-200/95 leading-relaxed font-normal">
              {t.alertsSubtitle}
            </p>
          </div>

          {/* Right: Quick Active Threat Summary */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 p-4 rounded-2xl text-center min-w-[110px] shadow-inner">
              <span className="text-2xl sm:text-3xl font-black font-mono text-red-300 block">
                {criticalCount}
              </span>
              <span className="text-xs text-red-200 font-semibold mt-0.5 block">Critical Alerts</span>
            </div>

            <div className="bg-amber-500/20 backdrop-blur-md border border-amber-400/30 p-4 rounded-2xl text-center min-w-[110px] shadow-inner">
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300 block">
                {warningCount}
              </span>
              <span className="text-xs text-amber-200 font-semibold mt-0.5 block">Warnings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-800">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Filter Advisories:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm bg-slate-50 p-1.5 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              filterSeverity === 'all'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            {t.allAlertsTab} ({MOCK_ALERTS.length})
          </button>
          <button
            onClick={() => setFilterSeverity('critical')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterSeverity === 'critical'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-red-700 hover:bg-white/80'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{t.severityCritical}</span>
          </button>
          <button
            onClick={() => setFilterSeverity('warning')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterSeverity === 'warning'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-amber-700 hover:bg-white/80'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t.severityWarning}</span>
          </button>
          <button
            onClick={() => setFilterSeverity('advisory')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterSeverity === 'advisory'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-blue-700 hover:bg-white/80'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>{t.severityAdvisory}</span>
          </button>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const style = getSeverityStyles(alert.severity);
          return (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl p-6 sm:p-7 shadow-2xs border ${style.cardBorder} space-y-4 hover:shadow-md transition-all`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className={`p-3.5 rounded-xl ${style.iconBg} shadow-2xs flex-shrink-0`}>
                    {getAlertIcon(alert.category)}
                  </div>
                  <div>
                    {/* LEVEL 4 — ITEM TITLE */}
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      {alert.title}
                    </h2>
                    <span className="text-xs text-slate-500 font-mono">Advisory Notice #{alert.id}</span>
                  </div>
                </div>
                {/* Severity Badge */}
                <span className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full border ${style.badge}`}>
                  {style.icon}
                  <span>{alert.severity}</span>
                </span>
              </div>

              {/* LEVEL 6 — SECONDARY METADATA */}
              <div className="flex flex-wrap items-center text-xs sm:text-sm text-slate-600 gap-x-6 gap-y-1.5 pt-1">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  {alert.area}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {alert.date}
                </span>
              </div>

              {/* LEVEL 5 — BODY DESCRIPTION */}
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed pt-1">
                {alert.description}
              </p>

              {alert.guidelines && (
                <div className="mt-3.5 bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-5 text-sm sm:text-base text-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm sm:text-base">
                    <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                    <span>{t.guidelinesLabel}</span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-7">
                    {alert.guidelines}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
