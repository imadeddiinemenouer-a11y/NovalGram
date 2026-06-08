// Add to types/index.ts - Language field for novels

export interface Novel {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  author_id: string;
  author?: Profile;
  status: 'ongoing' | 'completed' | 'hiatus' | 'dropped';
  genre: string[];
  language: string; // ISO language code: en, ar, fr, etc.
  word_count: number;
  rating: number;
  total_ratings: number;
  views: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Language metadata
export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', isRTL: false, direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRTL: true, direction: 'rtl' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', isRTL: false, direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', isRTL: false, direction: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', isRTL: false, direction: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', isRTL: false, direction: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', isRTL: false, direction: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', isRTL: false, direction: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', isRTL: false, direction: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', isRTL: false, direction: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', isRTL: false, direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', isRTL: false, direction: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', isRTL: false, direction: 'ltr' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', isRTL: false, direction: 'ltr' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', isRTL: false, direction: 'ltr' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', isRTL: false, direction: 'ltr' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', isRTL: false, direction: 'ltr' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', isRTL: false, direction: 'ltr' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', isRTL: false, direction: 'ltr' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', isRTL: true, direction: 'rtl' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', isRTL: true, direction: 'rtl' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', isRTL: false, direction: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', isRTL: false, direction: 'ltr' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', isRTL: false, direction: 'ltr' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭', isRTL: false, direction: 'ltr' },
];

export function getLanguageByCode(code: string): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

export function isRTL(code: string): boolean {
  const lang = getLanguageByCode(code);
  return lang?.isRTL || false;
}
