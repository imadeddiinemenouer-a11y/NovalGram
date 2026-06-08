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
      className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={novel.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop'} 
          alt={novel.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium">
          {novel.status}
        </div>
        {novel.genre?.[0] && (
          <div className="absolute bottom-2 left-2 bg-indigo-600/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs">
            {novel.genre[0]}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
          {novel.title}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{novel.author?.display_name || novel.author?.username || 'Unknown'}</p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{novel.rating || '0.0'}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>{novel.word_count ? formatNumber(novel.word_count) : '0'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{formatNumber(novel.views || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
