import React, { useState } from 'react';
import { 
  Briefcase, 
  HeartPulse, 
  Users, 
  Palette, 
  Hammer, 
  Calendar, 
  Target, 
  BookOpen, 
  Image as ImageIcon,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const SECTIONS_BASE = [
  { 
    id: 'Work', 
    key: 'work',
    icon: Briefcase, 
    gradient: 'from-blue-600 to-indigo-600',
    border: 'border-blue-500/40',
    text: 'text-blue-400'
  },
  { 
    id: 'Health', 
    key: 'health',
    icon: HeartPulse, 
    gradient: 'from-emerald-600 to-teal-600',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400'
  },
  { 
    id: 'Activities', 
    key: 'activities',
    icon: Users, 
    gradient: 'from-amber-600 to-orange-600',
    border: 'border-amber-500/40',
    text: 'text-amber-400'
  },
  { 
    id: 'Hobbies', 
    key: 'hobbies',
    icon: Palette, 
    gradient: 'from-purple-600 to-violet-600',
    border: 'border-purple-500/40',
    text: 'text-purple-400'
  },
  { 
    id: 'Production', 
    key: 'production',
    icon: Hammer, 
    gradient: 'from-pink-600 to-rose-600',
    border: 'border-pink-500/40',
    text: 'text-pink-400'
  },
];

export default function LifeSectionsView({ 
  events = [], 
  goals = [], 
  notes = [], 
  media = [] 
}) {
  const { t } = useLanguage();
  const [selectedSectionId, setSelectedSectionId] = useState('Work');

  const sectionsConfig = SECTIONS_BASE.map(s => ({
    ...s,
    title: t(`sections.${s.key}`),
    desc: t(`sections.${s.key}Desc`)
  }));

  const activeSection = sectionsConfig.find(s => s.id === selectedSectionId) || sectionsConfig[0];
  const Icon = activeSection.icon;

  const sectionEvents = events.filter(e => e.section === activeSection.id);
  const sectionGoals = goals.filter(g => g.section === activeSection.id);
  const sectionNotes = notes.filter(n => n.section === activeSection.id);
  const sectionMedia = media.filter(m => m.section === activeSection.id);

  return (
    <div className="space-y-6">
      {/* 5 Section Switcher Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {sectionsConfig.map((sec) => {
          const SecIcon = sec.icon;
          const isSelected = selectedSectionId === sec.id;
          const count = events.filter(e => e.section === sec.id).length + goals.filter(g => g.section === sec.id).length;

          return (
            <button
              key={sec.id}
              onClick={() => setSelectedSectionId(sec.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? `bg-slate-900 ${sec.border} ring-2 ring-cyan-400/50 shadow-xl`
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${sec.gradient} flex items-center justify-center shadow`}>
                  <SecIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-950 text-slate-400">
                  {count}
                </span>
              </div>
              <div className="font-bold text-xs sm:text-sm text-white truncate">{sec.title}</div>
              <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{sec.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Section Detail Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${activeSection.gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{activeSection.title}</h2>
            <p className="text-xs text-slate-400">{activeSection.desc}</p>
          </div>
        </div>
      </div>

      {/* 4 Quadrants for this section: Goals, Events, Notes, Media */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Goals in Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>{t('sections.goalsSection')} ({sectionGoals.length})</span>
          </h3>

          {sectionGoals.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">{t('sections.emptyGoals')}</p>
          ) : (
            <div className="space-y-2.5">
              {sectionGoals.map(g => (
                <div key={g.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex-1 pr-3">
                    <div className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>{g.title}</span>
                      <span className="text-[10px] uppercase text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                        {t(`goals.${g.period}Goals`) || g.period}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{t('goals.progress')}: {g.progress}%</div>
                  </div>
                  {g.completed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Calendar Events in Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>{t('sections.eventsSection')} ({sectionEvents.length})</span>
          </h3>

          {sectionEvents.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">{t('sections.emptyEvents')}</p>
          ) : (
            <div className="space-y-2.5">
              {sectionEvents.map(e => (
                <div key={e.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{e.title}</span>
                    <span className="text-[10px] text-slate-400">{e.date}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{e.startTime} - {e.endTime}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Notes & Journals in Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>{t('sections.notesSection')} ({sectionNotes.length})</span>
          </h3>

          {sectionNotes.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">{t('sections.emptyNotes')}</p>
          ) : (
            <div className="space-y-2.5">
              {sectionNotes.map(n => (
                <div key={n.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="text-xs font-bold text-white">{n.title}</div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Media & Photos in Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-pink-400" />
            <span>{t('sections.mediaSection')} ({sectionMedia.length})</span>
          </h3>

          {sectionMedia.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">{t('sections.emptyMedia')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {sectionMedia.map(m => (
                <div key={m.id} className="rounded-xl overflow-hidden border border-slate-800">
                  <img src={m.dataUrl} alt={m.title} className="w-full h-28 object-cover" />
                  <div className="p-2 text-xs font-medium text-white truncate bg-slate-950">
                    {m.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
