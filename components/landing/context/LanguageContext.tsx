"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types';
import { TRANSLATIONS, Translations } from '../data/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialLanguage = 'EN'
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('direskill_language') as Language;
      if (saved && (saved === 'EN' || saved === 'አማ' || saved === 'ORO')) {
        return saved;
      }
    } catch {
      // ignore
    }
    return initialLanguage;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('direskill_language', lang);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Sync html lang attribute
    const htmlLang = language === 'አማ' ? 'am' : language === 'ORO' ? 'om' : 'en';
    document.documentElement.lang = htmlLang;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: TRANSLATIONS[language] || TRANSLATIONS.EN
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Safe fallback if used outside provider
    return {
      language: 'EN',
      setLanguage: () => {},
      t: TRANSLATIONS.EN
    };
  }
  return context;
};

