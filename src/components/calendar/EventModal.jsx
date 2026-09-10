import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, Clock, Tag, AlignLeft } from 'lucide-react';
import { createItem, updateItem, deleteItem } from '../../services/storage';

export const SECTIONS = [
  { id: 'Work', label: 'Arbete & Karriär', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'Health', label: 'Hälsa & Träning', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'Activities', label: 'Aktiviteter & Socialt', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'Hobbies', label: 'Hobby & Intressen', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'Production', label: 'Skapande & Produktion', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
];

export default function EventModal({ isOpen, onClose, selectedDate, existingEvent, userEmail }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [section, setSection] = useState('Work');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title || '');
      setDate(existingEvent.date || selectedDate || '');
      setStartTime(existingEvent.startTime || '09:00');
      setEndTime(existingEvent.endTime || '10:00');
      setSection(existingEvent.section || 'Work');
      setDescription(existingEvent.description || '');
    } else {
      setTitle('');
      setDate(selectedDate || new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('10:00');
      setSection('Work');
      setDescription('');
    }
  }, [existingEvent, selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const eventPayload = {
      title: title.trim(),
      date,
      startTime,
      endTime,
      section,
      description: description.trim()
    };

    if (existingEvent?.id) {
      updateItem(userEmail, 'events', existingEvent.id, eventPayload);
    } else {
      createItem(userEmail, 'events', eventPayload);
    }

    onClose();
  };

  const handleDelete = () => {
    if (existingEvent?.id && window.confirm('Vill du ta bort denna händelse?')) {
      deleteItem(userEmail, 'events', existingEvent.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">
            {existingEvent ? 'Redigera händelse' : 'Ny kalenderhändelse'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Titel</label>
            <input
              type="text"
              required
              placeholder="T.ex. Projektmöte eller Löprunda"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Datum</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Starttid</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Sluttid</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Livssektion</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSection(s.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left border transition ${
                    section === s.id
                      ? `${s.color} ring-1 ring-cyan-400`
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Anteckning / Detaljer</label>
            <textarea
              rows={3}
              placeholder="Valfri beskrivning..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {existingEvent ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center space-x-1 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/40 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
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
                className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-lg shadow-cyan-600/20 transition"
              >
                {existingEvent ? 'Spara ändringar' : 'Lägg till händelse'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
