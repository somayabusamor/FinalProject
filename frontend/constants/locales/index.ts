import en from './en';
import ar from './ar';
import he from './he';
export type LocaleKeys = 'en' | 'ar' | 'he';

//import { LocaleKeys } from './types';

// استخدم هذا الكائن للترجمات
export const translations = {
  en: { ...en, currentLanguage: 'English' },
  ar: { ...ar, currentLanguage: 'العربية' },
  he: { ...he, currentLanguage: 'עברית' },
};

// هذه الدالة يجب أن تعيد ترجمات اللغة الحالية
export const useTranslations = (lang: LocaleKeys = 'en') => {
  return translations[lang] || translations.en;
};