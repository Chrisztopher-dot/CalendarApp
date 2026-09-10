import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Smile, 
  Sun, 
  Sunset, 
  Moon, 
  Plus, 
  Sparkles, 
  TrendingUp, 
} from 'lucide-react';
import MoodCheckInModal from './MoodCheckInModal';
import { MOOD_LEVELS, ACTIVITY_TAGS } from '../../data/moodConstants.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

export default function MoodTracker({ moods = [], userEmail }) {
  const { t, dateLocale } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [defaultSlot, setDefaultSlot] = useState('morning');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayMoods = moods.filter(m => m.date === todayStr);

  const handleOpenCheckIn = (slot, dateStr = todayStr, existing = null) => {
    setDefaultSlot(slot);
    setSelectedDate(dateStr);
    setSelectedMood(existing);
    setIsModalOpen(true);
  };

  // Compute stats: 7-day average mood
  const past7DaysMoods = moods.filter(m => {
    const d = parseISO(m.date);
    const diff = (new Date() - d) / (1000 * 60 * 60 * 24);
    return diff <= 7 && diff >= 0;
  });

  const avg7DayScore = past7DaysMoods.length > 0
    ? (past7DaysMoods.reduce((acc, m) => acc + m.score, 0) / past7DaysMoods.length).toFixed(1)
    : '0.0';

  // Find most frequent uplifting activities (score >= 4)
  const highMoodActivities = {};
  past7DaysMoods
    .filter(m => m.score >= 4)
    .forEach(m => {
      (m.activities || []).forEach(act => {
        highMoodActivities[act] = (highMoodActivities[act] || 0) + 1;
      });
    });

  const topActivities = Object.entries(highMoodActivities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => {
      const tag = ACTIVITY_TAGS.find(t => t.id === id);
      return tag ? { ...tag, label: t(`mood.activities.${id}`) || tag.label } : null;
    })
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Top Banner with Today's 3 Slots */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Smile className="w-4 h-4" />
              <span>{t('mood.headerBadge')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {t('mood.headerQuestion')}, {format(new Date(), 'd MMMM', { locale: dateLocale })}?
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">{t('mood.avg7Days')}</div>
              <div className="text-lg font-bold text-cyan-400">★ {avg7DayScore} / 5</div>
            </div>
          </div>
        </div>

        {/* 3 Check-In Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'morning', label: t('mood.morning'), icon: Sun, color: 'text-amber-400' },
            { id: 'afternoon', label: t('mood.afternoon'), icon: Sunset, color: 'text-orange-400' },
            { id: 'evening', label: t('mood.evening'), icon: Moon, color: 'text-indigo-400' },
          ].map(({ id, label, icon: Icon, color }) => {
            const entry = todayMoods.find(m => m.slot === id);
            const moodInfo = entry ? MOOD_LEVELS.find(l => l.score === entry.score) : null;
            const translatedLabel = entry ? t(`mood.scoreLevels.${entry.score}.label`) || moodInfo?.label : '';

            return (
              <div
                key={id}
                onClick={() => handleOpenCheckIn(id, todayStr, entry)}
                className={`p-5 rounded-xl border transition cursor-pointer relative overflow-hidden group ${
                  entry
                    ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/30 border-dashed border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="text-sm font-semibold text-slate-200">{label}</span>
                  </div>

                  {entry ? (
                    <span className="text-2xl">{moodInfo?.emoji}</span>
                  ) : (
                    <span className="p-1 rounded-full bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-cyan-600 transition">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {entry ? (
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-base font-bold text-white">{translatedLabel}</span>
                      <span className="text-xs text-slate-500 font-medium">({entry.score}/5)</span>
                    </div>

                    {entry.activities && entry.activities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {entry.activities.map(actId => {
                          const tag = ACTIVITY_TAGS.find(t => t.id === actId);
                          return (
                            <span 
                              key={actId}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300"
                            >
                              {tag?.emoji} {t(`mood.activities.${actId}`) || tag?.label || actId}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {entry.note && (
                      <p className="text-xs text-slate-400 italic mt-2.5 line-clamp-2">
                        "{entry.note}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-3 text-center">
                    <span className="text-xs text-slate-500 group-hover:text-cyan-400 transition">
                      {t('mood.clickToCheckIn')}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Insight callout */}
        {topActivities.length > 0 && (
          <div className="mt-5 p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex items-center space-x-3 text-xs text-cyan-200">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>
              {t('mood.topActivitiesTitle')}{' '}
              <strong className="text-white">
                {topActivities.map(a => `${a.emoji} ${a.label}`).join(', ')}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Mood History Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>{t('mood.recentHistory')}</span>
          </h3>
          <button
            onClick={() => handleOpenCheckIn('morning')}
            className="text-xs text-cyan-400 hover:underline"
          >
            {t('mood.logMoodBtn')}
          </button>
        </div>

        {moods.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            {t('mood.noMoodsYet')}
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {moods
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 15)
              .map((item) => {
                const moodInfo = MOOD_LEVELS.find(l => l.score === item.score);
                const translatedLabel = t(`mood.scoreLevels.${item.score}.label`) || moodInfo?.label;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenCheckIn(item.slot, item.date, item)}
                    className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/30 rounded-lg cursor-pointer transition"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{moodInfo?.emoji}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">
                            {format(parseISO(item.date), 'd MMMM yyyy', { locale: dateLocale })}
                          </span>
                          <span className="text-[10px] uppercase font-semibold text-slate-500 px-1.5 py-0.5 rounded bg-slate-950">
                            {t(`mood.${item.slot}`)}
                          </span>
                          <span className="text-xs text-slate-400">
                            • {translatedLabel} ({item.score}/5)
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-xs text-slate-400 italic mt-0.5">
                            "{item.note}"
                          </p>
                        )}
                      </div>
                    </div>

                    {item.activities && item.activities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.activities.map(actId => {
                          const tag = ACTIVITY_TAGS.find(t => t.id === actId);
                          return (
                            <span 
                              key={actId}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800"
                            >
                              {tag?.emoji} {t(`mood.activities.${actId}`) || tag?.label || actId}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <MoodCheckInModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultDate={selectedDate}
        defaultSlot={defaultSlot}
        existingMood={selectedMood}
        userEmail={userEmail}
      />
    </div>
  );
}
