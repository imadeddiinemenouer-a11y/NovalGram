import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookOpen, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/api';
import { formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import type { Bookmark as BookmarkType } from '../types';

export default function BookmarksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to save bookmarks</h2>
          <p className="text-gray-500 mb-4">Never lose your place in a story</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-14 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Bookmarks</h1>
          <p className="text-sm text-gray-500 mt-1">Your saved reading positions</p>
        </div>
      </div>

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
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Start Reading
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div 
                key={bookmark.id}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => navigate(`/chapter/${bookmark.chapter_id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {bookmark.novel?.title || 'Unknown Novel'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {bookmark.chapter?.title || 'Unknown Chapter'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(bookmark.created_at)}
                      </span>
                      {bookmark.note && (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          Note: {bookmark.note}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(bookmark.id);
                    }}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
