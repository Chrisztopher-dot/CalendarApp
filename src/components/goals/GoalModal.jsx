import React, { useState, useEffect } from 'react';
import { X, Trash2, Target, Calendar, Tag, CheckSquare } from 'lucide-react';
import { createItem, updateItem, deleteItem } from '../../services/storage';
import { SECTIONS } from '../calendar/EventModal';

export default function GoalModal({ isOpen, onClose, existingGoal, userEmail }) {
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState('weekly'); // 'yearly' | 'monthly' | 'weekly'
  const [section, setSection] = useState('Work');
  const [targetDate, setTargetDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (existingGoal) {
      setTitle(existingGoal.title || '');
      setPeriod(existingGoal.period || 'weekly');
      setSection(existingGoal.section || 'Work');
      setTargetDate(existingGoal.targetDate || '');
      setProgress(existingGoal.progress || 0);
      setCompleted(!!existingGoal.completed);
      setNotes(existingGoal.notes || '');
    } else {
      setTitle('');
      setPeriod('weekly');
      setSection('Work');
      setTargetDate('');
      setProgress(0);
      setCompleted(false);
      setNotes('');
    }
  }, [existingGoal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      period,
      section,
      targetDate,
      progress: Number(progress),
      completed: completed || Number(progress) === 100,
      notes: notes.trim()
    };

    if (existingGoal?.id) {
      updateItem(userEmail, 'goals', existingGoal.id, payload);
    } else {
      createItem(userEmail, 'goals', payload);
    }

    onClose();
  };

  const handleDelete = () => {
    if (existingGoal?.id && window.confirm('Vill du ta bort detta mål?')) {
      deleteItem(userEmail, 'goals', existingGoal.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              {existingGoal ? 'Redigera mål' : 'Nytt målsättning'}
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
            <label className="block text-xs font-medium text-slate-300 mb-1">Målrubrik</label>
            <input
              type="text"
              required
              placeholder="Vad vill du uppnå?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tidshorisont</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="weekly">Veckomål (Weekly)</option>
                <option value="monthly">Månadsmål (Monthly)</option>
                <option value="yearly">Årsmål (Yearly)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Slutdatum</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Livssektion</label>
            <div className="grid grid-cols-2 gap-2">
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
            <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
              <span>Framsteg</span>
              <span className="text-cyan-400 font-bold">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => {
                const val = Number(e.target.value);
                setProgress(val);
                if (val === 100) setCompleted(true);
              }}
              className="w-full accent-cyan-500 bg-slate-950 cursor-pointer"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="goalCompleted"
              checked={completed}
              onChange={(e) => {
                setCompleted(e.target.checked);
                if (e.target.checked && progress < 100) setProgress(100);
              }}
              className="w-4 h-4 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
            />
            <label htmlFor="goalCompleted" className="text-xs text-slate-300">
              Markera som helt avklarat
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Delmål & Noteringar</label>
            <textarea
              rows={2}
              placeholder="Milstoplar eller detaljer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {existingGoal ? (
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
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-600/20 transition"
              >
                {existingGoal ? 'Spara' : 'Skapa mål'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
