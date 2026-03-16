import React, { createContext, useContext, useState, useCallback } from "react";
import { Lang, Translations, getTranslations, LANG_STORAGE_KEY } from "../i18n";

type LanguageContextType = {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "ja",
  t: getTranslations("ja"),
  setLang: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    return (stored as Lang) || "ja";
  });

  const setLang = useCallback((newLang: Lang) => {
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
    setLangState(newLang);
  }, []);

  const t = getTranslations(lang);

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
