"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('direskill-lang');
      const legacyLanding = localStorage.getItem('direskill_language');
      let resolved: Language = 'en';

      if (saved === 'en' || saved === 'am' || saved === 'om') {
        resolved = saved;
      } else if (legacyLanding === 'አማ') {
        resolved = 'am';
      } else if (legacyLanding === 'ORO') {
        resolved = 'om';
      }

      setLanguageState(resolved);
      document.documentElement.lang = resolved;
    } catch {
      // Ignore local storage errors
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('direskill-lang', lang);
      const landingCode = lang === 'am' ? 'አማ' : lang === 'om' ? 'ORO' : 'EN';
      localStorage.setItem('direskill_language', landingCode);
      document.documentElement.lang = lang;
    } catch {
      // Ignore local storage errors
    }
  };

  const t = (key: TranslationKey): string => {
    const langRecord = translations[language] as Record<string, string> | undefined;
    const langVal = langRecord?.[key];
    if (langVal !== undefined) return langVal;
    const enVal = (translations['en'] as Record<string, string>)?.[key];
    if (enVal !== undefined) return enVal;
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
