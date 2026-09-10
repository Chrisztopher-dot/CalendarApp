import React from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isToday } from 'date-fns';
import { getDayCalendarInfo } from '../../data/calendarHolidays.js';
import { Plus, Clock } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const SECTION_STYLES = {
  Work: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Health: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Activities: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Hobbies: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Production: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

export default function WeekView({ 
  currentDate, 
  events = [], 
  moods = [], 
  onSelectDay, 
  onSelectEvent, 
  onAddEvent 
}) {
  const { t, lang, dateLocale } = useLanguage();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* 7 Columns for the week */}
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-800">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayInfo = getDayCalendarInfo(day, lang);
          const isCurrentDay = isToday(day);
          const dayEvents = events
            .filter(e => e.date === dateStr)
            .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
          const dayMoods = moods.filter(m => m.date === dateStr);

          return (
            <div key={dateStr} className="flex flex-col min-h-[420px] bg-slate-950/30">
              {/* Day Header */}
              <div 
                onClick={() => onSelectDay(dateStr)}
                className={`p-3 border-b border-slate-800 cursor-pointer transition ${
                  isCurrentDay ? 'bg-cyan-950/30' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {format(day, 'EEEE', { locale: dateLocale })}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddEvent(dateStr);
                    }}
                    title={t('calendar.addEvent')}
                    className="p-1 text-slate-500 hover:text-white rounded hover:bg-slate-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-baseline space-x-2 mt-1">
                  <span className={`text-xl font-bold ${
                    isCurrentDay ? 'text-cyan-400' : dayInfo.isRedDay ? 'text-red-400' : 'text-slate-200'
                  }`}>
                    {format(day, 'd MMM', { locale: dateLocale })}
                  </span>
                </div>

                {/* Holiday Badge */}
                {dayInfo.holiday && (
                  <div className="mt-1 text-[11px] font-medium text-red-300 bg-red-950/50 border border-red-900/50 px-1.5 py-0.5 rounded truncate">
                    {dayInfo.flag} {dayInfo.holiday}
                  </div>
                )}

                {/* Name Day (if any) */}
                {dayInfo.nameDay && (
                  <div className="text-[10px] text-slate-500 italic mt-0.5 truncate">
                    {dayInfo.nameDay}
                  </div>
                )}

                {/* Mood Snapshot */}
                {dayMoods.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center space-x-1.5">
                    {dayMoods.map((m) => (
                      <span
                        key={m.id}
                        title={`${m.slot}: ${m.score}/5`}
                        className="text-xs"
                      >
                        {m.score >= 5 ? '🤩' : m.score >= 4 ? '🙂' : m.score >= 3 ? '😐' : m.score >= 2 ? '🙁' : '😫'}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Event Cards */}
              <div className="p-2 flex-1 space-y-2 overflow-y-auto max-h-[500px]">
                {dayEvents.length === 0 ? (
                  <div className="text-[11px] text-slate-600 text-center py-6">
                    {t('calendar.noEvents')}
                  </div>
                ) : (
                  dayEvents.map((event) => {
                    const style = SECTION_STYLES[event.section] || 'bg-slate-800 text-slate-300 border-slate-700';
                    return (
                      <div
                        key={event.id}
                        onClick={() => onSelectEvent(event)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer hover:shadow-lg transition ${style}`}
                      >
                        <div className="flex items-center space-x-1 text-[10px] opacity-80 mb-1">
                          <Clock className="w-3 h-3" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                        <div className="font-semibold">{event.title}</div>
                        {event.description && (
                          <div className="text-[10px] opacity-75 line-clamp-2 mt-1">
                            {event.description}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
