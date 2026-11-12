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
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    try {
      const savedLanding = localStorage.getItem('direskill_language') as Language;
      if (savedLanding && (savedLanding === 'EN' || savedLanding === 'አማ' || savedLanding === 'ORO')) {
        setLanguageState(savedLanding);
        return;
      }
      const savedGlobal = localStorage.getItem('direskill-lang');
      if (savedGlobal === 'am') setLanguageState('አማ');
      else if (savedGlobal === 'om') setLanguageState('ORO');
      else if (savedGlobal === 'en') setLanguageState('EN');
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('direskill_language', lang);
      const globalCode = lang === 'አማ' ? 'am' : lang === 'ORO' ? 'om' : 'en';
      localStorage.setItem('direskill-lang', globalCode);
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

