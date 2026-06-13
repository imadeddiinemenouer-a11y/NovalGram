import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNovels } from '../utils/api';
import NovelCard from '../components/novels/NovelCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import type { Novel } from '../types';

const GENRES = ['All', 'Fantasy', 'Romance', 'Mystery', 'Sci-Fi', 'Horror', 'Adventure', 'Historical', 'Thriller'];

export default function DiscoverPage() {
  const navigate = useNavigate();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [filteredNovels, setFilteredNovels] = useState<Novel[]>([]);
  const [activeGenre, setActiveGenre] = useState('All');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [heroIdx, setHeroIdx] = useState(0);

  const FEATURED = [
    { id: '1', title: "Heir of the Shattered Stars", author: "Sara Al-Ghalib", genre: "Fantasy", emoji: "⭐", reads: "2.4M", rating: 4.9 },
    { id: '2', title: "The Last String", author: "Lina Haddad", genre: "Romance", emoji: "🎵", reads: "3.1M", rating: 4.8 },
    { id: '3', title: "Blue Code 2087", author: "Mazen Al-Rashid", genre: "Sci-Fi", emoji: "💻", reads: "1.2M", rating: 4.6 },
  ];

  useEffect(() => { loadNovels(); }, [activeGenre]);
  useEffect(() => { const t = setInterval(() => setHeroIdx(p => (p + 1) % FEATURED.length), 5000); return () => clearInterval(t); }, []);

  async function loadNovels() {
    try { setIsLoading(true); const data = await getNovels({ genre: activeGenre === 'All' ? undefined : activeGenre }); setNovels(data || []); applyFilter(data || [], activeTab); } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }

  function applyFilter(list: Novel[], tab: string) {
    if (tab === 'new') setFilteredNovels([...list].reverse());
    else if (tab === 'following') setFilteredNovels(list.filter(n => (n as any).progress > 0));
    else setFilteredNovels(list);
  }

  const hero = FEATURED[heroIdx % FEATURED.length];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      <div className="sticky top-14 z-30 bg-[var(--bg)]/95 backdrop-blur-2xl border-b border-[var(--border)]">
        <div className="flex overflow-x-auto scrollbar-hide">
          {['For You', 'Following', '🔥 Hot', '✨ New', '🏆 Top'].map((tab, i) => (
            <button key={tab} onClick={() => { setActiveTab(['all','following','hot','new','rank'][i]); applyFilter(novels, ['all','following','hot','new','rank'][i]); }}
              className={`flex-shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === ['all','following','hot','new','rank'][i] ? 'border-[var(--accent)] text-[var(--text)]' : 'border-transparent text-[var(--text3)]'}`}>{tab}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div onClick={() => navigate(`/novel/${hero.id}`)} className="relative m-3 h-[210px] rounded-3xl overflow-hidden cursor-pointer bg-[var(--bg2)] border border-[var(--border)]">
          <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-20">{hero.emoji}</div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <span className="inline-block px-2 py-0.5 rounded bg-[var(--accent)] text-white text-xs font-bold uppercase mb-2">{hero.genre}</span>
            <h2 className="font-serif text-2xl font-bold text-[var(--text)]">{hero.title}</h2>
            <div className="flex gap-3 text-xs text-[var(--text2)] mt-1"><span>✍️ {hero.author}</span><span>👁 {hero.reads}</span><span>⭐ {hero.rating}</span></div>
          </div>
        </div>

        <div className="flex justify-center gap-1.5 -mt-2 mb-2">
          {FEATURED.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)} aria-label={`Featured ${i+1}`}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === heroIdx % FEATURED.length ? 'w-5 bg-[var(--accent)]' : 'bg-[var(--bg3)]'}`} />
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
          {GENRES.map(g => (
            <button key={g} onClick={() => setActiveGenre(g)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeGenre === g ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-[var(--bg2)] border-[var(--border)] text-[var(--text3)]'}`}>{g}</button>
          ))}
        </div>

        <div className="px-3 space-y-2">
          {isLoading ? <LoadingSpinner className="py-12" /> : filteredNovels.length === 0 ? <EmptyState title="No novels found" description="Try adjusting your filters." /> : filteredNovels.map((novel, i) => <div key={novel.id} className="animate-fade-in" style={{ animationDelay: `${i*0.05}s` }}><NovelCard novel={novel} /></div>)}
        </div>
      </div>
    </div>
  );
}