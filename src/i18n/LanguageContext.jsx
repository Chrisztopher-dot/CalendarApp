import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations.js';
import { sv, enUS } from 'date-fns/locale';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('lifeatlas_lang') || 'sv';
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem('lifeatlas_lang', newLang);
  };

  // Helper to retrieve nested keys like 'nav.calendar'
  const t = (path) => {
    const keys = path.split('.');
    let current = translations[lang] || translations.sv;
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to Swedish
        let fallback = translations.sv;
        for (const fKey of keys) {
          fallback = fallback?.[fKey];
        }
        return fallback || path;
      }
    }
    return current;
  };

  const dateLocale = lang === 'en' ? enUS : sv;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dateLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
