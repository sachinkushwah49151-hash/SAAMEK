import React, { useState } from 'react';
import type { UserRole, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { OfficialTopBar } from '../components/OfficialTopBar';
import { Header } from '../components/Header';
import { RoleSelector } from '../components/RoleSelector';
import { LoginForm } from '../components/LoginForm';
import { SecurityNotice } from '../components/SecurityNotice';
import { Footer } from '../components/Footer';
import { Lock } from 'lucide-react';

interface LoginPageProps {
  onCitizenLogin?: (lang: SupportedLanguage) => void;
  onGovLogin?: (officerId: string, lang: SupportedLanguage) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onCitizenLogin, onGovLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('government');
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f9] text-slate-900 selection:bg-[#003366] selection:text-white">
      {/* Official Government Top Bar */}
      <OfficialTopBar
        t={t}
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      {/* Main Platform Header with Top-Right Language Selector */}
      <Header
        t={t}
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-[460px]">
          {/* Main Login Card */}
          <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
            {/* Card Header Strip */}
            <div className="bg-[#003366] px-5 py-3 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-slate-200" />
                <h2 className="text-sm sm:text-[15px] font-bold tracking-wide">
                  {t.gatewayTitle}
                </h2>
              </div>
              <span className="text-xs font-semibold bg-[#0f294a] text-slate-100 px-2.5 py-0.5 rounded border border-[#2b4c7e]">
                {t.secureAccess}
              </span>
            </div>

            {/* Card Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Compact Two-Button Role Selector */}
              <RoleSelector
                selectedRole={selectedRole}
                onSelectRole={setSelectedRole}
                t={t}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-500 font-semibold uppercase tracking-wider">
                    {t.enterCredentials}
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <LoginForm
                key={`${selectedRole}-${language}`}
                selectedRole={selectedRole}
                t={t}
                onCitizenLogin={() => onCitizenLogin?.(language)}
                onGovLogin={(officerId) => onGovLogin?.(officerId, language)}
              />

              {/* Security and Compliance Notice */}
              <SecurityNotice selectedRole={selectedRole} t={t} />
            </div>
          </div>

          {/* Quick Help / System Status Note */}
          <div className="mt-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <span>{t.portalVersion}</span>
            <span>•</span>
            <span>{t.sslEncrypted}</span>
            <span>•</span>
            <span>{t.serverTime}</span>
          </div>
        </div>
      </main>

      {/* Official Government Footer */}
      <Footer t={t} />
    </div>
  );
};
