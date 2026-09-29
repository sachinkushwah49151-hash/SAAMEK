import React from 'react';
import type { SupportedLanguage } from '../types';
import type { TranslationStrings } from '../i18n/translations';
import { GovEmblem } from './GovEmblem';
import { LanguageSelector } from './LanguageSelector';
import { ShieldCheck } from 'lucide-react';

interface HeaderProps {
  t: TranslationStrings;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  t,
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200">
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
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  {t.nicAuth}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-700 tracking-normal mt-1 leading-snug">
                {t.descriptor}
              </p>
            </div>
          </div>

          {/* Right: Departmental reference + Language Dropdown */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex flex-col items-end text-right border-l border-slate-200 pl-4 py-0.5">
              <span className="text-xs font-bold text-[#003366] tracking-wide uppercase">
                {t.nationalPortal}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {t.authority}
              </span>
            </div>

            <div className="hidden sm:block pl-3 border-l border-slate-200">
              <LanguageSelector
                currentLanguage={currentLanguage}
                onLanguageChange={onLanguageChange}
                variant="card"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
