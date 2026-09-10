import React, { useState } from 'react';
import { 
  TrendingUp, 
  Smile, 
  Target, 
  Calendar, 
  Layers, 
  Sparkles, 
} from 'lucide-react';
import MoodCurveDiagram from './MoodCurveDiagram';
import DayDetailDrawer from './DayDetailDrawer';
import { ACTIVITY_TAGS } from '../../data/moodConstants.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const SECTION_KEYS = [
  { id: 'Work', key: 'work', color: 'bg-blue-500', barBg: 'bg-blue-500/20 text-blue-300' },
  { id: 'Health', key: 'health', color: 'bg-emerald-500', barBg: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'Activities', key: 'activities', color: 'bg-amber-500', barBg: 'bg-amber-500/20 text-amber-300' },
  { id: 'Hobbies', key: 'hobbies', color: 'bg-purple-500', barBg: 'bg-purple-500/20 text-purple-300' },
  { id: 'Production', key: 'production', color: 'bg-pink-500', barBg: 'bg-pink-500/20 text-pink-300' },
];

export default function StatisticsView({ 
  moods = [], 
  events = [], 
  goals = [], 
  notes = [], 
  media = [] 
}) {
  const { t } = useLanguage();
  const [inspectedDate, setInspectedDate] = useState(null);

  // Compute section balance (distribution of events and goals)
  const totalItems = events.length + goals.length;
  const sectionCounts = SECTION_KEYS.map(s => {
    const evCount = events.filter(e => e.section === s.id).length;
    const goalCount = goals.filter(g => g.section === s.id).length;
    const count = evCount + goalCount;
    const pct = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
    return { ...s, label: t(`sections.${s.key}`), count, pct, evCount, goalCount };
  });

  // Goal completion rate
  const completedGoals = goals.filter(g => g.completed).length;
  const goalSuccessRate = goals.length > 0 
    ? Math.round((completedGoals / goals.length) * 100) 
    : 0;

  // Activity correlation with good mood (score >= 4)
  const activityMoodScores = {};
  moods.forEach(m => {
    (m.activities || []).forEach(act => {
      if (!activityMoodScores[act]) {
        activityMoodScores[act] = { total: 0, count: 0, highCount: 0 };
      }
      activityMoodScores[act].total += m.score;
      activityMoodScores[act].count += 1;
      if (m.score >= 4) activityMoodScores[act].highCount += 1;
    });
  });

  const rankedActivities = Object.entries(activityMoodScores)
    .map(([id, stats]) => {
      const avg = (stats.total / stats.count).toFixed(1);
      const tag = ACTIVITY_TAGS.find(t => t.id === id);
      return {
        id,
        tag,
        label: t(`mood.activities.${id}`) || tag?.label || id,
        avg: Number(avg),
        count: stats.count
      };
    })
    .sort((a, b) => b.avg - a.avg || b.count - a.count)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase mb-1">
            <Smile className="w-4 h-4" />
            <span>{t('stats.moodLogsCount')}</span>
          </div>
          <div className="text-2xl font-bold text-white">{moods.length}</div>
          <div className="text-xs text-slate-500 mt-1">{t('stats.structure3x')}</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase mb-1">
            <Calendar className="w-4 h-4" />
            <span>{t('stats.calendarEventsCount')}</span>
          </div>
          <div className="text-2xl font-bold text-white">{events.length}</div>
          <div className="text-xs text-slate-500 mt-1">{t('stats.plannedCompleted')}</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase mb-1">
            <Target className="w-4 h-4" />
            <span>{t('stats.goalsRate')}</span>
          </div>
          <div className="text-2xl font-bold text-white">{goalSuccessRate}%</div>
          <div className="text-xs text-slate-500 mt-1">{completedGoals} {t('stats.outOfGoals')} {goals.length} {t('stats.achieved')}</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            <span>{t('stats.savedMemories')}</span>
          </div>
          <div className="text-2xl font-bold text-white">{notes.length + media.length}</div>
          <div className="text-xs text-slate-500 mt-1">{notes.length} {t('notes.title').toLowerCase()} • {media.length} {t('media.title').toLowerCase()}</div>
        </div>
      </div>

      {/* Main Interactive Mood Curve Diagram */}
      <MoodCurveDiagram
        moods={moods}
        onSelectDay={(dateStr) => setInspectedDate(dateStr)}
      />

      {/* Two Column Grid: Section Balance & Uplifting Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Life Section Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">{t('stats.sectionBalance')}</h3>
          </div>
          <p className="text-xs text-slate-400">
            {t('stats.sectionBalanceSub')}
          </p>

          <div className="space-y-3 pt-2">
            {sectionCounts.map(s => (
              <div key={s.id} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">{s.label}</span>
                  <span className="text-slate-400">{s.count} ({s.pct}%)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full ${s.color} transition-all duration-500`} 
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Mood Catalysts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">{t('stats.topCatalysts')}</h3>
          </div>
          <p className="text-xs text-slate-400">
            {t('stats.topCatalystsSub')}
          </p>

          {rankedActivities.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              {t('stats.moreLogsNeeded')}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {rankedActivities.map(item => (
                <div key={item.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{item.tag?.emoji || '✨'}</span>
                    <div>
                      <div className="text-xs font-semibold text-white">{item.label}</div>
                      <div className="text-[10px] text-slate-500">{item.count} {t('stats.timesLogged')}</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-emerald-400">
                    ★ {item.avg}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side Drawer for Inspected Day */}
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
