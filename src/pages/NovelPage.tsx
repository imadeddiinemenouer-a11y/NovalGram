import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, BookOpen, Eye, Share2, ChevronRight, Clock, User, Bookmark } from 'lucide-react';
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
  if (!novel) return <div className="min-h-screen flex items-center justify-center text-[var(--txt3)]">Novel not found</div>;

  const chapters = novel.chapters || [];
  const displayedChapters = showAllChapters ? chapters : chapters.slice(0, 8);
  const totalChapters = chapters.length;
  const readingTime = calculateReadingTime(novel.word_count || 0);
  const coverColor1 = (novel as any).c1 || '#6d28d9';
  const coverColor2 = (novel as any).c2 || '#db2777';

  return (
    <div className="min-h-screen bg-[var(--void)] text-[var(--txt)] transition-colors">
      <div
        className="relative h-60 flex items-center justify-center text-8xl flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${coverColor1}55, ${coverColor2}22)` }}
      >
        <div style={{ filter: `drop-shadow(0 0 20px ${coverColor1})` }}>
          {(novel as any).emoji || '📖'}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface2)] text-[var(--txt2)] hover:text-[var(--txt)] transition-colors z-10"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button onClick={() => setShowRating(!showRating)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface2)] text-[var(--txt2)] hover:text-[var(--txt)] transition-colors">
            <Star className={`w-4 h-4 ${userRating > 0 ? 'text-yellow-500 fill-yellow-500' : ''}`} />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface2)] text-[var(--txt2)] hover:text-[var(--txt)] transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--void)] via-transparent to-transparent" />
      </div>

      <div className="px-4 -mt-6 relative z-10">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[var(--b1)] text-[var(--vl)] mb-2">
          {novel.genre?.[0] || 'Fantasy'}
        </span>
        <h1 className="font-serif text-3xl font-bold leading-tight mb-2">{novel.title}</h1>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `linear-gradient(135deg, ${coverColor1}44, ${coverColor2}22)` }}>
            {novel.author?.display_name?.[0] || novel.author?.username?.[0] || '?'}
          </div>
          <div className="flex-1">
            <span className="text-sm font-semibold">{novel.author?.display_name || novel.author?.username || 'Unknown'}</span>
            {(novel.author as any)?.verified && <span className="text-[var(--teal)] text-xs ml-1">✓ Verified</span>}
          </div>
          <button
            onClick={handleFollow}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              isFollowing ? 'bg-[var(--v)] border-[var(--v)] text-white' : 'border-[var(--v)] text-[var(--vb)] hover:bg-[var(--v)] hover:text-white'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-0 bg-[var(--surface)] rounded-2xl border border-[var(--b2)] overflow-hidden mb-4">
          {[
            { value: novel.views ? formatNumber(novel.views) : '0', label: 'Reads' },
            { value: novel.likes ? formatNumber(novel.likes) : '0', label: 'Likes' },
            { value: totalChapters, label: 'Chapters' },
            { value: `${novel.rating || '0.0'}⭐`, label: 'Rating' },
          ].map((stat, i) => (
            <div key={i} className="flex-1 py-3 text-center border-r border-[var(--b2)] last:border-r-0">
              <div className="text-sm font-bold">{stat.value}</div>
              <div className="text-[10px] text-[var(--txt3)] mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        <p className="text-sm text-[var(--txt2)] leading-relaxed mb-4">
          {novel.description || (novel as any).desc || 'No description available.'}
        </p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={handleAddToLibrary}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
              isInLibrary ? 'bg-[var(--v)] border-[var(--v)] text-white' : 'border-[var(--b2)] text-[var(--txt2)] hover:border-[var(--vb)]'
            }`}
          >
            <Bookmark className="w-4 h-4 inline mr-1" />
            {isInLibrary ? 'Saved' : 'Add to Library'}
          </button>
          {chapters.length > 0 && (
            <button
              onClick={() => navigate(`/chapter/${chapters[0].id}`)}
              className="flex-[2] py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[var(--v)] to-[var(--mg)] shadow-lg shadow-[var(--v)]/30"
            >
              📖 {(novel as any).progress > 0 ? `Continue (${(novel as any).progress}%)` : 'Start Reading'}
            </button>
          )}
        </div>

        {showRating && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-[var(--surface2)]">
            <span className="text-sm text-[var(--txt2)]">Rate:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => handleRate(star)} className="p-1 hover:scale-110 transition-transform">
                <Star className={`w-6 h-6 ${star <= userRating ? 'text-yellow-500 fill-yellow-500' : 'text-[var(--txt3)]'}`} />
              </button>
            ))}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-sm font-bold text-[var(--txt3)] uppercase tracking-wider mb-3">Chapters ({totalChapters})</h2>
          {chapters.length === 0 ? (
            <EmptyState icon={BookOpen} title="No chapters yet" description="This novel hasn't published any chapters" />
          ) : (
            <div className="space-y-1.5">
              {displayedChapters.map((chapter: Chapter, i: number) => (
                <button
                  key={chapter.id}
                  onClick={() => navigate(`/chapter/${chapter.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--b2)] hover:border-[var(--b1)] transition-all"
                >
                  <span className="text-xs font-bold text-[var(--txt3)] w-6 flex-shrink-0">Ch.{chapter.chapter_number}</span>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-semibold truncate">{chapter.title}</div>
                    <div className="text-[10px] text-[var(--txt3)]">{chapter.word_count?.toLocaleString() || '~2000'} words</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--txt3)]" />
                </button>
              ))}
              {chapters.length > 8 && !showAllChapters && (
                <button onClick={() => setShowAllChapters(true)} className="w-full py-2.5 text-center text-sm font-semibold text-[var(--vb)] hover:underline">
                  View all {totalChapters} chapters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold text-[var(--txt3)] uppercase tracking-wider mb-4">Reviews & Comments</h2>
          <CommentSection chapterId={chapters[0]?.id || ''} />
        </div>
      </div>
    </div>
  );
}