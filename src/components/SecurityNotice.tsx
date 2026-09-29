import React from 'react';
import type { UserRole } from '../types';
import type { TranslationStrings } from '../i18n/translations';
import { Shield, Info } from 'lucide-react';

interface SecurityNoticeProps {
  selectedRole: UserRole;
  t: TranslationStrings;
}

export const SecurityNotice: React.FC<SecurityNoticeProps> = ({ selectedRole, t }) => {
  return (
    <div className="pt-3 border-t border-slate-200">
      <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-xs sm:text-[12.5px] text-slate-700 flex items-start space-x-2.5">
        {selectedRole === 'government' ? (
          <Shield className="w-4 h-4 text-[#003366] flex-shrink-0 mt-0.5" />
        ) : (
          <Info className="w-4 h-4 text-[#003366] flex-shrink-0 mt-0.5" />
        )}
        <div className="leading-relaxed">
          {selectedRole === 'government' ? (
            <p>
              <strong className="text-slate-900 font-semibold">{t.govNoticeTitle}</strong>{' '}
              {t.govNotice}
            </p>
          ) : (
            <p>
              <strong className="text-slate-900 font-semibold">{t.citizenNoticeTitle}</strong>{' '}
              {t.citizenNotice}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
