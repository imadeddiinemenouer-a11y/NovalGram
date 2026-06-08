export function formatNumber(num: number | null | undefined): string {
  if (num == null) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function calculateReadingTime(wordCount: number): string {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  if (minutes < 60) return `${minutes} min read`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m read`;
}

export const STATUS_COLORS = {
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  hiatus: 'bg-yellow-100 text-yellow-700',
  dropped: 'bg-red-100 text-red-700',
} as const;

export const LIBRARY_TABS = {
  reading: { label: 'Reading', icon: 'BookOpen', color: 'text-blue-600' },
  completed: { label: 'Completed', icon: 'CheckCircle', color: 'text-green-600' },
  dropped: { label: 'Dropped', icon: 'XCircle', color: 'text-red-600' },
  planned: { label: 'Planned', icon: 'Clock', color: 'text-purple-600' },
} as const;