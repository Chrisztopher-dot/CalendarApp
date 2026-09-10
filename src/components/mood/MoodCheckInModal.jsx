import React, { useState, useEffect } from 'react';
import { X, Smile, Check, Sun, Sunset, Moon } from 'lucide-react';
import { createItem, updateItem, deleteItem } from '../../services/storage';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

import { MOOD_LEVELS, ACTIVITY_TAGS } from '../../data/moodConstants.js';

export default function MoodCheckInModal({ 
  isOpen, 
  onClose, 
  defaultDate, 
  defaultSlot = 'morning', 
  existingMood,
  userEmail 
}) {
  const { t } = useLanguage();
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [slot, setSlot] = useState(defaultSlot);
  const [score, setScore] = useState(4);
  const [activities, setActivities] = useState([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (existingMood) {
      setDate(existingMood.date || defaultDate);
      setSlot(existingMood.slot || defaultSlot);
      setScore(existingMood.score || 4);
      setActivities(existingMood.activities || []);
      setNote(existingMood.note || '');
    } else {
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setSlot(defaultSlot || 'morning');
      setScore(4);
      setActivities([]);
      setNote('');
    }
  }, [existingMood, defaultDate, defaultSlot, isOpen]);

  if (!isOpen) return null;

  const toggleActivity = (actId) => {
    if (activities.includes(actId)) {
      setActivities(activities.filter(a => a !== actId));
    } else {
      setActivities([...activities, actId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      date,
      slot,
      score,
      activities,
      note: note.trim()
    };

    if (existingMood?.id) {
      updateItem(userEmail, 'moods', existingMood.id, payload);
    } else {
      createItem(userEmail, 'moods', payload);
    }

    onClose();
  };

  const handleDelete = () => {
    if (existingMood?.id && window.confirm(t('mood.deleteMoodConfirm'))) {
      deleteItem(userEmail, 'moods', existingMood.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Smile className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              {existingMood ? t('mood.modalTitleEdit') : t('mood.modalTitleNew')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Time Slot Selector (3x daily) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              {t('mood.slotLabel')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'morning', label: t('mood.morning'), icon: Sun, color: 'text-amber-400' },
                { id: 'afternoon', label: t('mood.afternoon'), icon: Sunset, color: 'text-orange-400' },
                { id: 'evening', label: t('mood.evening'), icon: Moon, color: 'text-indigo-400' },
              ].map((s) => {
                const Icon = s.icon;
                const isSelected = slot === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSlot(s.id)}
                    className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 text-white ring-1 ring-cyan-500 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${s.color}`} />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              {t('calendar.date')}
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full sm:w-1/2 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Smiley Mood Scale (1 to 5) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              {t('mood.chooseScore')}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MOOD_LEVELS.map((m) => {
                const isSelected = score === m.score;
                const label = t(`mood.scoreLevels.${m.score}.label`) || m.label;
                return (
                  <button
                    key={m.score}
                    type="button"
                    onClick={() => setScore(m.score)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      isSelected
                        ? `bg-slate-800 ring-2 ring-cyan-400 shadow-lg scale-105 ${m.color}`
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl filter drop-shadow mb-1">{m.emoji}</span>
                    <span className="text-xs font-bold text-white">{label}</span>
                    <span className="text-[10px] text-slate-400">{m.score}/5</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Multi-Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              {t('mood.linkedActivities')}
            </label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TAGS.map((act) => {
                const isSelected = activities.includes(act.id);
                const actLabel = t(`mood.activities.${act.id}`) || act.label;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => toggleActivity(act.id)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>{act.emoji}</span>
                    <span>{actLabel}</span>
                    {isSelected && <Check className="w-3 h-3 text-cyan-400 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              {t('mood.quickReflection')}
            </label>
            <input
              type="text"
              placeholder={t('mood.reflectionPlaceholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {existingMood ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs font-medium text-rose-400 hover:underline"
              >
                {t('mood.deleteMood')}
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                {t('calendar.cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-lg shadow-cyan-600/25 transition"
              >
                {t('mood.saveMood')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
