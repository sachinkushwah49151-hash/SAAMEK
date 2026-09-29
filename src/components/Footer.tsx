import React from 'react';
import type { TranslationStrings } from '../i18n/translations';

const CURRENT_YEAR = 2026;

interface FooterProps {
  t: TranslationStrings;
}

export const Footer: React.FC<FooterProps> = ({ t }) => {
  return (
    <footer className="w-full bg-[#0c2340] text-slate-300 text-xs sm:text-[12.5px] mt-auto border-t border-[#1b3d6b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-white text-xs sm:text-sm">{t.platformTitle}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">{t.descriptor}</span>
        </div>

        <div className="flex flex-wrap gap-x-3.5 gap-y-1 justify-center text-slate-300">
          <span className="hover:text-white cursor-default">{t.websitePolicies}</span>
          <span className="text-slate-600">•</span>
          <span className="hover:text-white cursor-default">{t.termsOfUse}</span>
          <span className="text-slate-600">•</span>
          <span className="hover:text-white cursor-default">{t.privacy}</span>
          <span className="text-slate-600">•</span>
          <span className="hover:text-white cursor-default">{t.helpdesk}</span>
        </div>

        <div className="text-slate-400">
          © {CURRENT_YEAR} {t.platformTitle} Portal.
        </div>
      </div>

      {/* Tricolor Accent Stripe */}
      <div className="h-[2px] w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-[#FFFFFF]" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>
    </footer>
  );
};
