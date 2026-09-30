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
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: activeIncidentsCount > 0 ? `${activeIncidentsCount}` : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileCheck2 className="w-4 h-4" />,
      badge: pendingReportsCount > 0 ? `${pendingReportsCount}` : undefined,
      badgeColor: 'bg-amber-400 text-slate-950',
    },
    {
      id: 'environmental-map',
      label: 'Environmental Map',
      icon: <Map className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'data-sources',
      label: 'Data Sources',
      icon: <Radio className="w-4 h-4" />,
    },
  ];

  return (
    <nav className="w-full bg-gradient-to-r from-[#0a1628] via-[#0c2340] to-[#0a1e3d] border-b border-[#1a3254] shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex space-x-1 overflow-x-auto scrollbar-none py-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer relative group ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* Active left accent bar */}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-sky-400 rounded-full" />
                )}
                <span className={isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center ${
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
