import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Novel } from '../../types';

interface NovelCardProps { novel: Novel; }

export default function NovelCard({ novel }: NovelCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/novel/${novel.id}`)}
      className="flex gap-3 p-3 mx-3 my-1.5 bg-[var(--ink2)] border border-[var(--border)] rounded-xl cursor-pointer transition-transform active:scale-[0.98]"
    >
      <div className="w-[66px] h-[88px] rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center text-3xl bg-[var(--ink3)]">
        {novel.cover_image ? (
          <img src={novel.cover_image} alt={novel.title} className="w-full h-full object-cover" />
        ) : (
          <span>📖</span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--ink3)] text-[var(--muted2)] uppercase tracking-wider w-fit mb-1.5">
          {novel.genre?.[0] || 'Fantasy'}
        </span>
        <h3 className="font-serif text-[15px] font-semibold leading-tight mb-0.5 text-[#f0eff8] line-clamp-2">
          {novel.title}
        </h3>
        <p className="text-[11px] text-[var(--muted)] mb-auto">
          {novel.author?.display_name || novel.author?.username || 'Unknown'}
        </p>
        <p className="text-xs text-[var(--muted2)] leading-relaxed line-clamp-2 my-1.5 flex-1">
          {novel.description || ''}
        </p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2 text-[10px] text-[var(--muted)]">
            <span>👁 {novel.views ? (novel.views > 1000 ? (novel.views / 1000).toFixed(1) + 'K' : novel.views) : '0'}</span>
            <span>❤ {novel.total_ratings || 0}</span>
            <span>📑 {novel.chapters?.length || 0} ch</span>
          </div>
        </div>
      </div>
    </div>
  );
}