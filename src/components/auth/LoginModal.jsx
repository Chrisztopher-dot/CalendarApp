import React, { useState } from 'react';
import { Calendar, Shield, Sparkles, ArrowRight, Lock, Mail, User } from 'lucide-react';
import { loginUser, registerUser, loginAsDemo } from '../../services/auth';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

export default function LoginModal({ onLoginSuccess }) {
  const { t, lang, setLang } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const user = registerUser(name, email, password);
        onLoginSuccess(user);
      } else {
        const user = loginUser(email, password);
        onLoginSuccess(user);
      }
    } catch (err) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setError('');
    setLoading(true);
    try {
      const user = loginAsDemo();
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative">
        {/* Language switch top-right in modal */}
        <div className="absolute top-4 right-4">
          <button
            type="button"
            onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition"
          >
            {lang === 'sv' ? '🇸🇪 SV' : '🇺🇸 EN'}
          </button>
        </div>

        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20">
            <Calendar className="w-7 h-7 text-white" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t('app.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('app.subtitle')}
          </p>
        </div>

        {/* Demo Mode Action Button */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 border border-cyan-500/30">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{t('auth.quickStartTitle')}</span>
          </div>
          <p className="text-xs text-slate-300 mb-3">
            {t('auth.quickStartDesc')}
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25 transition active:scale-[0.98]"
          >
            <span>{t('auth.openDemoBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs uppercase font-medium text-slate-500">{t('auth.orLoginWith')}</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/60 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">{t('auth.yourName')}</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Anna Andersson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold transition border border-slate-700"
          >
            {isRegister ? t('auth.createAccount') : t('auth.login')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-cyan-400 hover:underline"
          >
            {isRegister ? t('auth.haveAccount') : t('auth.newUser')}
          </button>
        </div>

        {/* LocalStorage Security Note */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-start space-x-2 text-[11px] text-slate-500">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p>
            {t('auth.privacyNote')} <code className="text-cyan-400">localStorage["organizerData_..."]</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
