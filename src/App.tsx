import { useState } from 'react';
import type { SupportedLanguage } from './types';
import { LoginPage } from './pages/LoginPage';
import { CitizenPortal } from './citizen/CitizenPortal';
import { GovernmentPortal } from './government/GovernmentPortal';
import { EnvironmentalProvider } from './context/EnvironmentalContext';

type AuthSession = {
  role: 'citizen' | 'government';
  language: SupportedLanguage;
  officerId?: string;
};

function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);

  const handleCitizenLogin = (lang: SupportedLanguage) => {
    setAuthSession({
      role: 'citizen',
      language: lang,
    });
  };

  const handleGovLogin = (officerId: string, lang: SupportedLanguage) => {
    setAuthSession({
      role: 'government',
      language: lang,
      officerId,
    });
  };

  const handleLogout = () => {
    setAuthSession(null);
  };

  return (
    <EnvironmentalProvider>
      {authSession?.role === 'citizen' && (
        <CitizenPortal
          initialLanguage={authSession.language}
          onLogout={handleLogout}
        />
      )}

      {authSession?.role === 'government' && (
        <GovernmentPortal
          initialLanguage={authSession.language}
          officerId={authSession.officerId}
          onLogout={handleLogout}
        />
      )}

      {!authSession && (
        <LoginPage
          onCitizenLogin={handleCitizenLogin}
          onGovLogin={handleGovLogin}
        />
      )}
    </EnvironmentalProvider>
  );
}

export default App;
