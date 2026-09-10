import React, { useState } from 'react';
import { X, Download, Upload, Shield, Database, HardDrive, Check, AlertTriangle } from 'lucide-react';
import { exportUserData, importUserData, getStorageKey } from '../../services/storage';

export default function BackupModal({ isOpen, onClose, userEmail, userData }) {
  const [importStatus, setImportStatus] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    exportUserData(userEmail);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        importUserData(userEmail, parsed);
        setImportStatus('Säkerhetskopian har lästs in och dina data har återställts framgångsrikt!');
      } catch (err) {
        setError('Felaktig fil: Kunde inte tolka JSON-säkerhetskopian.');
      }
    };
    reader.onerror = () => setError('Kunde inte läsa filen.');
    reader.readAsText(file);
  };

  // Calculate approximate storage usage
  const storageKey = getStorageKey(userEmail);
  const rawData = localStorage.getItem(storageKey) || '';
  const bytesUsed = new Blob([rawData]).size;
  const kbUsed = (bytesUsed / 1024).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Säkerhetskopia & Datalagring</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {importStatus && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 rounded-xl flex items-center space-x-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-xs text-rose-300 rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Storage Stats Box */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center space-x-1.5 font-medium text-slate-300">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lokal Webbläsarlagring</span>
            </span>
            <span className="font-semibold text-cyan-400">{kbUsed} KB använt</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center pt-2 border-t border-slate-800/80">
            <div>
              <div className="text-xs font-bold text-white">{userData?.events?.length || 0}</div>
              <div className="text-[10px] text-slate-500">Händelser</div>
            </div>
            <div>
              <div className="text-xs font-bold text-white">{userData?.moods?.length || 0}</div>
              <div className="text-[10px] text-slate-500">Humör</div>
            </div>
            <div>
              <div className="text-xs font-bold text-white">{userData?.goals?.length || 0}</div>
              <div className="text-[10px] text-slate-500">Mål</div>
            </div>
            <div>
              <div className="text-xs font-bold text-white">{userData?.notes?.length || 0}</div>
              <div className="text-[10px] text-slate-500">Anteckn.</div>
            </div>
            <div>
              <div className="text-xs font-bold text-white">{userData?.media?.length || 0}</div>
              <div className="text-[10px] text-slate-500">Foton</div>
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Export button */}
          <button
            onClick={handleExport}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/40 text-left transition group"
          >
            <Download className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Exportera JSON</div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Ladda ned en fullständig säkerhetskopia av dina data till datorn.
            </p>
          </button>

          {/* Import button */}
          <label className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/40 text-left transition group cursor-pointer block">
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <Upload className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Importera JSON</div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Återställ eller flytta data från en tidigare sparad JSON-fil.
            </p>
          </label>
        </div>

        {/* Isolation note */}
        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-start space-x-2 text-[11px] text-slate-500">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            Data isoleras strikt per e-post i nyckeln: <code className="text-cyan-400">{storageKey}</code>.
          </span>
        </div>

        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
}
