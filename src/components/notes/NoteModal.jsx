import React, { useState, useEffect } from 'react';
import { X, Trash2, BookOpen } from 'lucide-react';
import { createItem, updateItem, deleteItem } from '../../services/storage';
import { SECTIONS } from '../calendar/EventModal';

export default function NoteModal({ isOpen, onClose, existingNote, userEmail }) {
  const [title, setTitle] = useState('');
  const [section, setSection] = useState('Work');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title || '');
      setSection(existingNote.section || 'Work');
      setDate(existingNote.date || new Date().toISOString().split('T')[0]);
      setContent(existingNote.content || '');
    } else {
      setTitle('');
      setSection('Work');
      setDate(new Date().toISOString().split('T')[0]);
      setContent('');
    }
  }, [existingNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      section,
      date,
      content: content.trim()
    };

    if (existingNote?.id) {
      updateItem(userEmail, 'notes', existingNote.id, payload);
    } else {
      createItem(userEmail, 'notes', payload);
    }

    onClose();
  };

  const handleDelete = () => {
    if (existingNote?.id && window.confirm('Vill du ta bort denna anteckning?')) {
      deleteItem(userEmail, 'notes', existingNote.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">
              {existingNote ? 'Redigera anteckning' : 'Ny anteckning & journal'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Rubrik</label>
            <input
              type="text"
              required
              placeholder="T.ex. Veckoreflektion eller Idéer för appen"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Livssektion</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                {SECTIONS.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Datum</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Innehåll</label>
            <textarea
              rows={7}
              required
              placeholder="Skriv dina tankar, planer eller journalanteckningar här..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {existingNote ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs font-medium text-red-400 hover:underline flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ta bort</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                Avbryt
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-600/20 transition"
              >
                {existingNote ? 'Spara' : 'Spara anteckning'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
