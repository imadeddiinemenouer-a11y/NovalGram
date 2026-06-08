import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, BookOpen, Eye, Share2, ChevronRight, Clock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getNovelById, addToLibrary, followNovel, unfollowNovel, isFollowingNovel, rateNovel } from '../utils/api';
import { formatNumber, formatDate, calculateReadingTime } from '../utils/helpers';
import CommentSection from '../components/novels/CommentSection';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import type { Novel, Chapter } from '../types';

export default function NovelPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [novel, setNovel] = useState<Novel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);

  useEffect(() => {
    if (id) loadNovel();
  }, [id]);

  async function loadNovel() {
    try {
      setIsLoading(true);
      const data = await getNovelById(id!);
      setNovel(data);
      if (user) {
        const following = await isFollowingNovel(user.id, id!);
        setIsFollowing(following);
      }
    } catch (error) {
      console.error('Error loading novel:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFollow() {
    if (!user || !novel) return;
    if (isFollowing) {
      await unfollowNovel(user.id, novel.id);
      setIsFollowing(false);
    } else {
      await followNovel(user.id, novel.id);
      setIsFollowing(true);
    }
  }

  async function handleAddToLibrary() {
    if (!user || !novel) return;
    await addToLibrary(user.id, novel.id, 'reading');
    setIsInLibrary(true);
  }

  async function handleRate(rating: number) {
    if (!user || !novel) return;
    await rateNovel(user.id, novel.id, rating);
    setUserRating(rating);
    setShowRating(false);
    loadNovel();
  }

  if (isLoading) return <LoadingSpinner className="min-h-screen" />;
  if (!novel) return <div className="min-h-screen flex items-center justify-center">Novel not found</div>;

  const chapters = novel.chapters || [];
  const displayedChapters = showAllChapters ? chapters : chapters.slice(0, 5);
  const totalChapters = chapters.length;
  const readingTime = calculateReadingTime(novel.word_count || 0);

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* غلاف و معلومات الرواية */}
      <div className={`relative ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-sm border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* الغلاف */}
            <div className="w-40 h-56 flex-shrink-0 mx-auto sm:mx-0 rounded-xl overflow-hidden shadow-lg">
              <img
                src={novel.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop'}
                alt={novel.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* المعلومات */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold mb-2">{novel.title}</h1>
              <button
                onClick={() => navigate(`/author/${novel.author_id}`)}
                className={`flex items-center justify-center sm:justify-start gap-1 text-sm mb-3 ${
                  isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-indigo-600'
                }`}
              >
                <User className="w-4 h-4" />
                {novel.author?.display_name || novel.author?.username || 'Unknown'}
              </button>

              {/* الإحصائيات */}
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-sm mb-4">
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {novel.rating || '0.0'} ({novel.total_ratings || 0})</span>
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {formatNumber(novel.views || 0)}</span>
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {totalChapters} ch</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {readingTime}</span>
              </div>

              {/* الأنواع و الحالة */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                {novel.genre?.map(g => (
                  <span key={g} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">{g}</span>
                ))}
                <span className={`px-3 py-1 rounded-full text-sm capitalize ${
                  novel.status === 'ongoing' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  novel.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                  novel.status === 'hiatus' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {novel.status}
                </span>
              </div>

              {/* الوصف */}
              <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {novel.description || 'No description available.'}
              </p>

              {/* أزرار التفاعل */}
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <button
                  onClick={handleFollow}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                    isFollowing
                      ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFollowing ? 'fill-pink-700 dark:fill-pink-300' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={handleAddToLibrary}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                    isInLibrary
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : `${isDark ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  {isInLibrary ? 'In Library' : 'Add to Library'}
                </button>
                {chapters.length > 0 && (
                  <button
                    onClick={() => navigate(`/chapter/${chapters[0].id}`)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
                  >
                    Read Now <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setShowRating(!showRating)} className="p-2.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  <Star className={`w-5 h-5 ${userRating > 0 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                </button>
              </div>

              {showRating && (
                <div className={`mt-3 p-3 rounded-xl flex items-center gap-2 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <span className="text-sm">Rate:</span>
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => handleRate(star)} className="p-1 hover:scale-110">
                      <Star className={`w-6 h-6 ${star <= userRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* قائمة الفصول و التعليقات */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* الفصول */}
          <div className="lg:col-span-2">
            <div className={`rounded-xl shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
              <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'} flex justify-between items-center`}>
                <h2 className="text-lg font-semibold">Chapters</h2>
                <span className="text-sm opacity-70">{totalChapters} total</span>
              </div>
              {chapters.length === 0 ? (
                <EmptyState icon={BookOpen} title="No chapters yet" description="This novel hasn't published any chapters" />
              ) : (
                <div className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-100'}`}>
                  {displayedChapters.map((chapter: Chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => navigate(`/chapter/${chapter.id}`)}
                      className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                        isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                          isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {chapter.chapter_number}
                        </span>
                        <div>
                          <p className="font-medium">{chapter.title}</p>
                          <p className="text-sm opacity-60">
                            {calculateReadingTime(chapter.word_count || 0)} · {formatDate(chapter.published_at || chapter.created_at)}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                  ))}
                  {chapters.length > 5 && !showAllChapters && (
                    <button
                      onClick={() => setShowAllChapters(true)}
                      className="w-full py-3 text-center text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                      Show all {totalChapters} chapters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* التعليقات */}
            <div className={`mt-8 p-4 rounded-xl shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
              <h2 className="text-lg font-semibold mb-4">Reviews & Comments</h2>
              <CommentSection chapterId={chapters[0]?.id || ''} />
            </div>
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-4">
            {/* كاتب الرواية */}
            <div className={`p-4 rounded-xl shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
              <h3 className="font-semibold text-sm mb-3">About the Author</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
                  {novel.author?.display_name?.[0] || novel.author?.username?.[0] || 'U'}
                </div>
                <div>
                  <p className="font-medium">{novel.author?.display_name || novel.author?.username || 'Unknown'}</p>
                  <p className="text-sm opacity-60">{novel.author?.bio || 'No bio'}</p>
                </div>
              </div>
            </div>

            {/* معلومات الرواية */}
            <div className={`p-4 rounded-xl shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
              <h3 className="font-semibold text-sm mb-3">Novel Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="opacity-60">Status</span><span className="capitalize font-medium">{novel.status}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Chapters</span><span className="font-medium">{totalChapters}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Words</span><span className="font-medium">{formatNumber(novel.word_count || 0)}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Updated</span><span className="font-medium">{formatDate(novel.updated_at)}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Published</span><span className="font-medium">{formatDate(novel.created_at)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}