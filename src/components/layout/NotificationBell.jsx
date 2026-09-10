import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Sun, 
  Sunset, 
  Moon, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { getPendingReminders } from '../../services/reminderUtils.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

export default function NotificationBell({ 
  userData, 
  onOpenMoodCheckIn, 
  setActiveTab 
}) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { reminders, count } = getPendingReminders(userData, t);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (reminder) => {
    setIsOpen(false);
    if (reminder.actionType === 'openMood') {
      if (onOpenMoodCheckIn) {
        onOpenMoodCheckIn(reminder.actionPayload.date, reminder.actionPayload.slot);
      }
    } else if (reminder.actionType === 'goToTab') {
      if (setActiveTab) {
        setActiveTab(reminder.actionPayload.tab);
      }
    }
  };

  const getReminderIcon = (iconType) => {
    switch (iconType) {
      case 'morning':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'afternoon':
        return <Sunset className="w-4 h-4 text-orange-400" />;
      case 'evening':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'goal-overdue':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'goal':
      default:
        return <Target className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={count > 0 ? `${count} ${t('notifications.pendingCount')}` : t('notifications.title')}
        className={`relative p-2 rounded-lg transition-all duration-200 ${
          isOpen
            ? 'bg-slate-800 text-white'
            : count > 0
            ? 'text-amber-300 hover:text-amber-200 hover:bg-slate-800/80 bg-amber-950/20 border border-amber-500/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`}
      >
        <Bell className="w-4 h-4" />

        {/* Count Badge */}
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg ring-2 ring-slate-900 animate-pulse">
            {count}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm text-white">{t('notifications.title')}</span>
              {count > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                  {count} {t('notifications.pendingCount')}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  ✓ {t('notifications.allClear')}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60">
            {count === 0 ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white">
                  {t('notifications.emptyTitle')}
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {t('notifications.emptyDesc')}
                </p>
              </div>
            ) : (
              reminders.map((reminder) => (
                <div 
                  key={reminder.id}
                  className="p-3.5 hover:bg-slate-800/40 transition flex items-start space-x-3 group"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    reminder.urgency === 'overdue'
                      ? 'bg-rose-950/60 border border-rose-800/60 text-rose-400'
                      : reminder.type === 'mood'
                      ? 'bg-amber-950/60 border border-amber-800/60 text-amber-300'
                      : 'bg-cyan-950/60 border border-cyan-800/60 text-cyan-300'
                  }`}>
                    {getReminderIcon(reminder.iconType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-semibold text-white truncate">
                        {reminder.title}
                      </span>
                      {reminder.timeLabel && (
                        <span className="text-[10px] text-slate-500 flex items-center space-x-0.5 flex-shrink-0">
                          <Clock className="w-3 h-3 inline" />
                          <span>{reminder.timeLabel}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                      {reminder.desc}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleAction(reminder)}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold shadow-sm transition active:scale-[0.98] ${
                        reminder.type === 'mood'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20'
                      }`}
                    >
                      <span>{reminder.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          {count > 0 && (
            <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 text-[10px] text-slate-500 text-center">
              LifeAtlas • {t('notifications.allClear')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
