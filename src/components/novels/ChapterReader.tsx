import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { getChapterById } from '../../utils/api';
import { calculateReadingTime } from '../../utils/helpers';
import CommentSection from './CommentSection';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Chapter } from '../../types';

const READER_THEMES: Record<string, { bg: string; fg: string }> = {
  dark: { bg: '#05050a', fg: '#f9fafb' },
  sepia: { bg: '#1a1305', fg: '#fde68a' },
  light: { bg: '#f5f0e8', fg: '#1f2937' },
  blue: { bg: '#0c1a2e', fg: '#bae6fd' },
};

export default function ChapterReader() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { fontSize, setFontSize } = useTheme();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [readerTheme, setReaderTheme] = useState<'dark' | 'sepia' | 'light' | 'blue'>('dark');
  const [lineHeight, setLineHeight] = useState(2.0);
  const [progress, setProgress] = useState(0);

  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chapterId) loadChapter();
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

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const pct = el.scrollHeight - el.clientHeight;
    if (pct > 0) {
      setProgress(Math.min((el.scrollTop / pct) * 100, 100));
    }
  }

  const themeStyle = READER_THEMES[readerTheme];

  if (isLoading) return <LoadingSpinner className="min-h-screen" />;
  if (!chapter) return <div className="min-h-screen flex items-center justify-center text-[var(--txt3)]">Chapter not found</div>;

  return (
    <div className="min-h-screen bg-[var(--void)] text-[var(--txt)] flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--void)]/95 backdrop-blur-2xl border-b border-[var(--b2)] flex-shrink-0 z-20">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface2)] text-[var(--txt2)] hover:text-[var(--txt)] transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold truncate">{chapter.title}</h3>
          <p className="text-[10px] text-[var(--txt3)]">Chapter {chapter.chapter_number} · {calculateReadingTime(chapter.word_count || 0)}</p>
        </div>
        <button onClick={() => setIsLiked(!isLiked)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface2)] text-[var(--txt2)] hover:text-[var(--txt)] transition-colors">
          <svg viewBox="0 0 24 24" width="16" height="16" fill={isLiked ? '#db2777' : 'none'} stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface2)] text-[var(--txt2)] hover:text-[var(--txt)] transition-colors">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
        <button onClick={() => setShowSettings(!showSettings)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface2)] text-[var(--txt2)] hover:text-[var(--txt)] transition-colors">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>

      <div className="h-0.5 bg-[var(--surface3)] flex-shrink-0">
        <div className="h-full bg-gradient-to-r from-[var(--v)] to-[var(--mg)] transition-all" style={{ width: `${progress}%` }} />
      </div>

      {showSettings && (
        <div className="bg-[var(--surface2)] border-b border-[var(--b2)] px-4 py-3 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--txt2)]">Font Size</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="w-7 h-7 rounded-lg bg-[var(--surface3)] text-[var(--txt)] flex items-center justify-center text-sm">−</button>
              <span className="w-6 text-center text-xs text-[var(--txt3)]">{fontSize}</span>
              <button onClick={() => setFontSize(Math.min(26, fontSize + 2))} className="w-7 h-7 rounded-lg bg-[var(--surface3)] text-[var(--txt)] flex items-center justify-center text-sm">+</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--txt2)]">Line Height</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setLineHeight(Math.max(1.4, +(lineHeight - 0.2).toFixed(1)))} className="w-7 h-7 rounded-lg bg-[var(--surface3)] text-[var(--txt)] flex items-center justify-center text-sm">−</button>
              <span className="w-8 text-center text-xs text-[var(--txt3)]">{lineHeight.toFixed(1)}</span>
              <button onClick={() => setLineHeight(Math.min(3, +(lineHeight + 0.2).toFixed(1)))} className="w-7 h-7 rounded-lg bg-[var(--surface3)] text-[var(--txt)] flex items-center justify-center text-sm">+</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--txt2)]">Theme</span>
            <div className="flex gap-2">
              {Object.keys(READER_THEMES).map((t) => (
                <button
                  key={t}
                  onClick={() => setReaderTheme(t as any)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${readerTheme === t ? 'border-[var(--vb)]' : 'border-transparent'}`}
                  style={{ background: READER_THEMES[t].bg }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        ref={bodyRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-5 py-6 transition-colors duration-300"
        style={{ background: themeStyle.bg, color: themeStyle.fg }}
      >
        <h2 className="font-serif text-2xl font-bold mb-2 leading-tight">
          <span className="bg-gradient-to-r from-[var(--vb)] to-[var(--mg)] bg-clip-text text-transparent">
            Chapter {chapter.chapter_number}: {chapter.title}
          </span>
        </h2>
        <div className="flex flex-wrap gap-3 text-xs text-[var(--txt3)] mb-5 pb-4 border-b border-[var(--b2)]">
          <span>✍️ {chapter.novel?.author || 'Unknown'}</span>
          <span>⏱️ {calculateReadingTime(chapter.word_count || 0)}</span>
          <span>👁️ {chapter.views || 0} views</span>
        </div>
        <div className="font-serif text-lg leading-relaxed space-y-4" style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}>
          {(chapter.content || 'This is mock chapter content.\n\nIt has multiple paragraphs.\n\nEnjoy reading!').split('\n\n').map((paragraph, i) => (
            <p key={i} className="cursor-pointer rounded-md px-0.5 -mx-0.5 transition-colors hover:bg-[var(--b1)]">{paragraph}</p>
          ))}
        </div>
        {showComments && (
          <div className="mt-8 pt-6 border-t border-[var(--b2)]">
            <CommentSection chapterId={chapter.id} />
          </div>
        )}
      </div>

      <div className="flex gap-2 px-4 py-3 bg-[var(--void)]/95 backdrop-blur-2xl border-t border-[var(--b2)] flex-shrink-0 z-20">
        <button className="flex-1 py-2.5 rounded-lg bg-[var(--surface3)] text-[var(--txt2)] text-sm font-bold hover:bg-[var(--surface2)] transition-colors">‹ Previous</button>
        <button className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[var(--v)] to-[var(--mg)] text-white text-sm font-bold shadow-lg shadow-[var(--v)]/30">Next ›</button>
      </div>
    </div>
  );
}