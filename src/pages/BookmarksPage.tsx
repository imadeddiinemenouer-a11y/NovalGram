import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookOpen, Clock, Trash2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../utils/api';
import { formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import type { Bookmark as BookmarkType } from '../types';

export default function BookmarksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBookmarks();
    }
  }, [user]);

  async function loadBookmarks() {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*, novel:novels(*), chapter:chapters(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemove(bookmarkId: string) {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) throw error;
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Sign in to save bookmarks</h2>
          <p className="text-gray-500 mb-4">Never lose your place in a story</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-indigo-600 dark:bg-red-600 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-red-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-14 z-30 shadow-sm border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bookmark className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-indigo-600'}`} />
            Bookmarks
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Your saved reading positions
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : bookmarks.length === 0 ? (
          <EmptyState 
            icon={Bookmark}
            title="No bookmarks yet"
            description="Save your reading progress while reading chapters"
            action={
              <button 
                onClick={() => navigate('/')}
                className="mt-4 px-4 py-2 bg-indigo-600 dark:bg-red-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-red-700 transition-colors"
              >
                Start Reading
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div 
                key={bookmark.id}
                onClick={() => navigate(`/chapter/${bookmark.chapter_id}`)}
                className={`group rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 ${
                  isDark ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
                }`}
              >
                {/* أيقونة */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-gray-800 text-red-400' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  <BookOpen className="w-6 h-6" />
                </div>

                {/* معلومات */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {bookmark.novel?.title || 'Unknown Novel'}
                  </h3>
                  <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {bookmark.chapter?.title || 'Unknown Chapter'}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className={`flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <Clock className="w-3 h-3" />
                      {formatDate(bookmark.created_at)}
                    </span>
                    {bookmark.note && (
                      <span className={`px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        📝 {bookmark.note}
                      </span>
                    )}
                  </div>
                </div>

                {/* أزرار */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(bookmark.id);
                    }}
                    className={`p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
                      isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                    }`}
                    title="Remove bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-600' : 'text-gray-300'} group-hover:text-indigo-500 dark:group-hover:text-red-400 transition-colors`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}