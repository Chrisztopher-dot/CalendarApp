import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { createItem } from '../../services/storage';
import { compressImageFile } from '../../services/mediaUtils';
import { SECTIONS } from '../calendar/EventModal';

export default function MediaUploadModal({ isOpen, onClose, userEmail }) {
  const [title, setTitle] = useState('');
  const [section, setSection] = useState('Activities');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsCompressing(true);

    try {
      // Compress client-side via canvas to ~50KB-120KB WebP
      const compressedDataUrl = await compressImageFile(file, 900, 900, 0.75);
      setPreviewUrl(compressedDataUrl);
      if (!title) {
        // Default title from filename
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err) {
      setError('Kunde inte läsa in bilden. Försök med en annan bildfil.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!previewUrl) {
      setError('Vänligen välj en bild att ladda upp.');
      return;
    }

    createItem(userEmail, 'media', {
      title: title.trim() || 'Minnesbild',
      section,
      date,
      dataUrl: previewUrl,
      type: 'image'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-pink-400" />
            <h3 className="text-base font-bold text-white">Ladda upp minne / bild</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-950/60 border border-red-800 text-xs text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Picker & Preview Area */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Välj bild</label>
            <div className="relative border-2 border-dashed border-slate-800 hover:border-pink-500/50 rounded-xl p-4 text-center cursor-pointer bg-slate-950/50 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              {isCompressing ? (
                <div className="py-8 flex flex-col items-center justify-center text-cyan-400 text-xs space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Optimerar och komprimerar bild för webblagring...</span>
                </div>
              ) : previewUrl ? (
                <div className="space-y-2">
                  <img
                    src={previewUrl}
                    alt="Förhandsvisning"
                    className="max-h-44 mx-auto rounded-lg object-contain shadow-md"
                  />
                  <span className="text-[11px] text-cyan-400 block">Klicka för att välja en annan bild</span>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Upload className="w-7 h-7 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-300">
                    Klicka för att bläddra eller släpp en bildfil här
                  </span>
                  <span className="text-[10px] text-slate-500">
                    JPG, PNG eller WebP (komprimeras automatiskt)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Bildtitel / Beskrivning</label>
            <input
              type="text"
              required
              placeholder="T.ex. Helgvandring i skärgården"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Livssektion</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-pink-500"
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
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={isCompressing || !previewUrl}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 rounded-lg shadow-lg shadow-pink-600/20 transition"
            >
              Ladda upp minne
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
