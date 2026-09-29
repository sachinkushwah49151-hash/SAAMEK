import React from 'react';
import type { TranslationStrings } from '../i18n/translations';
import { GovEmblem } from '../components/GovEmblem';
import { LogOut, UserCheck } from 'lucide-react';

interface CitizenHeaderProps {
  t: TranslationStrings;
  onLogout: () => void;
}

export const CitizenHeader: React.FC<CitizenHeaderProps> = ({
  t,
  onLogout,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200">
      {/* Top Tricolor Strip */}
      <div className="h-[2px] w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-[#FFFFFF]" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Emblem + Brand */}
          <div className="flex items-center space-x-3.5">
            <GovEmblem size={50} className="h-12 w-auto flex-shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#003366] font-serif leading-none">
                  {t.platformTitle}
                </h1>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-950 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                  <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                  {t.citizenBadge}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-700 tracking-normal mt-1 leading-snug">
                {t.descriptor}
              </p>
            </div>
          </div>

          {/* Right: Logout Button Only */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-800 border border-slate-300 text-xs sm:text-sm font-semibold py-2 px-3.5 rounded transition-colors cursor-pointer"
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
