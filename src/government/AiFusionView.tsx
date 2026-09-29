import React, { useState } from 'react';
import type { TranslationStrings } from '../i18n/translations';
import type { SignalSourceType, GovTab } from '../types';
import {
  MOCK_FUSION_CASES,
  FUSION_SOURCE_CHANNELS,
} from './mockGovData';
import {
  Sparkles,
  Users,
  CloudSun,
  Radio,
  Satellite,
  Flame,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Layers,
  Activity,
  Cpu,
  Sliders,
  Check,
  Building,
  Info,
  ExternalLink,
} from 'lucide-react';

interface AiFusionViewProps {
  t?: TranslationStrings;
  onNavigateToTab?: (tab: GovTab) => void;
  onInspectIncident?: (incidentId: string) => void;
}

export const AiFusionView: React.FC<AiFusionViewProps> = ({
  onNavigateToTab,
  onInspectIncident,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(MOCK_FUSION_CASES[0].id);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [officerDecision, setOfficerDecision] = useState<'pending' | 'concurred' | 'escalated'>('pending');
  const [officerNote, setOfficerNote] = useState<string>('');
  const [showNoteSaved, setShowNoteSaved] = useState<boolean>(false);

  // Custom Simulator State
  const [enabledSignals, setEnabledSignals] = useState<Record<string, boolean>>({
    'sig-1': true,
    'sig-2': true,
    'sig-3': true,
    'sig-4': true,
    'sig-5': true,
  });

  const currentCase = MOCK_FUSION_CASES.find((c) => c.id === selectedCaseId) || MOCK_FUSION_CASES[0];

  const handleCaseChange = (caseId: string) => {
    setIsSynthesizing(true);
    setSelectedCaseId(caseId);
    setOfficerDecision('pending');
    setOfficerNote('');
    setShowNoteSaved(false);

    // Initialize custom toggle signals for this case
    const targetCase = MOCK_FUSION_CASES.find((c) => c.id === caseId) || MOCK_FUSION_CASES[0];
    const initialMap: Record<string, boolean> = {};
    targetCase.signals.forEach((s) => {
      initialMap[s.id] = true;
    });
    setEnabledSignals(initialMap);

    setTimeout(() => {
      setIsSynthesizing(false);
    }, 450);
  };

  const toggleSignal = (signalId: string) => {
    setEnabledSignals((prev) => ({
      ...prev,
      [signalId]: !prev[signalId],
    }));
  };

  const activeSignals = currentCase.signals.filter(
    (s) => enabledSignals[s.id] !== false
  );

  // Dynamic confidence calculation based on enabled signals
  const dynamicConfidence = Math.min(
    99,
    Math.round((activeSignals.length / currentCase.signals.length) * currentCase.overallConfidencePct)
  );

  const getSourceIcon = (sourceType: SignalSourceType, className = 'w-4 h-4') => {
    switch (sourceType) {
      case 'citizen':
        return <Users className={className} />;
      case 'weather':
        return <CloudSun className={className} />;
      case 'air_quality':
        return <Radio className={className} />;
      case 'satellite':
        return <Satellite className={className} />;
      case 'thermal_fire':
        return <Flame className={className} />;
      case 'hotspot':
        return <MapPin className={className} />;
      default:
        return <Activity className={className} />;
    }
  };

  const getSourceBadgeColor = (sourceType: SignalSourceType) => {
    switch (sourceType) {
      case 'citizen':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'weather':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'air_quality':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'satellite':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'thermal_fire':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'hotspot':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  const handleSaveDecision = () => {
    setShowNoteSaved(true);
    setTimeout(() => setShowNoteSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. AI FUSION ATMOSPHERIC HERO & ARCHITECTURAL OVERVIEW
          ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0c2340] via-[#003366] to-[#081a2f] text-white rounded-2xl shadow-md border border-slate-700/50 p-6 sm:p-8">
        {/* Subtle Ambient SVG Waves */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
          <svg viewBox="0 0 1200 400" className="w-full h-full object-cover" preserveAspectRatio="none" fill="none">
            <path d="M0 280 Q300 190 600 240 T1200 210 L1200 400 L0 400 Z" fill="#38bdf8" opacity="0.3" />
            <path d="M0 320 Q200 260 500 300 T1200 280 L1200 400 L0 400 Z" fill="#ffffff" opacity="0.2" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                ENVIRONMENTAL INTELLIGENCE & SIGNAL SYNTHESIS
              </span>
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                Multi-Source Correlation Engine (v2.4)
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-serif leading-tight">
              AI Fusion & Environmental Correlation
            </h1>

            <p className="text-sm sm:text-base text-slate-200/95 leading-relaxed">
              Transforms disparate environmental streams—citizen ground sightings, meteorological boundary inversion layers, CAAQMS sensor spikes, and NASA orbital thermal radiometry—into unified, actionable environmental intelligence for Government officials.
            </p>
          </div>

          {/* Demonstration Notice Card */}
          <div className="lg:w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 space-y-2 text-xs text-blue-100 shadow-inner">
            <div className="flex items-center gap-2 font-bold text-white">
              <Info className="w-4 h-4 text-cyan-300 shrink-0" />
              <span>AI-Assisted Interpretation</span>
            </div>
            <p className="text-blue-200/90 leading-relaxed text-[11px]">
              This layer synthesizes probable environmental contexts to assist official reviews. All administrative and enforcement decisions remain strictly with authorized officers.
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-cyan-300">
              <span>Status: Online</span>
              <span>6 Feed Channels Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. FUSION OVERVIEW — 6-SOURCE TELEMETRY STATUS CHANNELS
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#003366]" />
              <span>Multi-Source Signal Ingestion Channels</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous multi-spectral data sources cross-correlated by the AI Fusion engine
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 w-fit">
            6 Connected Signal Modalities
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FUSION_SOURCE_CHANNELS.map((channel, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg border ${getSourceBadgeColor(channel.type)}`}>
                    {getSourceIcon(channel.type, 'w-4 h-4')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">{channel.name}</h3>
                    <span className="text-[11px] text-slate-500 font-medium block">{channel.subTitle}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {channel.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{channel.description}</p>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Today: {channel.signalCountToday.toLocaleString()} pkts</span>
                <span>Latency: {channel.dataLatency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          3. FUSED ENVIRONMENTAL EVENT SELECTOR & SYNTHESIS FLOW
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Case Switcher Tabs */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 block">
                Active Fused Intelligence Cases
              </span>
              <h2 className="text-lg font-bold text-slate-900">Select Correlated Environmental Scenario</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Click to inspect multi-signal synthesis & AI assessment
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {MOCK_FUSION_CASES.map((fCase) => {
              const isSelected = selectedCaseId === fCase.id;
              return (
                <button
                  key={fCase.id}
                  onClick={() => handleCaseChange(fCase.id)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono font-bold text-[#003366] bg-white px-2 py-0.5 rounded border border-slate-200">
                      {fCase.caseCode}
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                        fCase.fusedAssessment.riskTier.includes('Critical')
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {fCase.fusedAssessment.riskTier.split(' - ')[0]}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                    {fCase.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{fCase.location}</span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">Confidence:</span>
                    <span className="font-bold font-mono text-blue-900">{fCase.overallConfidencePct}% (High)</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            4. VISUAL SIGNAL CORRELATION FLOW GRAPH (NODES -> ENGINE -> CONTEXT)
            ========================================================================= */}
        <div className="bg-slate-50/90 rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#003366]" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Interactive Signal Correlation Matrix & Visual Flow
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle individual signal nodes below to simulate real-time confidence changes in the fusion engine
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Active Inputs:</span>
              <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900">
                {activeSignals.length} / {currentCase.signals.length} Signals
              </span>
            </div>
          </div>

          {/* Flow Diagram: Signal Nodes -> AI Fusion Core -> Synthesized Result */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* LEFT: Raw Signal Input Nodes (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>1. Multi-Source Raw Inputs</span>
                <span className="text-[10px] text-blue-700 lowercase font-medium">click to toggle</span>
              </div>

              <div className="space-y-2">
                {currentCase.signals.map((sig) => {
                  const isEnabled = enabledSignals[sig.id] !== false;
                  return (
                    <div
                      key={sig.id}
                      onClick={() => toggleSignal(sig.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                        isEnabled
                          ? 'bg-white border-slate-200 shadow-2xs hover:border-blue-400'
                          : 'bg-slate-100/70 border-dashed border-slate-300 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${getSourceBadgeColor(sig.sourceType)}`}>
                          {getSourceIcon(sig.sourceType, 'w-3.5 h-3.5')}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">{sig.title}</span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-600 mt-0.5 truncate">{sig.rawValue}</p>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{sig.sourceName} • {sig.timestamp}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isEnabled ? `${sig.confidence}% Conf.` : 'Omitted'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CENTER: AI Fusion Core Connector (2 cols) */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center py-4 lg:py-0 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0c2340] to-[#003366] text-white flex flex-col items-center justify-center shadow-lg border border-sky-400/30 relative">
                <Sparkles className={`w-7 h-7 text-cyan-300 ${isSynthesizing ? 'animate-spin' : ''}`} />
                <span className="text-[9px] font-bold tracking-tight text-cyan-200 mt-1 uppercase">AI Fusion</span>
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/40 animate-pulse pointer-events-none" />
              </div>

              <div className="text-xs text-slate-600 font-medium space-y-1">
                <span className="font-bold text-slate-900 block">Correlation Core</span>
                <span className="text-[11px] text-slate-500 block font-mono">Cross-Referencing</span>
              </div>

              <div className="hidden lg:flex items-center justify-center text-slate-400">
                <ArrowRight className="w-5 h-5 text-blue-600 animate-pulse" />
              </div>
            </div>

            {/* RIGHT: Synthesized Environmental Assessment Snapshot (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Fused Synthesis</span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    dynamicConfidence >= 80
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : dynamicConfidence >= 50
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {dynamicConfidence}% Corroboration
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Synthesized Context</span>
                <p className="text-xs text-slate-800 font-medium mt-1 leading-relaxed">
                  {currentCase.fusedAssessment.summary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Risk Tier</span>
                  <span className="font-bold text-rose-700 text-xs mt-0.5 block truncate">
                    {currentCase.fusedAssessment.riskTier}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Plume Impact Area</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                    {currentCase.fusedAssessment.affectedRadiusKm} km radius
                  </span>
                </div>
              </div>

              {currentCase.incidentRefId && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">Linked Incident: {currentCase.incidentRefId}</span>
                  <button
                    onClick={() => onInspectIncident?.(currentCase.incidentRefId!)}
                    className="font-bold text-[#003366] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Dossier</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            5. STRUCTURED AI INSIGHTS DOSSIER (STRUCTURED OFFICIAL REPORT)
            ========================================================================= */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
              <span>Structured Environmental Intelligence Dossier</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Synthesized: {currentCase.synthesisTime}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box A: Environmental Context & Dynamics */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  1. Environmental Situation & Corroborated Evidence
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  {currentCase.fusedAssessment.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Probable Root Mechanism</span>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {currentCase.fusedAssessment.probableCause}
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Dispersion & Plume Vector</span>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {currentCase.fusedAssessment.dispersionDynamics}
                </p>
              </div>
            </div>

            {/* Box B: Action Protocol & Uncertainty Matrix */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    2. Recommended Government Action Protocol
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-800">
                    {currentCase.fusedAssessment.recommendedActions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    3. Scientific Uncertainties & Verification Needs
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {currentCase.fusedAssessment.uncertainties.map((unc, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-amber-50/70 text-amber-900 p-2 rounded-lg border border-amber-200/80">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span className="leading-snug">{unc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>Assessment Model: NEDA Multi-Stream Fusion</span>
                <span className="text-slate-400 font-mono">Ref: {currentCase.caseCode}</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              6. OFFICIAL REVIEW & DECISION CONSOLE (HUMAN IN THE LOOP)
              ========================================================================= */}
          <div className="bg-blue-50/80 rounded-xl border border-blue-200 p-5 space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#003366]" />
                <h4 className="text-sm font-bold text-slate-900">Officer Review & Action Confirmation</h4>
              </div>
              <span className="text-xs text-blue-900 font-medium">Official Administrative Sign-Off</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Verify this AI-synthesized environmental assessment. Confirming concurrence will log your official endorsement and facilitate direct dispatch mobilization in the Incident Management module.
            </p>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setOfficerDecision('concurred')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    officerDecision === 'concurred'
                      ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/30'
                      : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Concur with AI Synthesis & Authorize Squad</span>
                </button>

                <button
                  onClick={() => setOfficerDecision('escalated')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    officerDecision === 'escalated'
                      ? 'bg-amber-700 text-white shadow-sm ring-2 ring-amber-500/30'
                      : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Request Additional Drone / Ground Verification</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  placeholder="Optional duty officer endorsement remarks or special instructions..."
                  className="flex-1 px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#003366]"
                />
                <button
                  onClick={handleSaveDecision}
                  className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>Record Official Note</span>
                </button>
              </div>

              {showNoteSaved && (
                <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Official endorsement logged successfully to case audit log.</span>
                </div>
              )}
            </div>

            {/* Cross-Module Action Shortcuts */}
            <div className="pt-3 border-t border-blue-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 font-medium">Surveillance Module Shortcuts:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToTab?.('incidents')}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#003366] font-bold border border-slate-300 shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Dispatch Incident Squads</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigateToTab?.('environmental-map')}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#003366] font-bold border border-slate-300 shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Open Intelligence Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
