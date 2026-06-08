import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, BookOpen, Eye, MessageCircle, Share2, ChevronRight, Clock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

  const [novel, setNovel] = useState<Novel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);

  useEffect(() => {
    if (id) {
      loadNovel();
    }
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
    try {
      if (isFollowing) {
        await unfollowNovel(user.id, novel.id);
        setIsFollowing(false);
      } else {
        await followNovel(user.id, novel.id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  }

  async function handleAddToLibrary() {
    if (!user || !novel) return;
    try {
      await addToLibrary(user.id, novel.id, 'reading');
      setIsInLibrary(true);
    } catch (error) {
      console.error('Error adding to library:', error);
    }
  }

  async function handleRate(rating: number) {
    if (!user || !novel) return;
    try {
      await rateNovel(user.id, novel.id, rating);
      setUserRating(rating);
      setShowRating(false);
      loadNovel(); // Refresh to update average
    } catch (error) {
      console.error('Error rating:', error);
    }
  }

  if (isLoading) return <LoadingSpinner className="min-h-screen" />;
  if (!novel) return <div className="min-h-screen flex items-center justify-center">Novel not found</div>;

  const chapters = novel.chapters || [];
  const displayedChapters = showAllChapters ? chapters : chapters.slice(0, 5);
  const totalChapters = chapters.length;
  const readingTime = calculateReadingTime(novel.word_count || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Novel Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Cover */}
            <div className="w-40 h-56 flex-shrink-0">
              <img 
                src={novel.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop'}
                alt={novel.title}
                className="w-full h-full object-cover rounded-xl shadow-md"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{novel.title}</h1>
                  <div className="flex items-center gap-2 mb-3">
                    <button 
                      onClick={() => navigate(`/author/${novel.author_id}`)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      {novel.author?.display_name || novel.author?.username || 'Unknown'}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowRating(!showRating)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Star className={`w-5 h-5 ${userRating > 0 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Share2 className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Rating Display */}
              {showRating && (
                <div className="bg-gray-50 rounded-xl p-3 mb-3 flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rate this novel:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= userRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {novel.rating || '0.0'} ({novel.total_ratings || 0} ratings)
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatNumber(novel.views || 0)} views
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {totalChapters} chapters
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {readingTime}
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-4">
                {novel.genre?.map((g) => (
                  <span key={g} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                    {g}
                  </span>
                ))}
                <span className={`px-3 py-1 rounded-full text-sm capitalize ${
                  novel.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                  novel.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  novel.status === 'hiatus' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {novel.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{novel.description || 'No description available.'}</p>

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={handleFollow}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                    isFollowing 
                      ? 'bg-pink-100 text-pink-700 hover:bg-pink-200' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFollowing ? 'fill-pink-700' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button 
                  onClick={handleAddToLibrary}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                    isInLibrary 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  {isInLibrary ? 'In Library' : 'Add to Library'}
                </button>
                {chapters.length > 0 && (
                  <button 
                    onClick={() => navigate(`/chapter/${chapters[0].id}`)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                  >
                    Read Now
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters & Comments */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chapters List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-lg">Chapters</h2>
                <span className="text-sm text-gray-500">{totalChapters} total</span>
              </div>

              {chapters.length === 0 ? (
                <EmptyState 
                  icon={BookOpen}
                  title="No chapters yet"
                  description="This novel hasn't published any chapters"
                />
              ) : (
                <div className="divide-y divide-gray-100">
                  {displayedChapters.map((chapter: Chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => navigate(`/chapter/${chapter.id}`)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                          {chapter.chapter_number}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{chapter.title}</p>
                          <p className="text-sm text-gray-500">
                            {calculateReadingTime(chapter.word_count || 0)} • {formatDate(chapter.published_at || chapter.created_at)}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}

                  {chapters.length > 5 && !showAllChapters && (
                    <button
                      onClick={() => setShowAllChapters(true)}
                      className="w-full py-3 text-center text-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
                    >
                      Show all {totalChapters} chapters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="bg-white rounded-xl shadow-sm mt-6 p-4">
              <h2 className="font-semibold text-lg mb-4">Reviews & Comments</h2>
              <CommentSection chapterId={chapters[0]?.id || ''} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Author Card */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">About the Author</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                  {novel.author?.display_name?.[0] || novel.author?.username?.[0] || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{novel.author?.display_name || novel.author?.username || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{novel.author?.bio || 'No bio'}</p>
                </div>
              </div>
            </div>

            {/* More Info */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">Novel Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="capitalize font-medium">{novel.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Chapters</span>
                  <span className="font-medium">{totalChapters}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Words</span>
                  <span className="font-medium">{formatNumber(novel.word_count || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Updated</span>
                  <span className="font-medium">{formatDate(novel.updated_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Published</span>
                  <span className="font-medium">{formatDate(novel.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
