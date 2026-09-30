import React, { useState } from 'react';
import type { UserRole, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { OfficialTopBar } from '../components/OfficialTopBar';
import { Header } from '../components/Header';
import { RoleSelector } from '../components/RoleSelector';
import { LoginForm } from '../components/LoginForm';
import { SecurityNotice } from '../components/SecurityNotice';
import { Footer } from '../components/Footer';
import { Lock, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onCitizenLogin?: (lang: SupportedLanguage) => void;
  onGovLogin?: (officerId: string, lang: SupportedLanguage) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onCitizenLogin, onGovLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('government');
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8] text-slate-900 selection:bg-[#003366] selection:text-white">
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
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[480px]">
          {/* Main Login Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
            {/* Card Header Strip */}
            <div className="bg-gradient-to-r from-[#003366] via-[#0a2c52] to-[#0c3866] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Lock className="w-4 h-4 text-sky-300" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-[15px] font-black tracking-wide leading-none">
                    {t.gatewayTitle}
                  </h2>
                  <span className="text-[10px] text-sky-200/80 font-mono mt-0.5 block">National Environmental Grid</span>
                </div>
              </div>
              <span className="text-[11px] font-bold bg-white/10 text-white px-3 py-1 rounded-full border border-white/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {t.secureAccess}
              </span>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-7 space-y-5">
              {/* Two-Button Role Selector */}
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
                  <span className="bg-white px-3 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
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
          <div className="mt-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2 font-mono">
            <span>{t.portalVersion}</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">{t.sslEncrypted}</span>
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
