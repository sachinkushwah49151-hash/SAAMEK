import React, { useState, useEffect } from 'react';
import type { SupportedLanguage } from '../types';
import type { TranslationStrings } from '../i18n/translations';
import { LanguageSelector } from './LanguageSelector';

interface OfficialTopBarProps {
  t: TranslationStrings;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

type FontScaleLevel = 'sm' | 'md' | 'lg';

const FONT_SCALE_STORAGE_KEY = 'saamek_font_scale';

export const OfficialTopBar: React.FC<OfficialTopBarProps> = ({
  t,
  currentLanguage,
  onLanguageChange,
}) => {
  const [fontScale, setFontScale] = useState<FontScaleLevel>(() => {
    try {
      const stored = localStorage.getItem(FONT_SCALE_STORAGE_KEY);
      if (stored === 'sm' || stored === 'md' || stored === 'lg') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'md';
  });

  // Apply font scale to document root
  const applyFontScale = (scale: FontScaleLevel) => {
    const root = document.documentElement;
    if (scale === 'sm') {
      root.style.fontSize = '90%'; // ~14.4px
    } else if (scale === 'lg') {
      root.style.fontSize = '110%'; // ~17.6px
    } else {
      root.style.fontSize = '100%'; // 16px default
    }
  };

  useEffect(() => {
    applyFontScale(fontScale);
  }, [fontScale]);

  const handleScaleChange = (scale: FontScaleLevel) => {
    setFontScale(scale);
    applyFontScale(scale);
    try {
      localStorage.setItem(FONT_SCALE_STORAGE_KEY, scale);
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full bg-[#0c2340] text-slate-200 text-xs sm:text-[13px] border-b border-[#1b3d6b]">
      {/* Subtle National Tricolor Ribbon */}
      <div className="h-[2px] w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-[#FFFFFF]" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-100">
            {t.govIndia}
          </span>
          <span className="hidden md:inline-block text-slate-500">•</span>
          <span className="hidden md:inline-block text-slate-300 font-medium">
            {t.ministry}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-300">
          <span className="hidden sm:inline-flex items-center gap-1.5 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            {t.officialGateway}
          </span>

          {/* Functional Typography Accessibility Controls (A− / A / A+) */}
          <div
            className="flex items-center space-x-1 pl-2.5 border-l border-slate-700"
            role="group"
            aria-label="Text Size Controls"
          >
            <button
              type="button"
              onClick={() => handleScaleChange('sm')}
              className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                fontScale === 'sm'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-2xs scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Decrease text size"
              title="Decrease text size (A−)"
            >
              A−
            </button>
            <button
              type="button"
              onClick={() => handleScaleChange('md')}
              className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                fontScale === 'md'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-2xs scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Reset text size"
              title="Reset text size (A)"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => handleScaleChange('lg')}
              className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                fontScale === 'lg'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-2xs scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Increase text size"
              title="Increase text size (A+)"
            >
              A+
            </button>
          </div>

          {/* Single Authoritative Language Selector */}
          <div className="pl-2.5 border-l border-slate-700">
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
              variant="topbar"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
