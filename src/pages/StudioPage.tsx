import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BarChart3, Edit, Calendar, Eye, MessageCircle, Heart, TrendingUp, Users, BookOpen, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/api';
import { formatNumber, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import type { Novel, NovelStats } from '../types';

export default function StudioPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('novels');
  const [novels, setNovels] = useState<Novel[]>([]);
  const [stats, setStats] = useState<NovelStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'author' || user?.role === 'admin') {
      loadData();
    }
  }, [user, activeTab]);

  async function loadData() {
    if (!user) return;
    try {
      setIsLoading(true);

      if (activeTab === 'novels') {
        const { data, error } = await supabase
          .from('novels')
          .select('*, chapters:chapters(count)')
          .eq('author_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setNovels(data || []);
      } else if (activeTab === 'stats') {
        const { data, error } = await supabase
          .from('novel_stats')
          .select('*')
          .in('novel_id', novels.map(n => n.id))
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('date', { ascending: true });

        if (error) throw error;
        setStats(data || []);
      }
    } catch (error) {
      console.error('Error loading studio data:', error);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to access Studio</h2>
          <p className="text-gray-500 mb-4">Create and manage your novels</p>
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

  // If not author, show upgrade prompt
  if (user.role === 'reader') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Become an Author</h2>
          <p className="text-gray-500 mb-6">
            Share your stories with millions of readers. It's free to start writing!
          </p>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Reach millions of readers worldwide</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm text-gray-700">Build your fan community</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm text-gray-700">Receive direct support from fans</span>
            </div>
          </div>
          <button 
            onClick={async () => {
              await supabase.from('profiles').update({ role: 'author' }).eq('id', user.id);
              window.location.reload();
            }}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            Start Writing Now
          </button>
        </div>
      </div>
    );
  }

  const totalViews = novels.reduce((acc, n) => acc + (n.views || 0), 0);
  const totalFollowers = novels.reduce((acc, n) => acc + (n.total_ratings || 0), 0); // Using ratings as proxy
  const totalChapters = novels.reduce((acc, n) => acc + (n.word_count ? Math.ceil(n.word_count / 2000) : 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-14 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Studio</h1>
              <p className="text-sm text-gray-500">Manage your stories</p>
            </div>
            <button 
              onClick={() => navigate('/studio/new')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Novel
            </button>
          </div>

          <div className="flex gap-2">
            {['novels', 'stats', 'schedule'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

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
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Novel
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {novels.map((novel) => (
                <div key={novel.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex gap-4">
                    <img 
                      src={novel.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop'}
                      alt={novel.title}
                      className="w-24 h-36 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{novel.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              novel.is_published 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {novel.is_published ? 'Published' : 'Draft'}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              {novel.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/studio/edit/${novel.id}`)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button 
                            onClick={() => handlePublishToggle(novel.id, novel.is_published)}
                            className={`p-2 rounded-full transition-colors ${
                              novel.is_published 
                                ? 'hover:bg-yellow-50 text-yellow-600' 
                                : 'hover:bg-green-50 text-green-600'
                            }`}
                          >
                            {novel.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-center mb-4">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{formatNumber(novel.views || 0)}</p>
                          <p className="text-xs text-gray-500">Views</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{novel.total_ratings || 0}</p>
                          <p className="text-xs text-gray-500">Ratings</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{novel.word_count ? Math.ceil(novel.word_count / 2000) : 0}</p>
                          <p className="text-xs text-gray-500">Chapters</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{novel.rating || '0.0'}</p>
                          <p className="text-xs text-gray-500">Rating</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Updated {formatDate(novel.updated_at)}</span>
                        <button 
                          onClick={() => navigate(`/studio/chapters/${novel.id}`)}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition-colors"
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
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-3">
                  <Eye className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(totalViews)}</p>
                <p className="text-sm text-gray-500">Total Views</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center mb-3">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(totalFollowers)}</p>
                <p className="text-sm text-gray-500">Followers</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{totalChapters}</p>
                <p className="text-sm text-gray-500">Chapters</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{novels.length}</p>
                <p className="text-sm text-gray-500">Novels</p>
              </div>
            </div>

            {/* Views Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Monthly Views</h3>
              {stats.length > 0 ? (
                <div className="flex items-end gap-2 h-48">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-indigo-600 rounded-t-lg transition-all hover:bg-indigo-700"
                        style={{ height: `${(stat.views / Math.max(...stats.map(s => s.views))) * 100}%` }}
                      />
                      <span className="text-xs text-gray-500 mt-1">
                        {new Date(stat.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No data yet. Start publishing to see your stats!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Publishing Schedule</h3>
            <EmptyState 
              icon={Calendar}
              title="Schedule your chapters"
              description="Plan your releases to keep readers engaged"
            />
          </div>
        )}
      </div>
    </div>
  );
}
