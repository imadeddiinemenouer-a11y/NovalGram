import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, XCircle, Bookmark, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getLibrary, updateLibraryStatus, removeFromLibrary } from '../utils/api';
import { formatNumber } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import type { LibraryItem } from '../types';

const tabs = [
  { id: 'reading', label: 'Reading', icon: BookOpen },
  { id: 'completed', label: 'Completed', icon: CheckCircle },
  { id: 'dropped', label: 'Dropped', icon: XCircle },
  { id: 'planned', label: 'Saved', icon: Bookmark },
];

export default function LibraryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [activeTab, setActiveTab] = useState('reading');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) loadLibrary();
  }, [user]);

  async function loadLibrary() {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await getLibrary(user.id);
      setLibrary(data || []);
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemove(itemId: string) {
    try {
      await removeFromLibrary(itemId);
      setLibrary(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from library:', error);
    }
  }

  const filteredItems = library.filter(item => item.status === activeTab);
  const tabCounts = tabs.reduce((acc, tab) => ({
    ...acc,
    [tab.id]: library.filter(item => item.status === tab.id).length
  }), {} as Record<string, number>);

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[var(--void)]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-[var(--txt3)]" />
          <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-[var(--txt)]' : 'text-gray-900'}`}>Sign in to view your library</h2>
          <button onClick={() => navigate('/login')} className="px-6 py-3 bg-gradient-to-r from-[var(--v)] to-[var(--mg)] text-white rounded-full font-semibold">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-[var(--void)] text-[var(--txt)]' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`sticky top-14 z-30 border-b ${isDark ? 'bg-[var(--void)]/95 backdrop-blur-2xl border-[var(--b2)]' : 'bg-white border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4 font-serif">My Library</h1>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const count = tabCounts[tab.id] || 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-[var(--v)] text-white'
                      : isDark ? 'bg-[var(--surface2)] text-[var(--txt3)] hover:bg-[var(--surface3)]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : isDark ? 'bg-[var(--surface3)]' : 'bg-gray-200'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 py-6">
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : filteredItems.length === 0 ? (
          <EmptyState icon={tabs.find(t => t.id === activeTab)?.icon} title={`No ${activeTab} novels`} description={`Novels you mark as ${activeTab} will appear here`} />
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item, index) => {
              const novel = item.novel;
              if (!novel) return null;
              const totalChapters = novel.word_count ? Math.ceil(novel.word_count / 2000) : 0;
              const progress = totalChapters > 0 ? Math.round((item.last_chapter_read / totalChapters) * 100) : 0;
              return (
                <div key={item.id} onClick={() => navigate(`/novel/${novel.id}`)} className="card flex gap-3 p-3 cursor-pointer group animate-fade-in" style={{ animationDelay: `${index * 0.04}s` }}>
                  <div className="w-[62px] h-[84px] rounded-lg flex-shrink-0 overflow-hidden relative flex items-center justify-center text-3xl" style={{ background: `linear-gradient(135deg, ${(novel as any).c1 || '#6d28d9'}55, ${(novel as any).c2 || '#db2777'}22)` }}>
                    {novel.cover_image ? <img src={novel.cover_image} alt={novel.title} className="w-full h-full object-cover" /> : <span>📖</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate group-hover:text-[var(--vb)] transition-colors">{novel.title}</h3>
                    <p className="text-[11px] text-[var(--txt3)] mb-2">{novel.author?.display_name || novel.author?.username || 'Unknown'}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-[var(--surface3)] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[var(--v)] to-[var(--mg)] rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} /></div>
                      <span className="text-[10px] text-[var(--txt3)]">{progress}%</span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }} className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--surface2)] text-[var(--txt3)] hover:text-red-400 transition-colors self-start">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}