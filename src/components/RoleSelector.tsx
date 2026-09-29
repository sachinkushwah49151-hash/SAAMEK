import React from 'react';
import type { UserRole } from '../types';
import type { TranslationStrings } from '../i18n/translations';
import { Landmark, Users } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  t: TranslationStrings;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onSelectRole,
  t,
}) => {
  return (
    <div className="w-full space-y-2">
      <label className="text-xs sm:text-[13px] font-bold text-slate-800 uppercase tracking-wider block">
        {t.selectCategory}
      </label>

      {/* Two Compact Login Buttons */}
      <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label={t.selectCategory}>
        {/* Government / Official Login Button */}
        <button
          type="button"
          onClick={() => onSelectRole('government')}
          role="radio"
          aria-checked={selectedRole === 'government'}
          className={`flex items-center justify-center gap-2 py-2.5 px-2.5 sm:px-3 rounded text-xs sm:text-sm font-semibold border transition-colors cursor-pointer text-center ${
            selectedRole === 'government'
              ? 'bg-[#003366] text-white border-[#003366] shadow-2xs'
              : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Landmark className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{t.govLogin}</span>
        </button>

        {/* Citizen / User Login Button */}
        <button
          type="button"
          onClick={() => onSelectRole('citizen')}
          role="radio"
          aria-checked={selectedRole === 'citizen'}
          className={`flex items-center justify-center gap-2 py-2.5 px-2.5 sm:px-3 rounded text-xs sm:text-sm font-semibold border transition-colors cursor-pointer text-center ${
            selectedRole === 'citizen'
              ? 'bg-[#003366] text-white border-[#003366] shadow-2xs'
              : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{t.citizenLogin}</span>
        </button>
      </div>

      {/* Supporting Text */}
      <p className="text-xs text-slate-600 font-medium">
        {selectedRole === 'government' ? t.govSupporting : t.citizenSupporting}
      </p>
    </div>
  );
};
