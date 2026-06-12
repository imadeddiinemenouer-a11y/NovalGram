import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { getChapterById } from '../../utils/api';
import { calculateReadingTime } from '../../utils/helpers';
import CommentSection from './CommentSection';
import LoadingSpinner from '../common/LoadingSpinner';

const READER_THEMES: Record<string, { bg: string; fg: string }> = {
  dark: { bg: '#0f0f14', fg: '#e0dff0' },
  sepia: { bg: '#1a1305', fg: '#f0dfa0' },
  light: { bg: '#f2efe8', fg: '#1a1a26' },
  blue: { bg: '#10182a', fg: '#c8dff5' },
};

export default function ChapterReader() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { fontSize, setFontSize } = useTheme();
  const [chapter, setChapter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [readerTheme, setReaderTheme] = useState<'dark' | 'sepia' | 'light' | 'blue'>('dark');
  const [lineHeight, setLineHeight] = useState(2.0);
  const [progress, setProgress] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (chapterId) loadChapter(); }, [chapterId]);

  async function loadChapter() {
    try { setIsLoading(true); const data = await getChapterById(chapterId!); setChapter(data); } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }

  if (isLoading) return <LoadingSpinner className="min-h-screen" />;
  if (!chapter) return <div className="min-h-screen flex items-center justify-center text-[var(--muted)]">Chapter not found</div>;

  const themeStyle = READER_THEMES[readerTheme];

  return (
    <div className="min-h-screen bg-[var(--ink)] flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--ink)] border-b border-[var(--border)] flex-shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--ink2)] text-[var(--muted2)] active:bg-[var(--ink3)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate text-[#f0eff8]">{chapter.title}</h3>
          <p className="text-[10px] text-[var(--muted)]">Chapter {chapter.chapter_number} · {calculateReadingTime(chapter.word_count || 0)}</p>
        </div>
        <button onClick={() => setIsLiked(!isLiked)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--ink2)] text-[var(--muted2)] active:bg-[var(--ink3)]">
          <svg viewBox="0 0 24 24" width="16" height="16" fill={isLiked ? '#c4561a' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--ink2)] text-[var(--muted2)] active:bg-[var(--ink3)]">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        </button>
        <button onClick={() => setShowSettings(!showSettings)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--ink2)] text-[var(--muted2)] active:bg-[var(--ink3)]">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
        </button>
      </div>

      <div className="h-[1px] bg-[var(--ink3)] flex-shrink-0">
        <div className="h-full bg-[#f0eff8] transition-all" style={{ width: `${progress}%` }} />
      </div>

      {showSettings && (
        <div className="bg-[var(--ink2)] border-b border-[var(--border)] px-4 py-3 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--muted2)]">Font Size</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="w-7 h-7 rounded-md bg-[var(--ink3)] text-[#f0eff8] flex items-center justify-center text-sm">−</button>
              <span className="w-6 text-center text-xs text-[var(--muted2)]">{fontSize}</span>
              <button onClick={() => setFontSize(Math.min(26, fontSize + 2))} className="w-7 h-7 rounded-md bg-[var(--ink3)] text-[#f0eff8] flex items-center justify-center text-sm">+</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--muted2)]">Line Height</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setLineHeight(Math.max(1.4, +(lineHeight - 0.2).toFixed(1)))} className="w-7 h-7 rounded-md bg-[var(--ink3)] text-[#f0eff8] flex items-center justify-center text-sm">−</button>
              <span className="w-8 text-center text-xs text-[var(--muted2)]">{lineHeight.toFixed(1)}</span>
              <button onClick={() => setLineHeight(Math.min(3, +(lineHeight + 0.2).toFixed(1)))} className="w-7 h-7 rounded-md bg-[var(--ink3)] text-[#f0eff8] flex items-center justify-center text-sm">+</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--muted2)]">Theme</span>
            <div className="flex gap-2">
              {Object.keys(READER_THEMES).map(t => (
                <button
                  key={t}
                  onClick={() => setReaderTheme(t as any)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${readerTheme === t ? 'border-[#f0eff8]' : 'border-transparent'}`}
                  style={{ background: READER_THEMES[t].bg }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        ref={bodyRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          const pct = el.scrollHeight - el.clientHeight;
          setProgress(pct > 0 ? Math.min((el.scrollTop / pct) * 100, 100) : 0);
        }}
        className="flex-1 overflow-y-auto px-5 py-6 transition-colors duration-300"
        style={{ background: themeStyle.bg, color: themeStyle.fg }}
      >
        <h2 className="font-serif text-2xl font-bold mb-2 leading-tight text-[#f0eff8]">
          Chapter {chapter.chapter_number}: {chapter.title}
        </h2>
        <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)] mb-5 pb-4 border-b border-[var(--border)]">
          <span>✍️ {chapter.novel?.author || 'Unknown'}</span>
          <span>⏱️ {calculateReadingTime(chapter.word_count || 0)}</span>
        </div>
        <div className="font-serif text-lg leading-relaxed space-y-4" style={{ fontSize: `${fontSize}px`, lineHeight }}>
          {(chapter.content || 'This is mock chapter content.\n\nEnjoy reading!').split('\n\n').map((p: string, i: number) => (
            <p key={i} className="cursor-pointer rounded px-0.5 -mx-0.5 transition-colors active:bg-[var(--ink2)]">{p}</p>
          ))}
        </div>
        {showComments && (
          <div className="mt-8 pt-6 border-t border-[var(--border)]">
            <CommentSection chapterId={chapter.id} />
          </div>
        )}
      </div>

      <div className="flex gap-2 px-4 py-3 bg-[var(--ink)] border-t border-[var(--border)] flex-shrink-0">
        <button className="flex-1 py-2.5 rounded-md border border-[var(--border)] text-[var(--muted2)] text-sm font-semibold active:opacity-80">‹ Previous</button>
        <button className="flex-1 py-2.5 rounded-md bg-[#f0eff8] text-[var(--ink)] text-sm font-semibold active:opacity-80">Next ›</button>
      </div>
    </div>
  );
}