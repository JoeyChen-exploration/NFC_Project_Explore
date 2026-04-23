import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LANG_KEY = 'linkhub_language';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    if (typeof window === 'undefined') return 'zh';
    const saved = window.localStorage.getItem(LANG_KEY);
    return saved === 'en' ? 'en' : 'zh';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LANG_KEY, locale);
    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale: () => setLocale(current => (current === 'zh' ? 'en' : 'zh')),
      tc: (zhText, enText) => (locale === 'zh' ? zhText : enText),
      isZh: locale === 'zh',
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return context;
}
