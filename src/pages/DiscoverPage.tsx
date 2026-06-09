import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getNovels } from '../utils/api';
import NovelCard from '../components/novels/NovelCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import type { Novel } from '../types';

const GENRES = ['All', 'Fantasy', 'Romance', 'Mystery', 'Sci-Fi', 'Horror', 'Adventure', 'Historical', 'Thriller'];

// بيانات وهمية للـ Hero Banner
const FEATURED = [
  { id: 0, title: "Heir of the Shattered Stars", author: "Sara Al-Ghalib", genre: "Fantasy", emoji: "⭐", reads: "2.4M", rating: 4.9, c1: "#4c1d95", c2: "#be185d" },
  { id: 2, title: "The Last String", author: "Lina Haddad", genre: "Romance", emoji: "🎵", reads: "3.1M", rating: 4.8, c1: "#9d174d", c2: "#7c3aed" },
  { id: 6, title: "Phoenix Protocol", author: "James Whitmore", genre: "Sci-Fi", emoji: "🔥", reads: "1.8M", rating: 4.8, c1: "#92400e", c2: "#991b1b" },
];

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const feedRef = useRef<HTMLDivElement>(null);

  const [novels, setNovels] = useState<Novel[]>([]);
  const [filteredNovels, setFilteredNovels] = useState<Novel[]>([]);
  const [activeGenre, setActiveGenre] = useState('All');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    loadNovels();
  }, [activeGenre]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIdx(prev => (prev + 1) % FEATURED.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  async function loadNovels() {
    try {
      setIsLoading(true);
      const data = await getNovels({
        genre: activeGenre === 'All' ? undefined : activeGenre,
        sort: 'trending',
      });
      setNovels(data || []);
      applyFilter(data || [], activeTab);
    } catch (error) {
      console.error('Error loading novels:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function applyFilter(list: Novel[], tab: string) {
    if (tab === 'rank') {
      setFilteredNovels([...list].sort((a, b) => (b.views || 0) - (a.views || 0)));
    } else if (tab === 'new') {
      setFilteredNovels([...list].reverse());
    } else if (tab === 'following') {
      setFilteredNovels(list.filter(n => (n as any).progress > 0));
    } else {
      setFilteredNovels(list);
    }
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    applyFilter(novels, tab);
  }

  const hero = FEATURED[heroIdx % FEATURED.length];

  return (
    <div className="min-h-screen bg-[var(--void)] text-[var(--txt)] transition-colors">
      {/* التبويبات العلوية */}
      <div className="sticky top-14 z-30 bg-[var(--void)]/95 backdrop-blur-2xl border-b border-[var(--b2)]">
        <div className="flex overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: 'For You' },
            { id: 'following', label: 'Following' },
            { id: 'hot', label: '🔥 Hot' },
            { id: 'new', label: '✨ New' },
            { id: 'rank', label: '🏆 Top' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-[var(--vb)] text-[var(--vb)]'
                  : 'border-transparent text-[var(--txt3)] hover:text-[var(--txt2)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20" ref={feedRef}>
        {/* Hero Banner */}
        <div
          onClick={() => navigate(`/novel/${hero.id}`)}
          className="relative m-3 h-[226px] rounded-3xl overflow-hidden cursor-pointer shadow-2xl group"
          style={{ background: `linear-gradient(135deg, ${hero.c1}44, ${hero.c2}22)` }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-7xl" style={{ filter: `drop-shadow(0 0 16px ${hero.c1})` }}>
            {hero.emoji}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--void)]/98 via-[var(--void)]/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[var(--v)] to-[var(--mg)] text-white text-xs font-bold uppercase tracking-wider mb-2">
              ⭐ {hero.genre}
            </div>
            <h2 className="font-serif text-2xl font-bold leading-tight mb-1">{hero.title}</h2>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>✍️ {hero.author}</span>
              <span>👁️ {hero.reads}</span>
              <span>⭐ {hero.rating}</span>
            </div>
          </div>
        </div>

        {/* نقاط التنقل بين الـ Hero */}
        <div className="flex justify-center gap-1.5 -mt-2 mb-2">
          {FEATURED.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === heroIdx % FEATURED.length ? 'w-5 bg-[var(--vb)]' : 'bg-[var(--surface3)]'
              }`}
            />
          ))}
        </div>

        {/* شريط التصنيفات */}
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => { setActiveGenre(genre); }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeGenre === genre
                  ? 'bg-[var(--v)] border-[var(--v)] text-white'
                  : 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt3)] hover:border-[var(--vb)]'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* قائمة الروايات */}
        <div className="px-3 space-y-2">
          {isLoading ? (
            <LoadingSpinner className="py-12" />
          ) : filteredNovels.length === 0 ? (
            <EmptyState
              title="No novels found"
              description="Try adjusting your filters or check back later."
              action={
                <button
                  onClick={() => { setActiveGenre('All'); }}
                  className="mt-4 px-4 py-2 bg-[var(--v)] text-white rounded-full text-sm font-semibold"
                >
                  Clear Filters
                </button>
              }
            />
          ) : (
            filteredNovels.map((novel, index) => (
              <div key={novel.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-fade-in">
                <NovelCard novel={novel} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}