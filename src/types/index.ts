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

export interface Bookmark {
  id: string;
  user_id: string;
  novel_id: string;
  chapter_id: string;
  chapter?: Chapter;
  page_position: number;
  note: string | null;
  created_at: string;
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

export interface Rating {
  id: string;
  user_id: string;
  novel_id: string;
  rating: number;
  review: string | null;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string | null;
  novel_id: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'new_chapter' | 'comment' | 'follow' | 'mention' | 'like';
  title: string;
  message: string | null;
  novel_id: string | null;
  chapter_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  donor?: Profile;
  recipient_id: string;
  recipient?: Profile;
  amount: number;
  message: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface NovelStats {
  id: string;
  novel_id: string;
  date: string;
  views: number;
  new_followers: number;
  new_comments: number;
  donations_total: number;
}
// Helper functions for language support
export function getLanguageByCode(code: string) {
  const languages: Record<string, { name: string; flag: string }> = {
    en: { name: 'English', flag: '🇬🇧' },
    ar: { name: 'العربية', flag: '🇸🇦' },
    fr: { name: 'Français', flag: '🇫🇷' },
    es: { name: 'Español', flag: '🇪🇸' },
    de: { name: 'Deutsch', flag: '🇩🇪' },
    zh: { name: '中文', flag: '🇨🇳' },
    ja: { name: '日本語', flag: '🇯🇵' },
    ko: { name: '한국어', flag: '🇰🇷' },
    ru: { name: 'Русский', flag: '🇷🇺' },
    tr: { name: 'Türkçe', flag: '🇹🇷' },
    hi: { name: 'हिन्दी', flag: '🇮🇳' },
    pt: { name: 'Português', flag: '🇧🇷' },
    it: { name: 'Italiano', flag: '🇮🇹' },
    id: { name: 'Bahasa Indonesia', flag: '🇮🇩' },
    th: { name: 'ไทย', flag: '🇹🇭' },
    vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
    pl: { name: 'Polski', flag: '🇵🇱' },
    nl: { name: 'Nederlands', flag: '🇳🇱' },
    sv: { name: 'Svenska', flag: '🇸🇪' },
    fa: { name: 'فارسی', flag: '🇮🇷' },
    ur: { name: 'اردو', flag: '🇵🇰' },
    bn: { name: 'বাংলা', flag: '🇧🇩' },
    ta: { name: 'தமிழ்', flag: '🇮🇳' },
    ms: { name: 'Bahasa Melayu', flag: '🇲🇾' },
    fil: { name: 'Filipino', flag: '🇵🇭' },
  };
  return languages[code] || { name: code, flag: '🌐' };
}

export function isRTL(code: string): boolean {
  return ['ar', 'fa', 'ur'].includes(code);
}
