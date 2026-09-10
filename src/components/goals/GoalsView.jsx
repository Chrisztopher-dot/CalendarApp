import React, { useState } from 'react';
import { Target, Plus, CheckCircle2, Circle, Clock } from 'lucide-react';
import GoalModal from './GoalModal';
import { updateItem } from '../../services/storage';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const SECTION_COLORS = {
  Work: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
  Health: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
  Activities: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
  Hobbies: 'text-purple-400 bg-purple-950/40 border-purple-800/40',
  Production: 'text-pink-400 bg-pink-950/40 border-pink-800/40',
};

export default function GoalsView({ goals = [], userEmail }) {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const periods = [
    { id: 'all', label: t('goals.allGoals') },
    { id: 'weekly', label: t('goals.weeklyGoals') },
    { id: 'monthly', label: t('goals.monthlyGoals') },
    { id: 'yearly', label: t('goals.yearlyGoals') },
  ];

  const sections = [
    { id: 'all', label: t('goals.allSections') },
    { id: 'Work', label: t('sections.work') },
    { id: 'Health', label: t('sections.health') },
    { id: 'Activities', label: t('sections.activities') },
    { id: 'Hobbies', label: t('sections.hobbies') },
    { id: 'Production', label: t('sections.production') },
  ];

  const filteredGoals = goals.filter(g => {
    const periodMatch = selectedPeriod === 'all' || g.period === selectedPeriod;
    const sectionMatch = selectedSection === 'all' || g.section === selectedSection;
    return periodMatch && sectionMatch;
  });

  const handleToggleCompleted = (goal, e) => {
    e.stopPropagation();
    const nextCompleted = !goal.completed;
    updateItem(userEmail, 'goals', goal.id, {
      completed: nextCompleted,
      progress: nextCompleted ? 100 : goal.progress === 100 ? 50 : goal.progress
    });
  };

  const completedCount = filteredGoals.filter(g => g.completed).length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Target className="w-4 h-4" />
            <span>{t('goals.title')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {t('goals.subtitle')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {completedCount} {t('stats.outOfGoals')} {filteredGoals.length} {t('goals.statsCount')}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('goals.newGoal')}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Period Filter */}
        <div className="inline-flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs overflow-x-auto">
          {periods.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPeriod(p.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                selectedPeriod === p.id
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Section Filter */}
        <div className="inline-flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs overflow-x-auto">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSection(s.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                selectedSection === s.id
                  ? 'bg-slate-800 text-cyan-300 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
          {t('goals.noGoalsMatch')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => {
            const isDone = goal.completed;
            const badgeClass = SECTION_COLORS[goal.section] || 'text-slate-300 bg-slate-800';
            const periodLabel = t(`goals.${goal.period}Goals`) || goal.period;
            const sectionLabel = t(`sections.${goal.section.toLowerCase()}`) || goal.section;

            return (
              <div
                key={goal.id}
                onClick={() => {
                  setEditingGoal(goal);
                  setIsModalOpen(true);
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isDone 
                    ? 'bg-slate-950/40 border-slate-800/80 opacity-75' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-xl'
                }`}
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800">
                      {periodLabel}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badgeClass}`}>
                      {sectionLabel}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="flex items-start space-x-2.5 mt-2">
                    <button
                      type="button"
                      onClick={(e) => handleToggleCompleted(goal, e)}
                      className="mt-0.5 text-slate-500 hover:text-emerald-400 transition"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div className={`text-sm font-bold ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                      {goal.title}
                    </div>
                  </div>

                  {goal.notes && (
                    <p className="text-xs text-slate-400 mt-2 pl-7 line-clamp-2">
                      {goal.notes}
                    </p>
                  )}
                </div>

                {/* Progress bar & slider */}
                <div className="mt-5 pt-3 border-t border-slate-800/80">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                    <span>{t('goals.progress')}</span>
                    <span className="font-bold text-cyan-400">{goal.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-2">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                      }`}
                      style={{ width: `${goal.progress || 0}%` }}
                    />
                  </div>

                  {goal.targetDate && (
                    <div className="flex items-center space-x-1 text-[10px] text-slate-500 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{t('goals.targetDate')} {goal.targetDate}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingGoal={editingGoal}
        userEmail={userEmail}
      />
    </div>
  );
}
