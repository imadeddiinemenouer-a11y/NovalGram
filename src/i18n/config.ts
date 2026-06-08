import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files
import en from './locales/en.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import de from './locales/de.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ru from './locales/ru.json';
import tr from './locales/tr.json';
import hi from './locales/hi.json';
import pt from './locales/pt.json';
import it from './locales/it.json';
import id from './locales/id.json';
import th from './locales/th.json';
import vi from './locales/vi.json';
import pl from './locales/pl.json';
import nl from './locales/nl.json';
import sv from './locales/sv.json';
import fa from './locales/fa.json';
import ur from './locales/ur.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import ms from './locales/ms.json';
import fil from './locales/fil.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  fr: { translation: fr },
  es: { translation: es },
  de: { translation: de },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  ru: { translation: ru },
  tr: { translation: tr },
  hi: { translation: hi },
  pt: { translation: pt },
  it: { translation: it },
  id: { translation: id },
  th: { translation: th },
  vi: { translation: vi },
  pl: { translation: pl },
  nl: { translation: nl },
  sv: { translation: sv },
  fa: { translation: fa },
  ur: { translation: ur },
  bn: { translation: bn },
  ta: { translation: ta },
  ms: { translation: ms },
  fil: { translation: fil },
};

export const RTL_LANGUAGES = ['ar', 'fa', 'ur', 'he'];
export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ru: 'Русский',
  tr: 'Türkçe',
  hi: 'हिन्दी',
  pt: 'Português',
  it: 'Italiano',
  id: 'Bahasa Indonesia',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  pl: 'Polski',
  nl: 'Nederlands',
  sv: 'Svenska',
  fa: 'فارسی',
  ur: 'اردو',
  bn: 'বাংলা',
  ta: 'தமிழ்',
  ms: 'Bahasa Melayu',
  fil: 'Filipino',
};

export const LANGUAGE_FLAGS: Record<string, string> = {
  en: '🇺🇸', ar: '🇸🇦', fr: '🇫🇷', es: '🇪🇸', de: '🇩🇪',
  zh: '🇨🇳', ja: '🇯🇵', ko: '🇰🇷', ru: '🇷🇺', tr: '🇹🇷',
  hi: '🇮🇳', pt: '🇧🇷', it: '🇮🇹', id: '🇮🇩', th: '🇹🇭',
  vi: '🇻🇳', pl: '🇵🇱', nl: '🇳🇱', sv: '🇸🇪', fa: '🇮🇷',
  ur: '🇵🇰', bn: '🇧🇩', ta: '🇮🇳', ms: '🇲🇾', fil: '🇵🇭',
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
