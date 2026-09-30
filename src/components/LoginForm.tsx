import React, { useState } from 'react';
import type { UserRole } from '../types';
import type { TranslationStrings } from '../i18n/translations';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginFormProps {
  selectedRole: UserRole;
  t: TranslationStrings;
  onCitizenLogin?: () => void;
  onGovLogin?: (officerId: string) => void;
}

const DEFAULT_CREDENTIALS: Record<UserRole, { id: string; pass: string }> = {
  government: {
    id: 'officer.env@nic.in',
    pass: 'Official@2026',
  },
  citizen: {
    id: 'citizen.user@saamek.in',
    pass: 'Citizen@2026',
  },
};

export const LoginForm: React.FC<LoginFormProps> = ({
  selectedRole,
  t,
  onCitizenLogin,
  onGovLogin,
}) => {
  const defaultCreds = DEFAULT_CREDENTIALS[selectedRole];
  const [identifier, setIdentifier] = useState(defaultCreds.id);
  const [password, setPassword] = useState(defaultCreds.pass);
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple frontend validation
    if (!identifier.trim() || !password.trim()) {
      setFeedback({
        type: 'error',
        message: t.fieldRequiredError,
      });
      return;
    }

    if (selectedRole === 'citizen') {
      // Transition to Citizen side
      if (onCitizenLogin) {
        onCitizenLogin();
        return;
      }
    }

    if (selectedRole === 'government') {
      // Transition to Government Portal
      if (onGovLogin) {
        onGovLogin(identifier.trim());
        return;
      }
    }

    // Fallback feedback
    setFeedback({
      type: 'success',
      message: t.loginSuccessGov(identifier),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {feedback && (
        <div
          role="alert"
          className={`p-3 rounded-xl text-xs sm:text-[13px] flex items-start space-x-2 border transition-all ${
            feedback.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 leading-snug">{feedback.message}</div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-1 cursor-pointer"
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* Email / User ID Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="identifier"
          className="block text-[12px] font-bold text-slate-700 tracking-wide font-mono"
        >
          {t.userIdLabel} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="identifier"
            name="identifier"
            type="text"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (feedback) setFeedback(null);
            }}
            placeholder={
              selectedRole === 'government' ? t.govPlaceholder : t.citizenPlaceholder
            }
            className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/60 text-slate-900 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] placeholder-slate-400 transition-all shadow-2xs"
            autoComplete="username"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-[12px] font-bold text-slate-700 tracking-wide font-mono"
        >
          {t.passwordLabel} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (feedback) setFeedback(null);
            }}
            placeholder={t.passwordPlaceholder}
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/60 text-slate-900 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] placeholder-slate-400 transition-all shadow-2xs"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Primary Login Button */}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#003366] to-[#0a2c52] hover:from-[#002852] hover:to-[#082240] text-white text-sm sm:text-[15px] font-bold py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#003366]/30 active:scale-[0.99]"
        >
          <LogIn className="w-4 h-4" />
          <span>{t.loginButton}</span>
        </button>
      </div>
    </form>
  );
};
