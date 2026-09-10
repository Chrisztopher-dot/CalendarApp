import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Smile, 
  Calendar as CalendarIcon, 
  Target, 
  BookOpen, 
  Image as ImageIcon, 
  Sparkles, 
  Sun, 
  Sunset, 
  Moon, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Plus, 
  TrendingUp,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { getDayCalendarInfo } from '../../data/calendarHolidays.js';
import { MOOD_LEVELS } from '../../data/moodConstants.js';
import { updateItem } from '../../services/storage.js';
import MoodCurveDiagram from '../stats/MoodCurveDiagram';
import DayDetailDrawer from '../stats/DayDetailDrawer';

export default function DashboardView({ 
  userData, 
  currentUser, 
  onOpenMoodCheckIn, 
  setActiveTab,
  userEmail
}) {
  const { t, lang, dateLocale } = useLanguage();
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const currentHour = now.getHours();
  const [inspectedDate, setInspectedDate] = useState(null);

  const events = userData?.events || [];
  const moods = userData?.moods || [];
  const goals = userData?.goals || [];
  const notes = userData?.notes || [];
  const media = userData?.media || [];

  // Calendar info for today
  const todayInfo = getDayCalendarInfo(now, lang);

  // Time-based greeting
  const greeting = currentHour < 12 
    ? t('dashboard.greetingMorning')
    : currentHour < 18
    ? t('dashboard.greetingAfternoon')
    : t('dashboard.greetingEvening');

  // Today's moods by slot
  const todayMoods = moods.filter(m => m.date === todayStr);
  const morningMood = todayMoods.find(m => m.slot === 'morning');
  const afternoonMood = todayMoods.find(m => m.slot === 'afternoon');
  const eveningMood = todayMoods.find(m => m.slot === 'evening');

  const todayAvgScore = todayMoods.length > 0
    ? (todayMoods.reduce((acc, m) => acc + (m.score || 3), 0) / todayMoods.length).toFixed(1)
    : null;

  // Today's events
  const todayEvents = events
    .filter(e => e.date === todayStr)
    .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

  // Goals statistics
  const completedGoalsCount = goals.filter(g => g.completed).length;
  const totalGoalsCount = goals.length;
  const goalsPercent = totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0;
  const activeGoals = goals.filter(g => !g.completed).slice(0, 4);

  // Recent Note
  const latestNote = [...notes].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0];

  // Recent Media
  const recentMedia = [...media].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  // Life domains config
  const lifeDomains = [
    { id: 'Work', label: t('sections.work'), color: 'from-blue-600 to-indigo-600', border: 'border-blue-500/30' },
    { id: 'Health', label: t('sections.health'), color: 'from-emerald-600 to-teal-600', border: 'border-emerald-500/30' },
    { id: 'Activities', label: t('sections.activities'), color: 'from-amber-600 to-orange-600', border: 'border-amber-500/30' },
    { id: 'Hobbies', label: t('sections.hobbies'), color: 'from-purple-600 to-violet-600', border: 'border-purple-500/30' },
    { id: 'Production', label: t('sections.production'), color: 'from-pink-600 to-rose-600', border: 'border-pink-500/30' },
  ];

  const handleToggleGoal = (goal, e) => {
    e.stopPropagation();
    try {
      updateItem(userEmail, 'goals', goal.id, { completed: !goal.completed });
    } catch (err) {
      console.error('Failed to toggle goal:', err);
    }
  };

  const getMoodLevel = (score) => {
    return MOOD_LEVELS.find(m => m.score === score) || MOOD_LEVELS[2];
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Welcome & Today Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('app.tagline')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {greeting}, <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{currentUser?.name || t('app.user')}</span>!
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {t('dashboard.welcomeSubtitle')}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-3 text-xs text-slate-300">
              <span className="font-semibold text-white capitalize bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                {format(now, 'EEEE d MMMM yyyy', { locale: dateLocale })}
              </span>

              {todayInfo.nameDay && (
                <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 text-slate-400">
                  {t('app.namedayLabel')} <strong className="text-cyan-400 font-medium">{todayInfo.nameDay}</strong>
                </span>
              )}

              {todayInfo.holiday && (
                <span className="bg-red-950/80 text-red-300 px-2.5 py-1 rounded-lg border border-red-800/60 font-semibold flex items-center space-x-1">
                  <span>{todayInfo.flag}</span>
                  <span>{todayInfo.holiday}</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap md:flex-col lg:flex-row gap-2.5">
            <button
              onClick={() => onOpenMoodCheckIn(todayStr, 'morning')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition flex items-center space-x-1.5 shadow-sm"
            >
              <Smile className="w-3.5 h-3.5" />
              <span>{t('nav.mood')}</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition flex items-center space-x-1.5 shadow-sm"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{t('dashboard.openCalendar')}</span>
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition flex items-center space-x-1.5 shadow-sm"
            >
              <Target className="w-3.5 h-3.5" />
              <span>{t('nav.goals')}</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Key Metrics Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3.5 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">{t('dashboard.statMoodAvg')}</div>
            <div className="text-xl font-bold text-white">
              {todayAvgScore ? `${todayAvgScore} / 5` : '—'}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3.5 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">{t('dashboard.statCompletedGoals')}</div>
            <div className="text-xl font-bold text-white">
              {completedGoalsCount} <span className="text-xs text-slate-500 font-normal">/ {totalGoalsCount} ({goalsPercent}%)</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3.5 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">{t('dashboard.statTodayEvents')}</div>
            <div className="text-xl font-bold text-white">
              {todayEvents.length}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3.5 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">{t('dashboard.statTotalMemories')}</div>
            <div className="text-xl font-bold text-white">
              {notes.length + media.length}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Split: Daily Mood 3x & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Mood 3x Check-ins */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mood 3x Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Smile className="w-4 h-4 text-amber-400" />
                  <span>{t('dashboard.todayMoodTitle')}</span>
                </h2>
                <p className="text-xs text-slate-400">{t('dashboard.todayMoodSubtitle')}</p>
              </div>
              <button
                onClick={() => setActiveTab('mood')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
              >
                <span>{t('nav.stats')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Morning */}
              <div className={`p-4 rounded-xl border transition-all ${
                morningMood 
                  ? 'bg-slate-950/80 border-cyan-500/30' 
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>{t('mood.morning')}</span>
                  </span>
                  <span className="text-[10px] text-slate-500">06:00 - 12:00</span>
                </div>

                {morningMood ? (
                  <div className="flex items-center space-x-2.5 mt-2">
                    <span className="text-2xl">{getMoodLevel(morningMood.score).emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white">{getMoodLevel(morningMood.score).label}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {morningMood.activities?.length ? morningMood.activities.join(', ') : t('dashboard.moodLogged')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenMoodCheckIn(todayStr, 'morning')}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t('dashboard.logMoodBtn')}</span>
                  </button>
                )}
              </div>

              {/* Afternoon */}
              <div className={`p-4 rounded-xl border transition-all ${
                afternoonMood 
                  ? 'bg-slate-950/80 border-cyan-500/30' 
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Sunset className="w-4 h-4 text-orange-400" />
                    <span>{t('mood.afternoon')}</span>
                  </span>
                  <span className="text-[10px] text-slate-500">12:00 - 18:00</span>
                </div>

                {afternoonMood ? (
                  <div className="flex items-center space-x-2.5 mt-2">
                    <span className="text-2xl">{getMoodLevel(afternoonMood.score).emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white">{getMoodLevel(afternoonMood.score).label}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {afternoonMood.activities?.length ? afternoonMood.activities.join(', ') : t('dashboard.moodLogged')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenMoodCheckIn(todayStr, 'afternoon')}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 transition flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t('dashboard.logMoodBtn')}</span>
                  </button>
                )}
              </div>

              {/* Evening */}
              <div className={`p-4 rounded-xl border transition-all ${
                eveningMood 
                  ? 'bg-slate-950/80 border-cyan-500/30' 
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>{t('mood.evening')}</span>
                  </span>
                  <span className="text-[10px] text-slate-500">18:00 - 24:00</span>
                </div>

                {eveningMood ? (
                  <div className="flex items-center space-x-2.5 mt-2">
                    <span className="text-2xl">{getMoodLevel(eveningMood.score).emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white">{getMoodLevel(eveningMood.score).label}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {eveningMood.activities?.length ? eveningMood.activities.join(', ') : t('dashboard.moodLogged')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenMoodCheckIn(todayStr, 'evening')}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t('dashboard.logMoodBtn')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Goals Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>{t('dashboard.activeGoalsTitle')}</span>
                </h2>
                <p className="text-xs text-slate-400">{completedGoalsCount} / {totalGoalsCount} {t('goals.completedBadge')}</p>
              </div>
              <button
                onClick={() => setActiveTab('goals')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
              >
                <span>{t('dashboard.viewAllGoals')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeGoals.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800/60">
                {t('dashboard.noActiveGoals')}
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeGoals.map(goal => (
                  <div
                    key={goal.id}
                    onClick={() => setActiveTab('goals')}
                    className="group p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <button
                        onClick={(e) => handleToggleGoal(goal, e)}
                        className="text-slate-500 hover:text-emerald-400 transition flex-shrink-0"
                      >
                        {goal.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition">
                          {goal.title}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="capitalize">{goal.period}</span>
                          {goal.targetDate && (
                            <>
                              <span>•</span>
                              <span>{goal.targetDate}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full"
                          style={{ width: `${goal.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 w-7 text-right">
                        {goal.progress || 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Today's Schedule & Life Domains */}
        <div className="space-y-6">
          {/* Today's Schedule Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-cyan-400" />
                <span>{t('dashboard.todaySchedule')}</span>
              </h2>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                {t('dashboard.openCalendar')}
              </button>
            </div>

            {todayEvents.length === 0 ? (
              <div className="p-6 text-center space-y-2 bg-slate-950/40 rounded-xl border border-slate-800/60">
                <p className="text-xs text-slate-400">{t('dashboard.noEventsToday')}</p>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition"
                >
                  {t('dashboard.addEventQuick')}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={() => setActiveTab('calendar')}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{event.title}</div>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{event.startTime || '—'} - {event.endTime || '—'}</span>
                      </div>
                    </div>
                    {event.section && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {event.section}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5 Life Domains Shortcut */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>{t('dashboard.domainsTitle')}</span>
              </h2>
              <button
                onClick={() => setActiveTab('sections')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                {t('dashboard.viewAllSections')}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {lifeDomains.map(domain => {
                const domainGoals = goals.filter(g => g.section === domain.id);
                const domainEvents = events.filter(e => e.section === domain.id);
                return (
                  <div
                    key={domain.id}
                    onClick={() => setActiveTab('sections')}
                    className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${domain.color}`} />
                      <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                        {domain.label}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {domainGoals.length} {t('nav.goals').toLowerCase()} • {domainEvents.length} {t('calendar.dailySchedule').split(' ')[1]?.toLowerCase() || 'händelser'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Interactive Mood Curve Diagram */}
      <MoodCurveDiagram
        moods={moods}
        onSelectDay={(dateStr) => setInspectedDate(dateStr)}
      />

      {/* 5. Bottom Row: Recent Journal Note & Photo Memories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Note Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>{t('dashboard.recentNotesTitle')}</span>
            </h2>
            <button
              onClick={() => setActiveTab('notes')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              {t('dashboard.viewAllNotes')}
            </button>
          </div>

          {latestNote ? (
            <div 
              onClick={() => setActiveTab('notes')}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white">{latestNote.title}</h4>
                <span className="text-[10px] text-slate-500">
                  {latestNote.updatedAt ? format(new Date(latestNote.updatedAt), 'yyyy-MM-dd') : ''}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">
                {latestNote.content}
              </p>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
              {t('dashboard.noNotesYet')}
            </div>
          )}
        </div>

        {/* Photo Memories Gallery */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-pink-400" />
              <span>{t('dashboard.recentMemoriesTitle')}</span>
            </h2>
            <button
              onClick={() => setActiveTab('media')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              {t('dashboard.viewGallery')}
            </button>
          </div>

          {recentMedia.length > 0 ? (
            <div className="grid grid-cols-4 gap-2.5">
              {recentMedia.map(item => (
                <div
                  key={item.id}
                  onClick={() => setActiveTab('media')}
                  className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer relative group"
                >
                  <img
                    src={item.dataUrl}
                    alt={item.caption || 'Memory'}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
              {t('dashboard.noMediaYet')}
            </div>
          )}
        </div>
      </div>

      {/* Side Drawer for Inspected Day from Diagram */}
      <DayDetailDrawer
        dateStr={inspectedDate}
        onClose={() => setInspectedDate(null)}
        moods={moods}
        events={events}
        goals={goals}
        notes={notes}
        media={media}
      />
    </div>
  );
}
