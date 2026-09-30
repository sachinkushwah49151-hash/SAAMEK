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
    <div className="w-full space-y-2.5">
      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block font-mono">
        {t.selectCategory}
      </label>

      {/* Two Login Role Buttons */}
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t.selectCategory}>
        {/* Government / Official Login Button */}
        <button
          type="button"
          onClick={() => onSelectRole('government')}
          role="radio"
          aria-checked={selectedRole === 'government'}
          className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl text-xs sm:text-[13px] font-bold border transition-all cursor-pointer text-center ${
            selectedRole === 'government'
              ? 'bg-[#003366] text-white border-[#003366] shadow-md ring-2 ring-[#003366]/20'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
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
          className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl text-xs sm:text-[13px] font-bold border transition-all cursor-pointer text-center ${
            selectedRole === 'citizen'
              ? 'bg-[#003366] text-white border-[#003366] shadow-md ring-2 ring-[#003366]/20'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{t.citizenLogin}</span>
        </button>
      </div>

      {/* Supporting Text */}
      <p className="text-[11px] text-slate-500 font-medium">
        {selectedRole === 'government' ? t.govSupporting : t.citizenSupporting}
      </p>
    </div>
  );
};
