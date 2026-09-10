import React, { useState } from 'react';
import { 
  addMonths, 
  subMonths, 
  addWeeks, 
  subWeeks, 
  addDays, 
  subDays, 
  format, 
  parseISO 
} from 'date-fns';
import { sv } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Flag,
  Sparkles
} from 'lucide-react';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import EventModal from './EventModal';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

export default function CalendarView({ 
  events = [], 
  moods = [], 
  goals = [], 
  notes = [], 
  userEmail,
  onOpenMoodCheckIn
}) {
  const { t, dateLocale } = useLanguage();
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Event Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalDate, setModalDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSelectDay = (dateStr) => {
    // Switch to day view for that date
    setCurrentDate(parseISO(dateStr));
    setViewMode('day');
  };

  const handleAddEvent = (dateStr) => {
    setSelectedEvent(null);
    setModalDate(dateStr || format(currentDate, 'yyyy-MM-dd'));
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setModalDate(event.date);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Navigation & Title */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={handlePrev}
              title="Föregående"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              {t('calendar.today')}
            </button>
            <button
              onClick={handleNext}
              title="Next"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white capitalize">
            {format(currentDate, viewMode === 'day' ? 'd MMMM yyyy' : 'MMMM yyyy', { locale: dateLocale })}
          </h2>
        </div>

        {/* View Switchers & Action Button */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* View Mode Buttons */}
          <div className="inline-flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs font-medium">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'month' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('calendar.month')}
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'week' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('calendar.week')}
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'day' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('calendar.day')}
            </button>
          </div>

          {/* New Event Button */}
          <button
            onClick={() => handleAddEvent()}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('calendar.newEvent')}</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'month' && (
        <MonthView
          currentDate={currentDate}
          events={events}
          moods={moods}
          onSelectDay={handleSelectDay}
          onSelectEvent={handleSelectEvent}
          onAddEvent={handleAddEvent}
        />
      )}

      {viewMode === 'week' && (
        <WeekView
          currentDate={currentDate}
          events={events}
          moods={moods}
          onSelectDay={handleSelectDay}
          onSelectEvent={handleSelectEvent}
          onAddEvent={handleAddEvent}
        />
      )}

      {viewMode === 'day' && (
        <DayView
          currentDate={currentDate}
          events={events}
          moods={moods}
          goals={goals}
          notes={notes}
          onAddEvent={handleAddEvent}
          onSelectEvent={handleSelectEvent}
          onOpenMoodCheckIn={onOpenMoodCheckIn}
        />
      )}

      {/* Event Add/Edit Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={modalDate}
        existingEvent={selectedEvent}
        userEmail={userEmail}
      />
    </div>
  );
}
