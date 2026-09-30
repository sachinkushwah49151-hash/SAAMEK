import React from 'react';
import type { TranslationStrings } from '../i18n/translations';
import { GovEmblem } from '../components/GovEmblem';
import { LogOut, ShieldCheck, UserCheck, Wifi } from 'lucide-react';

interface GovHeaderProps {
  t: TranslationStrings;
  officerId?: string;
  onLogout: () => void;
}

export const GovHeader: React.FC<GovHeaderProps> = ({ t, officerId = 'officer.env@nic.in', onLogout }) => {
  return (
    <header className="w-full bg-white border-b border-slate-200/80 shadow-sm">
      {/* Indian Tricolor Strip */}
      <div className="h-[3px] w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-white" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Emblem + Brand */}
          <div className="flex items-center space-x-4">
            <GovEmblem size={52} className="h-13 w-auto flex-shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2.5 mb-0.5">
                <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#003366] leading-none">
                  {t.platformTitle}
                </h1>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 px-2.5 py-1 rounded-full shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  OFFICIAL COMMAND &amp; RESPONSE
                </span>
              </div>
              <p className="text-[12px] sm:text-[13px] font-medium text-slate-500 tracking-wide leading-none">
                Ministry of Environment, Forest and Climate Change
                <span className="text-slate-300 mx-1.5">•</span>
                Integrated Surveillance Grid
              </p>
            </div>
          </div>

          {/* Right: Officer Credential + Status + Logout */}
          <div className="flex items-center gap-3">
            {/* Live Status Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold px-2.5 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi className="w-3.5 h-3.5" />
              <span>LIVE</span>
            </div>

            {/* Officer Badge */}
            <div className="hidden md:flex flex-col items-end text-right border-r border-slate-200 pr-3 mr-0">
              <span className="text-[12px] font-bold text-[#003366] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                {officerId}
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                Gwalior Operations Desk • MPPCB Regional Office
              </span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-700 border border-slate-300 text-xs sm:text-[13px] font-semibold py-2 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
              title="Logout to gateway"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t.logoutBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
