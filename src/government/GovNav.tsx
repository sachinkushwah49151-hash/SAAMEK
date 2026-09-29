import React from 'react';
import type { GovTab } from '../types';
import {
  Activity,
  AlertTriangle,
  FileCheck2,
  Map,
  BarChart3,
  Radio,
} from 'lucide-react';

interface GovNavProps {
  activeTab: GovTab;
  onTabChange: (tab: GovTab) => void;
  pendingReportsCount?: number;
  activeIncidentsCount?: number;
}

export const GovNav: React.FC<GovNavProps> = ({
  activeTab,
  onTabChange,
  pendingReportsCount = 0,
  activeIncidentsCount = 0,
}) => {
  const navItems: { id: GovTab; label: string; icon: React.ReactNode; badge?: string; badgeColor?: string }[] = [
    {
      id: 'command-center',
      label: 'Command Center',
      icon: <Activity className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
    },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: <AlertTriangle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      badge: activeIncidentsCount > 0 ? `${activeIncidentsCount} Active` : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileCheck2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      badge: pendingReportsCount > 0 ? `${pendingReportsCount} Pending` : undefined,
      badgeColor: 'bg-amber-400 text-slate-950',
    },
    {
      id: 'environmental-map',
      label: 'Environmental Map',
      icon: <Map className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
    },
    {
      id: 'data-sources',
      label: 'Data Sources',
      icon: <Radio className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
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
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5 ${
                      item.badgeColor || 'bg-white/15 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
