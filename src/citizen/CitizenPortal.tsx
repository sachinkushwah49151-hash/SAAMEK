import React, { useState } from 'react';
import type { CitizenTab, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { EnvironmentalProvider } from '../context/EnvironmentalContext';
import { OfficialTopBar } from '../components/OfficialTopBar';
import { CitizenHeader } from './CitizenHeader';
import { CitizenNav } from './CitizenNav';
import { CitizenHomeView } from './CitizenHomeView';
import { ReportIssueView } from './ReportIssueView';
import { MyReportsView } from './MyReportsView';
import { CitizenMapView } from './CitizenMapView';
import { Footer } from '../components/Footer';

interface CitizenPortalProps {
  initialLanguage?: SupportedLanguage;
  onLogout: () => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  initialLanguage = 'en',
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<CitizenTab>('home');
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);

  const t = TRANSLATIONS[language];

  return (
    <EnvironmentalProvider>
      <div className="min-h-screen flex flex-col bg-[#f4f6f9] text-slate-900 selection:bg-[#003366] selection:text-white">
        {/* Top Official Banner */}
        <OfficialTopBar
          t={t}
          currentLanguage={language}
          onLanguageChange={setLanguage}
        />

        {/* Main Citizen Header */}
        <CitizenHeader
          t={t}
          onLogout={onLogout}
        />

        {/* 4-Tab Navigation Bar */}
        <CitizenNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          t={t}
        />

        {/* Main View Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {activeTab === 'home' && (
            <CitizenHomeView onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'report' && (
            <ReportIssueView
              onReportSubmitted={() => setActiveTab('my-reports')}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'my-reports' && (
            <MyReportsView onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'map' && (
            <CitizenMapView />
          )}
        </main>

        {/* Official Footer */}
        <Footer t={t} />
      </div>
    </EnvironmentalProvider>
  );
};
