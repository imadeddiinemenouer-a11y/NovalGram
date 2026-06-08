import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, X, Filter, BookOpen, User } from 'lucide-react';
import { getNovels } from '../utils/api';
import { supabase } from '../utils/api';
import NovelCard from '../components/novels/NovelCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import type { Novel, Profile } from '../types';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<Novel[]>([]);
  const [authors, setAuthors] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'novels' | 'authors'>('all');

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  async function performSearch(searchTerm: string) {
    if (!searchTerm.trim()) {
      setResults([]);
      setAuthors([]);
      return;
    }

    try {
      setIsLoading(true);

      // Search novels
      const novelData = await getNovels({ search: searchTerm });
      setResults(novelData || []);

      // Search authors
      const { data: authorData, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .limit(10);

      if (!error) {
        setAuthors(authorData || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      performSearch(searchQuery.trim());
    }
  }

  const hasResults = results.length > 0 || authors.length > 0;
  const showNovels = filter === 'all' || filter === 'novels';
  const showAuthors = filter === 'all' || filter === 'authors';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-14 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search novels, authors, genres..."
              className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setResults([]); setAuthors([]); }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </form>

          {/* Filters */}
          <div className="flex gap-2">
            {(['all', 'novels', 'authors'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full capitalize transition-all ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : !query ? (
          <EmptyState 
            icon={Search}
            title="Start searching"
            description="Find your next favorite story or author"
          />
        ) : !hasResults ? (
          <EmptyState 
            icon={Search}
            title="No results found"
            description={`We couldn't find anything for "${query}"`}
            action={
              <button 
                onClick={() => { setSearchQuery(''); setSearchParams({}); }}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Clear Search
              </button>
            }
          />
        ) : (
          <div className="space-y-8">
            {/* Novels Results */}
            {showNovels && results.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Novels ({results.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.map((novel) => (
                    <NovelCard key={novel.id} novel={novel} />
                  ))}
                </div>
              </div>
            )}

            {/* Authors Results */}
            {showAuthors && authors.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Authors ({authors.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {authors.map((author) => (
                    <button
                      key={author.id}
                      onClick={() => navigate(`/author/${author.id}`)}
                      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left"
                    >
                      <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl font-bold">
                        {author.display_name?.[0] || author.username[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {author.display_name || author.username}
                        </h3>
                        <p className="text-sm text-gray-500">@{author.username}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{author.bio || 'No bio'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
