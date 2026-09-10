import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import LoginModal from './components/auth/LoginModal';
import CalendarView from './components/calendar/CalendarView';
import MoodTracker from './components/mood/MoodTracker';
import StatisticsView from './components/stats/StatisticsView';
import GoalsView from './components/goals/GoalsView';
import LifeSectionsView from './components/sections/LifeSectionsView';
import NotesView from './components/notes/NotesView';
import MediaGallery from './components/media/MediaGallery';
import BackupModal from './components/settings/BackupModal';
import MoodCheckInModal from './components/mood/MoodCheckInModal';
import { getCurrentUser } from './services/auth';
import { getUserData, ensureUserData } from './services/storage';
import { getDayCalendarInfo } from './data/calendarHolidays.js';
import { format } from 'date-fns';
import { Sparkles, Calendar, Plus, Smile } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext.jsx';

export default function App() {
  const { t, lang, dateLocale } = useLanguage();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar');
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Global Quick Mood Check-in Modal
  const [isQuickMoodOpen, setIsQuickMoodOpen] = useState(false);
  const [quickMoodDate, setQuickMoodDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [quickMoodSlot, setQuickMoodSlot] = useState('morning');

  // Load / Reload user data
  const loadData = () => {
    if (currentUser?.email) {
      const data = getUserData(currentUser.email) || ensureUserData(currentUser.email, currentUser.isDemo, currentUser.name);
      setUserData(data);
    } else {
      setUserData(null);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for storage / auth changes
    const handleAuthChange = (e) => {
      const user = e.detail?.user || null;
      setCurrentUser(user);
    };

    const handleDataChange = (e) => {
      if (currentUser?.email && (!e.detail?.email || e.detail.email === currentUser.email)) {
        loadData();
      }
    };

    window.addEventListener('organizerAuthChanged', handleAuthChange);
    window.addEventListener('organizerDataChanged', handleDataChange);

    return () => {
      window.removeEventListener('organizerAuthChanged', handleAuthChange);
      window.removeEventListener('organizerDataChanged', handleDataChange);
    };
  }, [currentUser?.email]);

  // Today info based on chosen language
  const todayInfo = getDayCalendarInfo(new Date(), lang);

  const handleOpenMoodCheckIn = (dateStr, slot = 'morning') => {
    setQuickMoodDate(dateStr || format(new Date(), 'yyyy-MM-dd'));
    setQuickMoodSlot(slot);
    setIsQuickMoodOpen(true);
  };

  // If not logged in, show login modal
  if (!currentUser) {
    return <LoginModal onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* Subheader: Calendar Info Bar */}
      <div className="bg-slate-900/50 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="font-semibold text-white capitalize">
              {format(new Date(), 'EEEE d MMMM yyyy', { locale: dateLocale })}
            </span>
            <span>•</span>
            {todayInfo.nameDay && (
              <span className="text-slate-400">
                {t('app.namedayLabel')} <strong className="text-cyan-400 font-medium">{todayInfo.nameDay}</strong>
              </span>
            )}
            {todayInfo.holiday && (
              <span className="text-red-400 font-semibold bg-red-950/60 px-2 py-0.5 rounded-full border border-red-900/50">
                {todayInfo.flag} {todayInfo.holiday}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <button
              onClick={() => handleOpenMoodCheckIn(format(new Date(), 'yyyy-MM-dd'))}
              className="inline-flex items-center space-x-1 text-amber-300 hover:text-amber-200 transition"
            >
              <Smile className="w-3.5 h-3.5" />
              <span>{t('app.quickMoodBtn')}</span>
            </button>
            <span className="hidden sm:inline">•</span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              {t('app.dataBadge')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'calendar' && (
          <CalendarView
            events={userData?.events || []}
            moods={userData?.moods || []}
            goals={userData?.goals || []}
            notes={userData?.notes || []}
            userEmail={currentUser.email}
            onOpenMoodCheckIn={handleOpenMoodCheckIn}
          />
        )}

        {activeTab === 'mood' && (
          <MoodTracker
            moods={userData?.moods || []}
            userEmail={currentUser.email}
          />
        )}

        {activeTab === 'stats' && (
          <StatisticsView
            moods={userData?.moods || []}
            events={userData?.events || []}
            goals={userData?.goals || []}
            notes={userData?.notes || []}
            media={userData?.media || []}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsView
            goals={userData?.goals || []}
            userEmail={currentUser.email}
          />
        )}

        {activeTab === 'sections' && (
          <LifeSectionsView
            events={userData?.events || []}
            goals={userData?.goals || []}
            notes={userData?.notes || []}
            media={userData?.media || []}
          />
        )}

        {activeTab === 'notes' && (
          <NotesView
            notes={userData?.notes || []}
            userEmail={currentUser.email}
          />
        )}

        {activeTab === 'media' && (
          <MediaGallery
            media={userData?.media || []}
            userEmail={currentUser.email}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t('app.footerLeft')}</span>
          <span>{t('app.footerRight')}</span>
        </div>
      </footer>

      {/* Quick Mood Check-in Modal */}
      <MoodCheckInModal
        isOpen={isQuickMoodOpen}
        onClose={() => setIsQuickMoodOpen(false)}
        defaultDate={quickMoodDate}
        defaultSlot={quickMoodSlot}
        userEmail={currentUser.email}
      />

      {/* Backup & Export/Import Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        userEmail={currentUser.email}
        userData={userData}
      />
    </div>
  );
}
