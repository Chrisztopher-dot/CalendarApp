import React from 'react';
import { X, Trash2, Download, Calendar, Tag } from 'lucide-react';
import { deleteItem } from '../../services/storage';

export default function MediaViewerModal({ mediaItem, onClose, userEmail }) {
  if (!mediaItem) return null;

  const handleDelete = () => {
    if (window.confirm('Vill du ta bort detta minne ur galleriet?')) {
      deleteItem(userEmail, 'media', mediaItem.id);
      onClose();
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = mediaItem.dataUrl;
    a.download = `${mediaItem.title.replace(/\s+/g, '_')}_${mediaItem.date}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">{mediaItem.title}</h3>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
              <span>{mediaItem.date}</span>
              <span>•</span>
              <span className="text-cyan-400 font-medium">{mediaItem.section}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              title="Ladda ned bild"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              title="Ta bort"
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Full Image */}
        <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[75vh] overflow-hidden">
          <img
            src={mediaItem.dataUrl}
            alt={mediaItem.title}
            className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}
