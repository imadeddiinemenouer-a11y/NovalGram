import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search, TrendingUp, Clock, Star, BookOpen, PenTool,
  Globe, ChevronRight, Flame, Award, Sparkles, Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getNovels, supabase } from '../utils/api';
import NovelCard from '../components/novels/NovelCard';
import NovelFilter from '../components/novels/NovelFilter';
import LanguageSelector from '../components/common/LanguageSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import type { Novel } from '../types';

const LANGUAGE_SECTIONS = [
  { code: 'ar', icon: '🇸🇦', color: 'from-emerald-500 to-teal-600' },
  { code: 'en', icon: '🇺🇸', color: 'from-blue-500 to-indigo-600' },
  { code: 'fr', icon: '🇫🇷', color: 'from-purple-500 to-pink-600' },
  { code: 'es', icon: '🇪🇸', color: 'from-orange-500 to-red-600' },
  { code: 'de', icon: '🇩🇪', color: 'from-yellow-500 to-orange-600' },
  { code: 'zh', icon: '🇨🇳', color: 'from-red-500 to-rose-600' },
  { code: 'ja', icon: '🇯🇵', color: 'from-pink-500 to-rose-600' },
  { code: 'ko', icon: '🇰🇷', color: 'from-indigo-500 to-purple-600' },
  { code: 'ru', icon: '🇷🇺', color: 'from-sky-500 to-blue-600' },
  { code: 'tr', icon: '🇹🇷', color: 'from-red-500 to-orange-600' },
  { code: 'hi', icon: '🇮🇳', color: 'from-orange-400 to-amber-600' },
  { code: 'pt', icon: '🇧🇷', color: 'from-green-500 to-emerald-600' },
  { code: 'it', icon: '🇮🇹', color: 'from-green-400 to-teal-600' },
  { code: 'id', icon: '🇮🇩', color: 'from-red-400 to-pink-600' },
  { code: 'th', icon: '🇹🇭', color: 'from-purple-400 to-indigo-600' },
  { code: 'vi', icon: '🇻🇳', color: 'from-red-400 to-rose-600' },
  { code: 'fa', icon: '🇮🇷', color: 'from-green-600 to-emerald-700' },
  { code: 'ur', icon: '🇵🇰', color: 'from-green-500 to-teal-700' },
  { code: 'bn', icon: '🇧🇩', color: 'from-green-600 to-emerald-800' },
  { code: 'ta', icon: '🇮🇳', color: 'from-orange-500 to-red-700' },
  { code: 'ms', icon: '🇲🇾', color: 'from-blue-400 to-indigo-700' },
  { code: 'fil', icon: '🇵🇭', color: 'from-blue-500 to-sky-700' },
];

const SPECIAL_SECTIONS = [
  { id: 'globalTrending', icon: Flame, color: 'from-orange-500 to-red-600', gradient: 'bg-gradient-to-r from-orange-500 to-red-600' },
  { id: 'newReleases', icon: Sparkles, color: 'from-purple-500 to-pink-600', gradient: 'bg-gradient-to-r from-purple-500 to-pink-600' },
  { id: 'topRated', icon: Star, color: 'from-yellow-500 to-amber-600', gradient: 'bg-gradient-to-r from-yellow-500 to-amber-600' },
  { id: 'editorPicks', icon: Award, color: 'from-emerald-500 to-teal-600', gradient: 'bg-gradient-to-r from-emerald-500 to-teal-600' },
  { id: 'risingStars', icon: TrendingUp, color: 'from-blue-500 to-indigo-600', gradient: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
];

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [novels, setNovels] = useState<Novel[]>([]);
  const [filteredNovels, setFilteredNovels] = useState<Novel[]>([]);
  const [languageNovels, setLanguageNovels] = useState<Record<string, Novel[]>>({});
  const [activeFilter, setActiveFilter] = useState('trending');
  const [activeGenre, setActiveGenre] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    loadNovels();
    loadLanguageNovels();
  }, [activeFilter, activeGenre]);

  useEffect(() => {
    filterNovels();
  }, [searchQuery, novels]);

  async function loadNovels() {
    try {
      setIsLoading(true);
      const data = await getNovels({
        genre: activeGenre,
        sort: activeFilter as any,
      });
      setNovels(data || []);
      setFilteredNovels(data || []);
    } catch (error) {
      console.error('Error loading novels:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadLanguageNovels() {
    try {
      const langData: Record<string, Novel[]> = {};
      for (const lang of LANGUAGE_SECTIONS) {
        const { data, error } = await supabase
          .from('novels')
          .select('*, author:profiles(*)')
          .eq('is_published', true)
          .eq('language', lang.code)
          .order('views', { ascending: false })
          .limit(6);
        if (!error && data) langData[lang.code] = data;
      }
      setLanguageNovels(langData);
    } catch (error) {
      console.error('Error loading language novels:', error);
    }
  }

  function filterNovels() {
    if (!searchQuery.trim()) {
      setFilteredNovels(novels);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = novels.filter(
      novel =>
        novel.title.toLowerCase().includes(query) ||
        novel.description?.toLowerCase().includes(query) ||
        novel.author?.display_name?.toLowerCase().includes(query) ||
        novel.author?.username?.toLowerCase().includes(query) ||
        novel.genre?.some(g => g.toLowerCase().includes(query))
    );
    setFilteredNovels(filtered);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterNovels();
    setShowSearch(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(sectionId);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] dark:bg-gray-950 transition-colors">
      {/* Hero Header with Logo */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-gray-900 dark:via-black dark:to-red-950 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* شعار Novelgram – يمكن استبداله بصورة حقيقية لاحقاً */}
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Novelgram
                </h1>
                <p className="text-indigo-200 dark:text-red-200 text-sm">
                  {t('app.tagline', 'Stories that ping you back')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <LanguageSelector />
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              {user?.role === 'author' && (
                <button
                  onClick={() => navigate('/studio')}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
                >
                  <PenTool className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {showSearch && (
            <form onSubmit={handleSearch} className="mb-6 animate-fade-in">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('discover.searchPlaceholder', 'Search novels, authors...')}
                  className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-md rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </form>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
              <BookOpen className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-lg font-bold">{novels.length}</p>
              <p className="text-[10px] opacity-80">Novels</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
              <Globe className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-lg font-bold">{Object.keys(languageNovels).length}</p>
              <p className="text-[10px] opacity-80">Languages</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-lg font-bold">
                {novels.reduce((acc, n) => acc + (n.views || 0), 0).toLocaleString()}
              </p>
              <p className="text-[10px] opacity-80">Views</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
              <Star className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-lg font-bold">
                {novels.filter(n => n.rating > 0).length}
              </p>
              <p className="text-[10px] opacity-80">Rated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {SPECIAL_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? `${section.gradient} text-white shadow-lg`
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t(`sections.${section.id}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <NovelFilter
            activeFilter={activeFilter}
            activeGenre={activeGenre}
            onFilterChange={setActiveFilter}
            onGenreChange={setActiveGenre}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {SPECIAL_SECTIONS.map((section) => (
          <section key={section.id} id={`section-${section.id}`} className="scroll-mt-32">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${section.color} flex items-center justify-center`}>
                  <section.icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t(`sections.${section.id}`)}
                </h2>
              </div>
              <button className="flex items-center gap-1 text-indigo-600 dark:text-red-400 hover:underline text-sm font-medium">
                {t('common.viewAll')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredNovels.slice(0, 5).map((novel) => (
                <NovelCard key={`${section.id}-${novel.id}`} novel={novel} />
              ))}
            </div>
          </section>
        ))}

        {LANGUAGE_SECTIONS.map((lang) => {
          const langNovels = languageNovels[lang.code] || [];
          if (langNovels.length === 0) return null;
          return (
            <section key={lang.code} id={`section-lang-${lang.code}`} className="scroll-mt-32">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${lang.color} flex items-center justify-center text-2xl`}>
                    {lang.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t(`sections.${lang.code}Novels`)}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {langNovels.length} {t('discover.novels')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/language/${lang.code}`)}
                  className="flex items-center gap-1 text-indigo-600 dark:text-red-400 hover:underline text-sm font-medium"
                >
                  {t('common.viewAll')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {langNovels.map((novel) => (
                  <NovelCard key={`${lang.code}-${novel.id}`} novel={novel} />
                ))}
              </div>
            </section>
          );
        })}

        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : filteredNovels.length === 0 ? (
          <EmptyState
            title={t('discover.noNovels')}
            description={t('discover.tryAdjusting')}
            action={
              <button
                onClick={() => {
                  setActiveFilter('trending');
                  setActiveGenre('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-indigo-600 dark:bg-red-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-red-700 transition-colors"
              >
                {t('discover.clearFilters')}
              </button>
            }
          />
        ) : (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('discover.title', 'All Novels')}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredNovels.length} {t('discover.novels')}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredNovels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}