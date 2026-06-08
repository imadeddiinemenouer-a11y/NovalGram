import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Globe, BookOpen, Users, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { supabase } from '../utils/api';
import { getLanguageByCode, isRTL } from '../types';
import NovelCard from '../components/novels/NovelCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import type { Novel } from '../types';

export default function LanguageNovelsPage() {
  const { langCode } = useParams<{ langCode: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalNovels: 0,
    totalViews: 0,
    totalAuthors: 0,
    topGenre: ''
  });

  const language = getLanguageByCode(langCode || 'en');
  const rtl = isRTL(langCode || 'en');

  useEffect(() => {
    if (langCode) {
      loadLanguageNovels();
    }
  }, [langCode]);

  async function loadLanguageNovels() {
    try {
      setIsLoading(true);

      // Load novels for this language
      const { data: novelsData, error } = await supabase
        .from('novels')
        .select('*, author:profiles(*)')
        .eq('is_published', true)
        .eq('language', langCode)
        .order('views', { ascending: false });

      if (error) throw error;
      setNovels(novelsData || []);

      // Calculate stats
      if (novelsData) {
        const totalViews = novelsData.reduce((acc, n) => acc + (n.views || 0), 0);
        const uniqueAuthors = new Set(novelsData.map(n => n.author_id)).size;

        // Get top genre
        const genreCounts: Record<string, number> = {};
        novelsData.forEach(n => {
          n.genre?.forEach(g => {
            genreCounts[g] = (genreCounts[g] || 0) + 1;
          });
        });
        const topGenre = Object.entries(genreCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

        setStats({
          totalNovels: novelsData.length,
          totalViews,
          totalAuthors: uniqueAuthors,
          topGenre
        });
      }

    } catch (error) {
      console.error('Error loading language novels:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!language) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Language not found</h2>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={rtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('common.back')}</span>
          </button>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-6xl">{language.flag}</span>
            <div>
              <h1 className="text-3xl font-bold">{language.nativeName}</h1>
              <p className="text-indigo-200">{language.name} Novels</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <BookOpen className="w-6 h-6 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalNovels}</p>
              <p className="text-xs text-indigo-200">Novels</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
              <p className="text-xs text-indigo-200">Views</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalAuthors}</p>
              <p className="text-xs text-indigo-200">Authors</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.topGenre || 'N/A'}</p>
              <p className="text-xs text-indigo-200">Top Genre</p>
            </div>
          </div>
        </div>
      </div>

      {/* Novels Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : novels.length === 0 ? (
          <EmptyState 
            icon={BookOpen}
            title={`No ${language.name} novels yet`}
            description="Be the first to publish a novel in this language!"
            action={
              <button 
                onClick={() => navigate('/studio')}
                className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Start Writing
              </button>
            }
          />
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {language.nativeName} {t('discover.novels')}
              </h2>
              <span className="text-sm text-gray-500">{novels.length} novels</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {novels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
