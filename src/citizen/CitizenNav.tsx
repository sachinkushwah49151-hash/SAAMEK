import React from 'react';
import type { CitizenTab } from '../types';
import type { TranslationStrings } from '../i18n/translations';
import {
  Home,
  FilePlus,
  ClipboardList,
  Map,
} from 'lucide-react';

interface CitizenNavProps {
  activeTab: CitizenTab;
  onTabChange: (tab: CitizenTab) => void;
  t?: TranslationStrings;
}

export const CitizenNav: React.FC<CitizenNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const navItems: { id: CitizenTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
    },
    {
      id: 'report',
      label: 'Report Issue',
      icon: <FilePlus className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
    },
    {
      id: 'my-reports',
      label: 'My Reports',
      icon: <ClipboardList className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
    },
    {
      id: 'map',
      label: 'Map',
      icon: <Map className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
    },
  ];

  return (
    <nav className="w-full bg-[#0c2340] text-slate-200 border-b border-[#1b3d6b] shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex space-x-1.5 sm:space-x-3 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-[14px] font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#003366] text-white shadow-xs border-b-2 border-amber-400'
                    : 'text-slate-300 hover:text-white hover:bg-[#13325c]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
