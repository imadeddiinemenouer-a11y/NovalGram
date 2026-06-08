import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function calculateReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 200);
  if (minutes < 1) return '< 1 min';
  if (minutes === 1) return '1 min';
  return `${minutes} mins`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const GENRES = [
  'Fantasy', 'Romance', 'Sci-Fi', 'Mystery', 'Action', 
  'Comedy', 'Drama', 'Horror', 'Thriller', 'Adventure',
  'Historical', 'Supernatural', 'Slice of Life', 'Sports'
] as const;

export const NOVEL_STATUS = {
  ongoing: { label: 'Ongoing', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  hiatus: { label: 'Hiatus', color: 'bg-yellow-100 text-yellow-700' },
  dropped: { label: 'Dropped', color: 'bg-red-100 text-red-700' }
} as const;

export const LIBRARY_STATUS = {
  reading: { label: 'Reading', icon: 'BookOpen', color: 'text-blue-600' },
  completed: { label: 'Completed', icon: 'CheckCircle', color: 'text-green-600' },
  dropped: { label: 'Dropped', icon: 'XCircle', color: 'text-red-600' },
  planned: { label: 'Planned', icon: 'Clock', color: 'text-purple-600' }
} as const;
export function calculateReadingTime(wordCount: number): string {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  if (minutes < 60) return `${minutes} min read`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m read`;
}