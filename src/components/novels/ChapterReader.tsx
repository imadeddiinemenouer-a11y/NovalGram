import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, MessageCircle, Heart, Share2,
  Settings, BookOpen, ArrowLeft, X, Sun, Moon, BookMarked
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getChapterById, addToLibrary } from '../../utils/api';
import { calculateReadingTime } from '../../utils/helpers';
import CommentSection from './CommentSection';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Chapter } from '../../types';

const themes = {
  light: { bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200', btn: 'bg-gray-200 hover:bg-gray-300' },
  dark: { bg: 'bg-gray-950', text: 'text-gray-100', border: 'border-gray-800', btn: 'bg-gray-800 hover:bg-gray-700' },
  sepia: { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200', btn: 'bg-amber-200 hover:bg-amber-300' },
};

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
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentTheme = themes[theme];

  useEffect(() => {
    if (chapterId) loadChapter();
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const totalScroll = contentRef.current.offsetTop + contentRef.current.scrollHeight - window.innerHeight;
        const progress = Math.min((window.scrollY / totalScroll) * 100, 100);
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} transition-colors`}>
      {/* شريط التقدم العلوي */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-gray-300 dark:bg-gray-700">
        <div className="h-full bg-indigo-600 dark:bg-red-500 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* شريط الأدوات العلوي */}
      <div className={`sticky top-0 z-20 backdrop-blur-md bg-opacity-90 border-b ${currentTheme.border}`}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(`/novel/${chapter.novel_id}`)} className="p-2 hover:bg-gray-200/20 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1 mx-4">
            <h2 className="font-medium text-sm truncate">{chapter.title}</h2>
            <p className="text-xs opacity-70">{readingTime} read · Ch. {chapter.chapter_number}</p>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-gray-200/20 rounded-full">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* لوحة الإعدادات */}
      {showSettings && (
        <div className={`max-w-3xl mx-auto px-4 py-4 border-b ${currentTheme.border} ${currentTheme.bg}`}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium w-24">Font Size</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className={`px-3 py-1 rounded-lg ${currentTheme.btn}`}>A-</button>
                <span className="w-8 text-center font-mono">{fontSize}</span>
                <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} className={`px-3 py-1 rounded-lg ${currentTheme.btn}`}>A+</button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium w-24">Theme</span>
              <div className="flex gap-2">
                {(['light', 'dark', 'sepia'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-4 py-2 rounded-lg capitalize transition-all ${
                      theme === t ? 'bg-indigo-600 text-white' : currentTheme.btn
                    }`}
                  >
                    {t === 'light' && <Sun className="w-4 h-4 inline mr-1" />}
                    {t === 'dark' && <Moon className="w-4 h-4 inline mr-1" />}
                    {t === 'sepia' && <BookMarked className="w-4 h-4 inline mr-1" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* محتوى الفصل */}
      <div className="max-w-3xl mx-auto px-4 py-8" ref={contentRef}>
        <h1 className="text-3xl font-bold mb-2 leading-tight">{chapter.title}</h1>
        <p className="text-sm opacity-60 mb-12">Chapter {chapter.chapter_number}</p>

        <div
          className="leading-relaxed space-y-5 font-serif"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.9' }}
        >
          {chapter.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="indent-6 text-justify">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      </div>

      {/* شريط التنقل السفلي */}
      <div className={`max-w-3xl mx-auto px-4 py-8 border-t ${currentTheme.border}`}>
        <div className="flex items-center justify-between mb-8">
          <button
            disabled={chapter.chapter_number <= 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${currentTheme.btn} disabled:opacity-40`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm opacity-70">Ch. {chapter.chapter_number}</span>
          <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${currentTheme.btn}`}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* أزرار التفاعل */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all ${
              isLiked ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' : currentTheme.btn
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-600 dark:fill-pink-400' : ''}`} />
            {isLiked ? 'Liked' : 'Like'}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all ${
              showComments ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : currentTheme.btn
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Comments
          </button>
          <button
            onClick={handleAddToLibrary}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all ${
              isInLibrary ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : currentTheme.btn
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {isInLibrary ? 'In Library' : 'Save'}
          </button>
        </div>
      </div>

      {/* قسم التعليقات */}
      {showComments && (
        <div className={`max-w-3xl mx-auto px-4 py-8 border-t ${currentTheme.border}`}>
          <CommentSection chapterId={chapter.id} />
        </div>
      )}
    </div>
  );
}