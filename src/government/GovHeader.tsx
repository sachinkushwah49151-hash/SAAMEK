import React from 'react';
import type { TranslationStrings } from '../i18n/translations';
import { GovEmblem } from '../components/GovEmblem';
import { LogOut, ShieldCheck, UserCheck } from 'lucide-react';

interface GovHeaderProps {
  t: TranslationStrings;
  officerId?: string;
  onLogout: () => void;
}

export const GovHeader: React.FC<GovHeaderProps> = ({ t, officerId = 'officer.env@nic.in', onLogout }) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-2xs">
      {/* Top Tricolor Strip */}
      <div className="h-[2px] w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-[#FFFFFF]" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Emblem + Brand + Departmental Credential */}
          <div className="flex items-center space-x-3.5">
            <GovEmblem size={50} className="h-12 w-auto flex-shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#003366] font-serif leading-none">
                  {t.platformTitle}
                </h1>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950 bg-amber-100 border border-amber-300/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                  <span>OFFICIAL COMMAND & RESPONSE</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-700 tracking-normal mt-1 leading-snug">
                Ministry of Environment, Forest and Climate Change • Integrated Surveillance Grid
              </p>
            </div>
          </div>

          {/* Right: Officer Credential Badge + Logout Button */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex flex-col items-end text-right border-r border-slate-200 pr-3">
              <span className="text-xs font-bold text-[#003366] flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                {officerId}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Gwalior Operations Desk • MPPCB Regional Office
              </span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-800 border border-slate-300 text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-xl transition-colors cursor-pointer shadow-2xs"
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
