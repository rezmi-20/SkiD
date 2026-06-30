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
    console.debug("[DIREDAWA-DIAG] LanguageProvider mounting");
    const savedLanguage = localStorage.getItem('direskill-lang') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'am' || savedLanguage === 'om')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('direskill-lang', lang);
  };

  const t = (key: TranslationKey): string => {
    const langVal = translations[language]?.[key];
    if (langVal !== undefined) return langVal;
    const enVal = translations['en']?.[key];
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
