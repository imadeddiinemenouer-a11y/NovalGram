import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Eye, BookOpen } from 'lucide-react';
import { formatNumber } from '../../utils/helpers';
import type { Novel } from '../../types';

interface NovelCardProps {
  novel: Novel;
}

export default function NovelCard({ novel }: NovelCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/novel/${novel.id}`)}
      className="card flex gap-3 p-3 cursor-pointer group"
    >
      {/* Cover */}
      <div
        className="w-[70px] h-[94px] rounded-lg flex-shrink-0 overflow-hidden relative flex items-center justify-center text-4xl"
        style={{
          background: `linear-gradient(135deg, ${(novel as any).c1 || '#6d28d9'}55, ${(novel as any).c2 || '#db2777'}22)`,
        }}
      >
        {novel.cover_image ? (
          <img src={novel.cover_image} alt={novel.title} className="w-full h-full object-cover" />
        ) : (
          <span>{(novel as any).emoji || '📖'}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--b1)] text-[var(--vb)] w-fit mb-1.5">
          {novel.genre?.[0] || 'Fantasy'}
        </span>

        <h3 className="font-serif text-base font-semibold leading-tight mb-1 group-hover:text-[var(--vb)] transition-colors line-clamp-2">
          {novel.title}
        </h3>

        <p className="text-xs text-[var(--txt3)] mb-auto flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {novel.author?.display_name || novel.author?.username || 'Unknown'}
        </p>

        <p className="text-xs text-[var(--txt2)] leading-relaxed line-clamp-2 my-1.5 flex-1">
          {(novel as any).excerpt || novel.description || ''}
        </p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-3 text-[10px] text-[var(--txt3)]">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {novel.rating || '0.0'}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> {novel.word_count ? formatNumber(novel.word_count) : '0'}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {formatNumber(novel.views || 0)}
            </span>
          </div>

          {(novel as any).progress > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="w-11 h-1 bg-[var(--surface3)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--v)] to-[var(--mg)] rounded-full"
                  style={{ width: `${Math.min((novel as any).progress || 0, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-[var(--txt3)]">{(novel as any).progress || 0}%</span>
            </div>
          ) : (
            <span className="text-[11px] font-semibold text-[var(--vb)]">Start reading</span>
          )}
        </div>
      </div>
    </div>
  );
}