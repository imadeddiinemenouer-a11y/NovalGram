import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MessageCircle, Heart, Share2, Settings, BookOpen, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getChapterById, addToLibrary } from '../../utils/api';
import { calculateReadingTime } from '../../utils/helpers';
import CommentSection from './CommentSection';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Chapter } from '../../types';

export default function ChapterReader() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  const { user } = useAuth();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const themes = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-amber-50 text-amber-900'
  };

  useEffect(() => {
    if (chapterId) {
      loadChapter();
    }
  }, [chapterId]);

  async function loadChapter() {
    try {
      setIsLoading(true);
      const data = await getChapterById(chapterId!);
      setChapter(data);
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddToLibrary() {
    if (!user || !chapter) return;
    try {
      await addToLibrary(user.id, chapter.novel_id);
      setIsInLibrary(true);
    } catch (error) {
      console.error('Error adding to library:', error);
    }
  }

  if (isLoading) return <LoadingSpinner className="min-h-screen" />;
  if (!chapter) return <div className="min-h-screen flex items-center justify-center">Chapter not found</div>;

  const readingTime = calculateReadingTime(chapter.word_count || 0);

  return (
    <div className={`min-h-screen ${themes[theme]} transition-colors`}>
      {/* Top Bar */}
      <div className={`sticky top-0 z-20 backdrop-blur-md bg-opacity-90 border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate(`/novel/${chapter.novel_id}`)}
            className="p-2 hover:bg-gray-200/20 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1 mx-4">
            <h2 className="font-medium text-sm truncate">{chapter.title}</h2>
            <p className="text-xs text-gray-500">{readingTime} read</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-200/20 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`max-w-3xl mx-auto px-4 py-4 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium w-20">Font Size:</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                  className={`px-3 py-1 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >A-</button>
                <span className="w-8 text-center">{fontSize}</span>
                <button 
                  onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                  className={`px-3 py-1 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >A+</button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium w-20">Theme:</span>
              <div className="flex gap-2">
                {(['light', 'dark', 'sepia'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-4 py-2 rounded-lg capitalize transition-all ${
                      theme === t ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Content */}
      <div className="max-w-3xl mx-auto px-4 py-8" ref={contentRef}>
        <h1 className="text-2xl font-bold mb-2">{chapter.title}</h1>
        <p className="text-sm text-gray-500 mb-8">Chapter {chapter.chapter_number}</p>

        <div 
          className="leading-relaxed space-y-6"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
        >
          {chapter.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-justify indent-8">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      </div>

      {/* Chapter Navigation */}
      <div className={`max-w-3xl mx-auto px-4 py-8 border-t ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <button 
            disabled={chapter.chapter_number <= 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <div className="text-center">
            <span className="text-sm text-gray-500">Ch. {chapter.chapter_number}</span>
          </div>
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
              isLiked ? 'bg-pink-100 text-pink-600' : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-pink-600' : ''}`} />
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Comments</span>
          </button>
          <button 
            onClick={handleAddToLibrary}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
              isInLibrary ? 'bg-green-100 text-green-600' : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>{isInLibrary ? 'In Library' : 'Add to Library'}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className={`max-w-3xl mx-auto px-4 py-8 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <CommentSection chapterId={chapter.id} />
        </div>
      )}
    </div>
  );
}
