import React from 'react';
import { format, parseISO } from 'date-fns';
import { getDayCalendarInfo } from '../../data/calendarHolidays.js';
import { 
  X, 
  Smile, 
  Calendar, 
  Clock, 
  Target, 
  BookOpen, 
  Image as ImageIcon, 
  CheckCircle2
} from 'lucide-react';
import { MOOD_LEVELS, ACTIVITY_TAGS } from '../../data/moodConstants.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const SECTION_BADGES = {
  Work: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Health: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Activities: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Hobbies: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Production: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

export default function DayDetailDrawer({ 
  dateStr, 
  onClose, 
  moods = [], 
  events = [], 
  goals = [], 
  notes = [], 
  media = [] 
}) {
  const { t, lang, dateLocale } = useLanguage();
  if (!dateStr) return null;

  const parsedDate = parseISO(dateStr);
  const dayInfo = getDayCalendarInfo(parsedDate, lang);

  const dayMoods = moods.filter(m => m.date === dateStr);
  const dayEvents = events.filter(e => e.date === dateStr);
  const dayGoals = goals.filter(g => g.targetDate === dateStr);
  const dayNotes = notes.filter(n => n.date === dateStr);
  const dayMedia = media.filter(m => m.date === dateStr);

  const avgScore = dayMoods.length > 0
    ? (dayMoods.reduce((acc, m) => acc + m.score, 0) / dayMoods.length).toFixed(1)
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md p-5 border-b border-slate-800 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>{t('stats.drawerTitle')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 capitalize">
              {format(parsedDate, 'EEEE d MMMM yyyy', { locale: dateLocale })}
            </h2>

            {/* Holidays & Name Days */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {dayInfo.holiday && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800">
                  {dayInfo.flag} {dayInfo.holiday} {dayInfo.holidayTypeLabel ? `(${dayInfo.holidayTypeLabel})` : ''}
                </span>
              )}
              {dayInfo.nameDay && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {t('calendar.nameDay')} <span className="text-cyan-300">{dayInfo.nameDay}</span>
                </span>
              )}
              {avgScore && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {t('stats.avgMoodScore')}: ★ {avgScore} / 5
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* 1. Mood Check-ins for the day */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Smile className="w-4 h-4 text-amber-400" />
              <span>{t('stats.moodLogsCount')} ({dayMoods.length})</span>
            </h3>

            {dayMoods.length === 0 ? (
              <p className="text-xs text-slate-500">{t('stats.noDayMoods')}</p>
            ) : (
              <div className="space-y-3">
                {dayMoods.map(m => {
                  const moodInfo = MOOD_LEVELS.find(l => l.score === m.score);
                  return (
                    <div key={m.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{moodInfo?.emoji}</span>
                          <div>
                            <span className="text-xs font-bold text-white uppercase">{t(`mood.${m.slot}`)}: </span>
                            <span className="text-xs text-slate-300">{t(`mood.scoreLevels.${m.score}.label`) || moodInfo?.label} ({m.score}/5)</span>
                          </div>
                        </div>
                      </div>

                      {m.activities && m.activities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {m.activities.map(actId => (
                            <span key={actId} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              #{t(`mood.activities.${actId}`) || actId}
                            </span>
                          ))}
                        </div>
                      )}

                      {m.note && (
                        <p className="text-xs text-slate-400 italic mt-2">
                          "{m.note}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Events on this day */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{t('stats.dayEventsTitle')} ({dayEvents.length})</span>
            </h3>

            {dayEvents.length === 0 ? (
              <p className="text-xs text-slate-500">{t('stats.noDayEvents')}</p>
            ) : (
              <div className="space-y-2">
                {dayEvents.map(e => (
                  <div key={e.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{e.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${SECTION_BADGES[e.section] || ''}`}>
                        {e.section}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{e.startTime} - {e.endTime}</span>
                    </div>
                    {e.description && (
                      <p className="text-xs text-slate-400 mt-1.5">{e.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Goals linked to this day */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>{t('stats.dayGoalsTitle')} ({dayGoals.length})</span>
            </h3>

            {dayGoals.length === 0 ? (
              <p className="text-xs text-slate-500">{t('stats.noDayGoals')}</p>
            ) : (
              <div className="space-y-2">
                {dayGoals.map(g => (
                  <div key={g.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{g.title}</div>
                      <div className="text-[11px] text-slate-400">{g.progress}% {t('goals.progress')} • {g.period}</div>
                    </div>
                    {g.completed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Notes written on this day */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>{t('stats.dayNotesTitle')} ({dayNotes.length})</span>
            </h3>

            {dayNotes.length === 0 ? (
              <p className="text-xs text-slate-500">{t('stats.noDayNotes')}</p>
            ) : (
              <div className="space-y-2">
                {dayNotes.map(n => (
                  <div key={n.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-xs font-bold text-white">{n.title}</div>
                    <p className="text-xs text-slate-300 mt-1 whitespace-pre-wrap">{n.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Media captured on this day */}
          {dayMedia.length > 0 && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-pink-400" />
                <span>{t('stats.dayMediaTitle')} ({dayMedia.length})</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {dayMedia.map(m => (
                  <div key={m.id} className="rounded-lg overflow-hidden border border-slate-800">
                    <img src={m.dataUrl} alt={m.title} className="w-full h-32 object-cover" />
                    <div className="p-1.5 text-[11px] font-medium text-slate-300 truncate bg-slate-900">
                      {m.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
