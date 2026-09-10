import React, { useState } from 'react';
import { BookOpen, Plus, Search, Calendar, FileText } from 'lucide-react';
import NoteModal from './NoteModal';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const SECTION_BADGES = {
  Work: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Health: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Activities: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Hobbies: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Production: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

export default function NotesView({ notes = [], userEmail }) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const sections = [
    { id: 'all', label: t('notes.allSections') },
    { id: 'Work', label: t('sections.work') },
    { id: 'Health', label: t('sections.health') },
    { id: 'Activities', label: t('sections.activities') },
    { id: 'Hobbies', label: t('sections.hobbies') },
    { id: 'Production', label: t('sections.production') },
  ];

  const filteredNotes = notes.filter(n => {
    const sectionMatch = selectedSection === 'all' || n.section === selectedSection;
    const searchMatch = !searchTerm || 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      n.content.toLowerCase().includes(searchTerm.toLowerCase());
    return sectionMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>{t('notes.title')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {t('notes.subtitle')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {filteredNotes.length} {t('notes.savedCount')}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingNote(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('notes.writeNote')}</span>
        </button>
      </div>

      {/* Search & Section Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={t('notes.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="inline-flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs overflow-x-auto">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSection(s.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                selectedSection === s.id
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
          {t('notes.noNotesFound')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => {
                setEditingNote(note);
                setIsModalOpen(true);
              }}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl shadow-xl transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${SECTION_BADGES[note.section] || ''}`}>
                    {t(`sections.${note.section.toLowerCase()}`) || note.section}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{note.date}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition mt-2">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-400 mt-2 line-clamp-4 leading-relaxed whitespace-pre-wrap font-sans">
                  {note.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                <span>{t('notes.clickToEdit')}</span>
                <FileText className="w-3.5 h-3.5 opacity-60" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingNote={editingNote}
        userEmail={userEmail}
      />
    </div>
  );
}
