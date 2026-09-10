import React from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isToday 
} from 'date-fns';
import { getDayCalendarInfo } from '../../data/calendarHolidays.js';
import { Plus } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const SECTION_STYLES = {
  Work: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Health: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Activities: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Hobbies: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Production: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  Socialize: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
};

export default function MonthView({ 
  currentDate, 
  events = [], 
  moods = [], 
  onSelectDay, 
  onSelectEvent, 
  onAddEvent 
}) {
  const { t, lang, dateLocale } = useLanguage();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  // Weeks start on Monday (weekStartsOn: 1)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = t('calendar.weekDays');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/60 text-center py-2.5">
        {weekDays.map((dayName, idx) => (
          <div 
            key={dayName} 
            className={`text-xs font-semibold tracking-wider uppercase ${
              idx === 5 || idx === 6 ? 'text-red-400/90' : 'text-slate-400'
            }`}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/80 bg-slate-950/40">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayInfo = getDayCalendarInfo(day, lang);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          
          // Events for this day
          const dayEvents = events.filter(e => e.date === dateStr);
          // Moods for this day
          const dayMoods = moods.filter(m => m.date === dateStr);
          const avgScore = dayMoods.length > 0 
            ? (dayMoods.reduce((acc, m) => acc + m.score, 0) / dayMoods.length).toFixed(1)
            : null;

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDay(dateStr)}
              className={`min-h-[110px] sm:min-h-[125px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors group cursor-pointer ${
                isCurrentMonth ? 'bg-slate-900/40 hover:bg-slate-800/40' : 'bg-slate-950/70 text-slate-600'
              } ${isCurrentDay ? 'ring-1 ring-inset ring-cyan-500/50 bg-cyan-950/10' : ''}`}
            >
              {/* Day Cell Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-xs sm:text-sm font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        isCurrentDay
                          ? 'bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/30'
                          : dayInfo.isRedDay
                          ? 'text-red-400 font-bold'
                          : isCurrentMonth
                          ? 'text-slate-200'
                          : 'text-slate-600'
                      }`}
                    >
                      {format(day, 'd', { locale: dateLocale })}
                    </span>

                    {/* Mood indicator icon */}
                    {avgScore && (
                      <span 
                        title={`${t('calendar.daysMoodAvg')} ${avgScore}/5`}
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          avgScore >= 4 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                          avgScore >= 2.5 ? 'bg-amber-950 text-amber-400 border border-amber-800/60' :
                          'bg-rose-950 text-rose-400 border border-rose-800/60'
                        }`}
                      >
                        ★ {avgScore}
                      </span>
                    )}
                  </div>

                  {/* Add event on hover button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddEvent(dateStr);
                    }}
                    title={t('calendar.addEvent')}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Holiday or Eve Label */}
                {dayInfo.holiday && (
                  <div 
                    title={dayInfo.holiday} 
                    className={`mt-1 text-[10px] font-medium leading-tight truncate px-1 rounded ${
                      dayInfo.isRedDay 
                        ? 'text-red-300 bg-red-950/50 border border-red-900/40' 
                        : 'text-amber-300 bg-amber-950/40 border border-amber-900/40'
                    }`}
                  >
                    {dayInfo.flag} {dayInfo.holiday}
                  </div>
                )}

                {/* Name Day (Namnsdagar, shown in Swedish mode) */}
                {dayInfo.nameDay && isCurrentMonth && (
                  <div 
                    title={`${t('calendar.nameDay')} ${dayInfo.nameDay}`}
                    className="text-[9px] sm:text-[10px] text-slate-500 italic truncate mt-0.5"
                  >
                    {dayInfo.nameDay}
                  </div>
                )}
              </div>

              {/* Day Events List */}
              <div className="mt-1.5 space-y-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => {
                  const style = SECTION_STYLES[event.section] || 'bg-slate-800 text-slate-300 border-slate-700';
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      title={`${event.startTime || ''} ${event.title}`}
                      className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded truncate border transition hover:brightness-125 ${style}`}
                    >
                      <span className="font-medium mr-1 opacity-75">{event.startTime}</span>
                      <span>{event.title}</span>
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[9px] text-slate-500 font-medium pl-1">
                    +{dayEvents.length - 3} {t('calendar.moreEvents')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
