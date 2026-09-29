import React, { useState } from 'react';
import type { SupportedLanguage, GovTab } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { EnvironmentalProvider } from '../context/EnvironmentalContext';
import { OfficialTopBar } from '../components/OfficialTopBar';
import { GovHeader } from './GovHeader';
import { GovNav } from './GovNav';
import { CommandCenterView } from './CommandCenterView';
import { IncidentManagementView } from './IncidentManagementView';
import { CitizenReportsTriageView } from './CitizenReportsTriageView';
import { GovIntelligenceMapView } from './GovIntelligenceMapView';
import { EnvironmentalAnalyticsView } from './EnvironmentalAnalyticsView';
import { DataSourcesHealthView } from './DataSourcesHealthView';
import { Footer } from '../components/Footer';

interface GovernmentPortalProps {
  initialLanguage?: SupportedLanguage;
  onLogout: () => void;
  officerId?: string;
}

export const GovernmentPortal: React.FC<GovernmentPortalProps> = ({
  initialLanguage = 'en',
  onLogout,
  officerId = 'officer.env@nic.in',
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [activeTab, setActiveTab] = useState<GovTab>('command-center');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const t = TRANSLATIONS[currentLanguage];

  const handleNavigateToTab = (tab: GovTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setActiveTab('incidents');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <EnvironmentalProvider>
      <div className="min-h-screen flex flex-col bg-[#f4f6f9] text-slate-900 selection:bg-[#003366] selection:text-white">
        {/* 1. Official Government Top Bar with Language Selector */}
        <OfficialTopBar
          t={t}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />

        {/* 2. Official Government Header with Officer Badge & Logout */}
        <GovHeader
          t={t}
          officerId={officerId}
          onLogout={onLogout}
        />

        {/* 3. 6-Module Government Navigation Bar */}
        <GovNav
          activeTab={activeTab}
          onTabChange={handleNavigateToTab}
        />

        {/* 4. Main Tab Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === 'command-center' && (
            <CommandCenterView
              onNavigateTab={handleNavigateToTab}
              onSelectIncident={handleNavigateToIncident}
              officerName={officerId}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentManagementView
              initialIncidentId={selectedIncidentId}
              onOpenMap={() => handleNavigateToTab('environmental-map')}
              officerName={officerId}
            />
          )}

          {activeTab === 'reports' && (
            <CitizenReportsTriageView
              onIncidentCreated={handleNavigateToIncident}
              officerName={officerId}
            />
          )}

          {activeTab === 'environmental-map' && (
            <GovIntelligenceMapView
              t={t}
              onNavigateToIncident={handleNavigateToIncident}
              officerName={officerId}
            />
          )}

          {activeTab === 'analytics' && (
            <EnvironmentalAnalyticsView />
          )}

          {activeTab === 'data-sources' && (
            <DataSourcesHealthView />
          )}
        </main>

        {/* 5. Official Government Footer */}
        <Footer t={t} />
      </div>
    </EnvironmentalProvider>
  );
};
