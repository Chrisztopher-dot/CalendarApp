import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Eye } from 'lucide-react';
import MediaUploadModal from './MediaUploadModal';
import MediaViewerModal from './MediaViewerModal';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

export default function MediaGallery({ media = [], userEmail }) {
  const { t } = useLanguage();
  const [selectedSection, setSelectedSection] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeViewerItem, setActiveViewerItem] = useState(null);

  const sections = [
    { id: 'all', label: t('media.allMedia') },
    { id: 'Work', label: t('sections.work') },
    { id: 'Health', label: t('sections.health') },
    { id: 'Activities', label: t('sections.activities') },
    { id: 'Hobbies', label: t('sections.hobbies') },
    { id: 'Production', label: t('sections.production') },
  ];

  const filteredMedia = media.filter(m => {
    return selectedSection === 'all' || m.section === selectedSection;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>{t('media.title')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {t('media.subtitle')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {filteredMedia.length} {t('media.savedCount')}
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-pink-600/20 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('media.uploadBtn')}</span>
        </button>
      </div>

      {/* Section Filter */}
      <div className="inline-flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs overflow-x-auto">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSection(s.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              selectedSection === s.id
                ? 'bg-pink-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
          {t('media.noMedia')}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveViewerItem(item)}
              className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl transition cursor-pointer"
            >
              <div className="aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={item.thumbnailUrl || item.dataUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Hover overlay with eye icon */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end">
                  <span className="p-1.5 rounded-lg bg-slate-900/80 text-white backdrop-blur-sm">
                    <Eye className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white truncate">{item.title}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1">
                    <span>{item.date}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-medium">
                      {t(`sections.${item.section.toLowerCase()}`) || item.section}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer for mobile / non-hover */}
              <div className="p-2.5 bg-slate-900 group-hover:hidden">
                <div className="text-xs font-semibold text-white truncate">{item.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                  <span>{item.date}</span>
                  <span>{t(`sections.${item.section.toLowerCase()}`) || item.section}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <MediaUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        userEmail={userEmail}
      />

      <MediaViewerModal
        mediaItem={activeViewerItem}
        onClose={() => setActiveViewerItem(null)}
        userEmail={userEmail}
      />
    </div>
  );
}
