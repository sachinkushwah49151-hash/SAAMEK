import React from 'react';
import type { SupportedLanguage } from '../types';
import { LANGUAGES } from '../i18n/translations';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  className?: string;
  variant?: 'topbar' | 'card' | 'header';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  className = '',
  variant = 'card',
}) => {
  if (variant === 'topbar') {
    return (
      <div className={`flex items-center space-x-1.5 ${className}`}>
        <Globe className="w-3 h-3 text-slate-300" />
        <select
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          className="bg-[#0f294a] text-slate-200 border border-[#2b4c7e] rounded px-1.5 py-0.5 text-[10.5px] cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-300"
          aria-label="Select Interface Language"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-[#0c2340] text-slate-200">
              {lang.nativeName} ({lang.label})
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1.5 ${className}`}>
      <Globe className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
        className="bg-white text-slate-700 border border-slate-300 hover:border-slate-400 rounded px-2 py-1 text-xs font-medium cursor-pointer shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#003366] focus:border-[#003366] transition-colors"
        aria-label="Select Interface Language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="text-slate-900 bg-white">
            {lang.nativeName} — {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};
