import React from 'react';
import { format } from 'date-fns';
import { getDayCalendarInfo } from '../../data/calendarHolidays.js';
import { Clock, Plus, Smile, BookOpen, Target, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const SECTION_STYLES = {
  Work: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Health: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Activities: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Hobbies: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Production: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

const MOOD_EMOJIS = {
  1: '😫',
  2: '🙁',
  3: '😐',
  4: '🙂',
  5: '🤩'
};

export default function DayView({ 
  currentDate, 
  events = [], 
  moods = [], 
  goals = [], 
  notes = [], 
  onAddEvent, 
  onSelectEvent,
  onOpenMoodCheckIn
}) {
  const { t, lang, dateLocale } = useLanguage();
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const dayInfo = getDayCalendarInfo(currentDate, lang);

  const dayEvents = events
    .filter(e => e.date === dateStr)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  const dayMoods = moods.filter(m => m.date === dateStr);
  const dayNotes = notes.filter(n => n.date === dateStr);
  const dayGoals = goals.filter(g => g.targetDate === dateStr);

  const slotLabels = {
    morning: { label: t('mood.morning'), icon: '☀️' },
    afternoon: { label: t('mood.afternoon'), icon: '🌤️' },
    evening: { label: t('mood.evening'), icon: '🌙' }
  };

  return (
    <div className="space-y-6">
      {/* Day Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-semibold text-cyan-400 tracking-wider">
              {format(currentDate, 'EEEE', { locale: dateLocale })}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-0.5 capitalize">
              {format(currentDate, 'd MMMM yyyy', { locale: dateLocale })}
            </h2>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {dayInfo.holiday && (
                <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-950/80 text-red-300 border border-red-800/80">
                  <span>{dayInfo.flag}</span>
                  <span>{dayInfo.holiday} {dayInfo.holidayTypeLabel ? `(${dayInfo.holidayTypeLabel})` : ''}</span>
                </span>
              )}

              {dayInfo.nameDay && (
                <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  <span className="text-slate-500">{t('calendar.nameDay')}</span>
                  <span className="font-medium text-cyan-300">{dayInfo.nameDay}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onOpenMoodCheckIn(dateStr)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <Smile className="w-4 h-4 text-amber-400" />
              <span>{t('mood.logMoodBtn')}</span>
            </button>

            <button
              onClick={() => onAddEvent(dateStr)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('calendar.newEvent')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mood Check-ins for Today */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Smile className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">{t('stats.moodLogsCount')} (3x)</h3>
          </div>
          <button
            onClick={() => onOpenMoodCheckIn(dateStr)}
            className="text-xs text-cyan-400 hover:underline"
          >
            {t('mood.logMoodBtn')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['morning', 'afternoon', 'evening'].map((slot) => {
            const entry = dayMoods.find(m => m.slot === slot);

            return (
              <div 
                key={slot}
                onClick={() => onOpenMoodCheckIn(dateStr, slot)}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400 flex items-center space-x-1.5">
                    <span>{slotLabels[slot]?.icon}</span>
                    <span>{slotLabels[slot]?.label}</span>
                  </span>
                  {entry && (
                    <span className="text-2xl">{MOOD_EMOJIS[entry.score] || '😐'}</span>
                  )}
                </div>

                {entry ? (
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      {t('goals.progress')}: {entry.score}/5
                    </div>
                    {entry.activities && entry.activities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.activities.map(act => (
                          <span key={act} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                            #{t(`mood.activities.${act}`) || act}
                          </span>
                        ))}
                      </div>
                    )}
                    {entry.note && (
                      <p className="text-[11px] text-slate-400 italic mt-2 line-clamp-2">
                        "{entry.note}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-3 text-center">
                    {t('mood.notLoggedYet')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Events Timeline + Daily Notes & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Timeline (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{t('calendar.dailySchedule')} ({dayEvents.length})</span>
            </h3>
            <button
              onClick={() => onAddEvent(dateStr)}
              className="text-xs text-cyan-400 hover:underline"
            >
              + {t('calendar.add')}
            </button>
          </div>

          {dayEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              {t('calendar.noEventsPlanned')}
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((event) => {
                const style = SECTION_STYLES[event.section] || 'bg-slate-800 text-slate-300 border-slate-700';
                return (
                  <div
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition ${style}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-semibold opacity-90 flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-950/40">
                        {event.section}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white mt-1">{event.title}</div>
                    {event.description && (
                      <p className="text-xs opacity-80 mt-1.5">{event.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notes & Linked Goals for Date (1 Col) */}
        <div className="space-y-6">
          {/* Notes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>{t('stats.dayNotesTitle')} ({dayNotes.length})</span>
            </h3>
            {dayNotes.length === 0 ? (
              <p className="text-xs text-slate-500">{t('stats.noDayNotes')}</p>
            ) : (
              <div className="space-y-2">
                {dayNotes.map(n => (
                  <div key={n.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                    <div className="text-xs font-semibold text-slate-200">{n.title}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{n.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goals deadline */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>{t('stats.dayGoalsTitle')} ({dayGoals.length})</span>
            </h3>
            {dayGoals.length === 0 ? (
              <p className="text-xs text-slate-500">{t('stats.noDayGoals')}</p>
            ) : (
              <div className="space-y-2">
                {dayGoals.map(g => (
                  <div key={g.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-slate-200">{g.title}</div>
                      <div className="text-[10px] text-slate-400">{g.progress}% {t('goals.progress')}</div>
                    </div>
                    {g.completed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
