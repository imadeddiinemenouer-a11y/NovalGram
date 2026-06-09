export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: 'reader' | 'author' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Novel {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  author_id: string;
  author?: Profile;
  status: 'ongoing' | 'completed' | 'hiatus' | 'dropped';
  genre: string[];
  word_count: number;
  rating: number;
  total_ratings: number;
  views: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  novel_id: string;
  title: string;
  content: string;
  chapter_number: number;
  word_count: number;
  views: number;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  novel?: { author?: string };
}

export interface LibraryItem {
  id: string;
  user_id: string;
  novel_id: string;
  novel?: Novel;
  status: 'reading' | 'completed' | 'dropped' | 'planned';
  last_chapter_read: number;
  added_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  user?: Profile;
  novel_id: string;
  chapter_id: string | null;
  parent_id: string | null;
  content: string;
  likes: number;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  novel_id: string;
  chapter_id: string;
  novel?: Novel;
  chapter?: Chapter;
  page_position: number;
  note: string | null;
  created_at: string;
}

export function getLanguageByCode(code: string) {
  const languages: Record<string, { name: string; flag: string; nativeName: string }> = {
    en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
    ar: { name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
    fr: { name: 'French', flag: '🇫🇷', nativeName: 'Français' },
    es: { name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
    de: { name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
    ja: { name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
    ko: { name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
    zh: { name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
  };
  return languages[code] || { name: code, flag: '🌐', nativeName: code };
}

export function isRTL(code: string): boolean {
  return ['ar', 'fa', 'ur'].includes(code);
}