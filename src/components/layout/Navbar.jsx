import React, { useState } from 'react';
import { 
  LayoutDashboard,
  Calendar as CalendarIcon, 
  Smile, 
  Target, 
  Layers, 
  BookOpen, 
  Image as ImageIcon, 
  TrendingUp, 
  LogOut, 
  Download, 
  RotateCcw,
  Menu,
  X,
  Globe
} from 'lucide-react';
import { logoutUser, resetDemoData } from '../../services/auth';
import { useLanguage } from '../../i18n/LanguageContext';
import NotificationBell from './NotificationBell';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onOpenBackup,
  userData,
  onOpenMoodCheckIn
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, lang, setLang } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'calendar', label: t('nav.calendar'), icon: CalendarIcon },
    { id: 'mood', label: t('nav.mood'), icon: Smile },
    { id: 'stats', label: t('nav.stats'), icon: TrendingUp },
    { id: 'goals', label: t('nav.goals'), icon: Target },
    { id: 'sections', label: t('nav.sections'), icon: Layers },
    { id: 'notes', label: t('nav.notes'), icon: BookOpen },
    { id: 'media', label: t('nav.media'), icon: ImageIcon },
  ];

  const handleResetDemo = () => {
    if (window.confirm(t('nav.resetConfirm'))) {
      resetDemoData();
      alert(t('nav.resetDone'));
    }
  };

  const toggleLanguage = () => {
    setLang(lang === 'sv' ? 'en' : 'sv');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                  {t('app.title')}
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  {lang === 'sv' ? 'SE' : 'US'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">{t('app.tagline')}</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Controls & Actions */}
          <div className="hidden lg:flex items-center space-x-2.5">
            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              title={lang === 'sv' ? 'Switch to English (US holidays)' : 'Växla till svenska (svenska helgdagar)'}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition shadow-sm"
            >
              <span>{lang === 'sv' ? '🇸🇪 SV' : '🇺🇸 EN'}</span>
            </button>

            {currentUser?.isDemo && (
              <button
                onClick={handleResetDemo}
                title={t('nav.resetDemo')}
                className="flex items-center space-x-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-700/50 px-2.5 py-1.5 rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('nav.resetDemo')}</span>
              </button>
            )}

            {/* Notification Reminder Bell */}
            <NotificationBell 
              userData={userData}
              onOpenMoodCheckIn={onOpenMoodCheckIn}
              setActiveTab={setActiveTab}
            />

            <button
              onClick={onOpenBackup}
              title={t('nav.backup')}
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Profile badge */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden xl:block">
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                  {currentUser?.name || t('app.user')}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                  {currentUser?.isDemo ? t('app.demoActive') : currentUser?.email}
                </div>
              </div>
              <button
                onClick={logoutUser}
                title={t('nav.logout')}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile menu hamburger button */}
          <div className="flex items-center space-x-2 md:hidden">
            <NotificationBell 
              userData={userData}
              onOpenMoodCheckIn={onOpenMoodCheckIn}
              setActiveTab={setActiveTab}
            />
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 rounded bg-slate-800 text-xs font-bold text-slate-200"
            >
              {lang === 'sv' ? '🇸🇪' : '🇺🇸'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {t('nav.loggedInAs')} <span className="text-white font-medium">{currentUser?.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  toggleLanguage();
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-md hover:bg-slate-700"
              >
                {lang === 'sv' ? '🇸🇪 SV' : '🇺🇸 EN'}
              </button>
              <button
                onClick={() => {
                  onOpenBackup();
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-md hover:bg-slate-700"
              >
                {t('nav.backup')}
              </button>
              <button
                onClick={logoutUser}
                className="px-2.5 py-1.5 text-xs bg-red-900/30 text-red-300 border border-red-800/40 rounded-md hover:bg-red-900/50"
              >
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
