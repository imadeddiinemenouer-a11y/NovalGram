import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BarChart3, Edit, Eye, Heart, TrendingUp, Users, BookOpen, ChevronRight, Calendar, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../utils/api';
import { formatNumber, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import type { Novel } from '../types';

export default function StudioPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('novels');
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'author' || user?.role === 'admin') {
      loadNovels();
    }
  }, [user, activeTab]);

  async function loadNovels() {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('novels')
        .select('*, chapters:chapters(count)')
        .eq('author_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNovels(data || []);
    } catch (error) {
      console.error('Error loading novels:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePublishToggle(novelId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('novels')
        .update({ is_published: !currentStatus })
        .eq('id', novelId);

      if (error) throw error;
      setNovels(prev => prev.map(n => 
        n.id === novelId ? { ...n, is_published: !currentStatus } : n
      ));
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Sign in to access Studio</h2>
          <p className="text-gray-500 mb-4">Create and manage your novels</p>
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

  // If not author, show upgrade prompt
  if (user.role === 'reader') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-gray-800' : 'bg-indigo-100'}`}>
            <BookOpen className={`w-10 h-10 ${isDark ? 'text-red-400' : 'text-indigo-600'}`} />
          </div>
          <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Become an Author</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Share your stories with millions of readers. It's free to start writing!
          </p>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-left">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <TrendingUp className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Reach millions of readers worldwide</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <Users className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Build your fan community</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                <Heart className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Receive direct support from fans</span>
            </div>
          </div>
          <button 
            onClick={() => {
              updateUser({ role: 'author' });
              navigate('/studio/new');
            }}
            className="w-full px-6 py-3 bg-indigo-600 dark:bg-red-600 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-red-700 transition-colors font-medium"
          >
            Start Writing Now
          </button>
        </div>
      </div>
    );
  }

  // Author view
  const totalViews = novels.reduce((acc, n) => acc + (n.views || 0), 0);
  const totalRatings = novels.reduce((acc, n) => acc + (n.total_ratings || 0), 0);
  const totalChapters = novels.reduce((acc, n) => acc + (n.word_count ? Math.ceil(n.word_count / 2000) : 0), 0);
  const averageRating = novels.length > 0 ? (novels.reduce((acc, n) => acc + (n.rating || 0), 0) / novels.length).toFixed(1) : '0.0';

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-14 z-30 shadow-sm border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-indigo-600'}`} />
                Studio
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage your stories</p>
            </div>
            <button 
              onClick={() => navigate('/studio/new')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 ${
                isDark ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              New Novel
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-3">
            <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Eye className={`w-4 h-4 mx-auto mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <p className="text-lg font-bold">{formatNumber(totalViews)}</p>
              <p className="text-[10px] opacity-70">Views</p>
            </div>
            <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Star className={`w-4 h-4 mx-auto mb-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <p className="text-lg font-bold">{totalRatings}</p>
              <p className="text-[10px] opacity-70">Ratings</p>
            </div>
            <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <BookOpen className={`w-4 h-4 mx-auto mb-1 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <p className="text-lg font-bold">{totalChapters}</p>
              <p className="text-[10px] opacity-70">Chapters</p>
            </div>
            <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <TrendingUp className={`w-4 h-4 mx-auto mb-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              <p className="text-lg font-bold">{averageRating}</p>
              <p className="text-[10px] opacity-70">Avg Rating</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {['novels', 'stats', 'schedule'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                    : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : activeTab === 'novels' ? (
          novels.length === 0 ? (
            <EmptyState 
              icon={BookOpen}
              title="No novels yet"
              description="Create your first novel and start your writing journey"
              action={
                <button 
                  onClick={() => navigate('/studio/new')}
                  className="mt-4 px-4 py-2 bg-indigo-600 dark:bg-red-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-red-700 transition-colors"
                >
                  Create Novel
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {novels.map((novel) => (
                <div
                  key={novel.id}
                  className={`rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    isDark ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => navigate(`/novel/${novel.id}`)}
                >
                  <div className="flex gap-4">
                    <img 
                      src={novel.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop'}
                      alt={novel.title}
                      className="w-24 h-36 object-cover rounded-lg flex-shrink-0 shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{novel.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              novel.is_published 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            }`}>
                              {novel.is_published ? 'Published' : 'Draft'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {novel.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => navigate(`/studio/edit/${novel.id}`)}
                            className={`p-2 rounded-full transition-colors ${
                              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handlePublishToggle(novel.id, novel.is_published)}
                            className={`p-2 rounded-full transition-colors ${
                              novel.is_published 
                                ? 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' 
                                : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400'
                            }`}
                          >
                            {novel.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 text-center mb-4">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <p className="text-lg font-bold">{formatNumber(novel.views || 0)}</p>
                          <p className="text-[10px] opacity-60">Views</p>
                        </div>
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <p className="text-lg font-bold">{novel.total_ratings || 0}</p>
                          <p className="text-[10px] opacity-60">Ratings</p>
                        </div>
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <p className="text-lg font-bold">{novel.word_count ? Math.ceil(novel.word_count / 2000) : 0}</p>
                          <p className="text-[10px] opacity-60">Chapters</p>
                        </div>
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <p className="text-lg font-bold">{novel.rating || '0.0'}</p>
                          <p className="text-[10px] opacity-60">Rating</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Updated {formatDate(novel.updated_at)}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/studio/chapters/${novel.id}`);
                          }}
                          className={`flex items-center gap-1 font-medium transition-colors ${
                            isDark ? 'text-red-400 hover:text-red-300' : 'text-indigo-600 hover:text-indigo-700'
                          }`}
                        >
                          Manage Chapters
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'stats' ? (
          <div className={`p-6 rounded-2xl shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-indigo-600'}`} />
              <h2 className="text-xl font-bold">Statistics Overview</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-sm opacity-70">Total Views</p>
                <p className="text-3xl font-bold mt-1">{formatNumber(totalViews)}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-sm opacity-70">Total Readers</p>
                <p className="text-3xl font-bold mt-1">{totalRatings}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-sm opacity-70">Chapters Published</p>
                <p className="text-3xl font-bold mt-1">{totalChapters}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-sm opacity-70">Average Rating</p>
                <p className="text-3xl font-bold mt-1">{averageRating} ★</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-2xl shadow-sm text-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <Calendar className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Publishing Schedule</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Plan your releases to keep readers engaged
            </p>
          </div>
        )}
      </div>
    </div>
  );
}