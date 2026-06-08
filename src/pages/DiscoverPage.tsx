import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Star, Compass, Sparkles, Filter, ChevronRight, BookOpen } from 'lucide-react';
import { getNovels } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import type { Novel } from '../types';

const GENRE_LIST = ['All', 'Fantasy', 'Romance', 'Sci-Fi', 'Mystery', 'Horror', 'Comedy'];

export default function DiscoverPage() {
  const navigate = useNavigate();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [filteredNovels, setFilteredNovels] = useState<Novel[]>([]);
  const [activeGenre, setActiveGenre] = useState('All');
  const [activeSort, setActiveSort] = useState<'trending' | 'new' | 'rating'>('trending');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNovels();
  }, [activeSort, activeGenre]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredNovels(novels);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredNovels(
        novels.filter(n =>
          n.title.toLowerCase().includes(q) ||
          n.author?.username?.toLowerCase().includes(q) ||
          n.genre?.some(g => g.toLowerCase().includes(q))
        )
      );
    }
  }, [searchQuery, novels]);

  async function loadNovels() {
    setIsLoading(true);
    try {
      const data = await getNovels({
        genre: activeGenre === 'All' ? undefined : activeGenre,
        sort: activeSort,
      });
      setNovels(data || []);
      setFilteredNovels(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
      {/* Header بسيط */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-2xl font-extrabold tracking-tight text-indigo-600 dark:text-white flex items-center gap-2">
            <Compass className="w-6 h-6" /> Discover
          </h1>
          <button
            onClick={() => navigate('/search')}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Search className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        {/* شريط الفلتر السريع */}
        <div className="max-w-4xl mx-auto mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {['trending', 'new', 'rating'].map((sort) => (
            <button
              key={sort}
              onClick={() => setActiveSort(sort as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeSort === sort
                  ? 'bg-indigo-600 dark:bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              {sort === 'trending' && <TrendingUp className="w-3.5 h-3.5 inline mr-1" />}
              {sort === 'new' && <Sparkles className="w-3.5 h-3.5 inline mr-1" />}
              {sort === 'rating' && <Star className="w-3.5 h-3.5 inline mr-1" />}
              {sort.charAt(0).toUpperCase() + sort.slice(1)}
            </button>
          ))}
          <div className="w-px bg-gray-200 dark:bg-gray-700 mx-1" />
          {GENRE_LIST.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeGenre === genre
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* المحتوى الرئيسي: شبكة بطاقات أفقية بأسلوب Wattpad */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : filteredNovels.length === 0 ? (
          <EmptyState
            title="No novels found"
            description="Try adjusting your filters"
            action={
              <button
                onClick={() => { setActiveGenre('All'); setActiveSort('trending'); }}
                className="mt-4 px-4 py-2 bg-indigo-600 dark:bg-red-600 text-white rounded-lg"
              >
                Clear Filters
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredNovels.map((novel) => (
              <div
                key={novel.id}
                onClick={() => navigate(`/novel/${novel.id}`)}
                className="flex gap-4 bg-gray-50 dark:bg-gray-900 rounded-2xl p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group border border-transparent hover:border-indigo-100 dark:hover:border-gray-700"
              >
                {/* الغلاف */}
                <img
                  src={novel.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop'}
                  alt={novel.title}
                  className="w-20 h-28 object-cover rounded-xl shadow-md flex-shrink-0 group-hover:scale-105 transition-transform"
                />
                {/* المعلومات */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-red-400 transition-colors">
                      {novel.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      by {novel.author?.display_name || novel.author?.username || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mt-2">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {novel.rating || '0.0'}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {novel.word_count || 0}</span>
                    <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-[10px] capitalize">{novel.status}</span>
                  </div>
                  {/* شريط تقدم صغير */}
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1 mt-2">
                    <div className="bg-indigo-500 dark:bg-red-500 h-1 rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 self-center" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}