import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, XCircle, Clock, Bookmark, MoreVertical, Trash2, Star, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getLibrary, updateLibraryStatus, removeFromLibrary } from '../utils/api';
import { formatNumber, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import type { LibraryItem } from '../types';

const tabs = [
  { id: 'reading', label: 'Reading', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'dropped', label: 'Dropped', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'planned', label: 'Planned', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
];

export default function LibraryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [activeTab, setActiveTab] = useState('reading');
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadLibrary();
  }, [user]);

  async function loadLibrary() {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await getLibrary(user.id);
      setLibrary(data || []);
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(itemId: string, newStatus: string) {
    try {
      await updateLibraryStatus(itemId, newStatus);
      setLibrary(prev => prev.map(item =>
        item.id === itemId ? { ...item, status: newStatus as any } : item
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  async function handleRemove(itemId: string) {
    try {
      await removeFromLibrary(itemId);
      setLibrary(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from library:', error);
    }
  }

  const filteredItems = library.filter(item => item.status === activeTab);
  const tabCounts = tabs.reduce((acc, tab) => ({
    ...acc,
    [tab.id]: library.filter(item => item.status === tab.id).length
  }), {} as Record<string, number>);

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Sign in to view your library</h2>
          <p className="text-gray-500 mb-4">Keep track of your reading progress</p>
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
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header & Tabs */}
      <div className={`sticky top-14 z-30 shadow-sm ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">My Library</h1>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const count = tabCounts[tab.id] || 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : `${isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? '' : tab.color}`} />
                  {tab.label}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20 dark:bg-gray-900/20' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={tabs.find(t => t.id === activeTab)?.icon}
            title={`No ${activeTab} novels`}
            description={`Novels you mark as ${activeTab} will appear here`}
            action={
              activeTab === 'reading' && (
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Discover Novels
                </button>
              )
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const novel = item.novel;
              if (!novel) return null;

              const totalChapters = novel.word_count ? Math.ceil(novel.word_count / 2000) : 0;
              const progress = totalChapters > 0 ? Math.round((item.last_chapter_read / totalChapters) * 100) : 0;

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/novel/${novel.id}`)}
                  className={`relative flex gap-4 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md ${
                    isDark ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <img
                    src={novel.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop'}
                    alt={novel.title}
                    className="w-20 h-28 object-cover rounded-lg flex-shrink-0 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold truncate">{novel.title}</h3>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(showMenu === item.id ? null : item.id);
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        {showMenu === item.id && (
                          <div className={`absolute right-0 top-8 rounded-xl shadow-lg border py-2 z-10 w-48 ${
                            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                          }`}>
                            {tabs.filter(t => t.id !== item.status).map(tab => {
                              const TabIcon = tab.icon;
                              return (
                                <button
                                  key={tab.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(item.id, tab.id);
                                    setShowMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-sm"
                                >
                                  <TabIcon className={`w-4 h-4 ${tab.color}`} />
                                  Move to {tab.label}
                                </button>
                              );
                            })}
                            <hr className={`my-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(item.id);
                                setShowMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-left text-sm text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {novel.author?.display_name || novel.author?.username || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Chapter {item.last_chapter_read} of {totalChapters || '?'}
                    </p>

                    {/* Progress */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{progress}% completed</span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> {novel.rating || '0.0'}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {formatNumber(novel.views || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}