import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Eye, BookOpen, Clock } from 'lucide-react';
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
      className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl dark:hover:shadow-red-900/20 transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 hover:-translate-y-1"
    >
      {/* غلاف الرواية */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={novel.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop'}
          alt={novel.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* تدرج داكن أسفل الصورة */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* شارة الحالة */}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-md text-gray-900 dark:text-white px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize shadow-lg">
          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
            novel.status === 'ongoing' ? 'bg-green-500 animate-pulse' :
            novel.status === 'completed' ? 'bg-blue-500' :
            'bg-yellow-500'
          }`} />
          {novel.status}
        </div>

        {/* التصنيف في الأسفل */}
        {novel.genre?.[0] && (
          <div className="absolute bottom-3 left-3 bg-indigo-600/90 dark:bg-red-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-medium">
            {novel.genre[0]}
          </div>
        )}
      </div>

      {/* تفاصيل الرواية */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1 group-hover:text-indigo-600 dark:group-hover:text-red-400 transition-colors leading-tight">
          {novel.title}
        </h3>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
          {novel.author?.display_name || novel.author?.username || 'Unknown'}
        </p>

        {/* شريط التقدم (إن وجد) */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 mb-3">
          <div
            className="bg-indigo-500 dark:bg-red-500 h-1 rounded-full transition-all"
            style={{ width: `${Math.min(40, 100)}%` }}
          />
        </div>

        {/* الإحصائيات */}
        <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">{novel.rating || '0.0'}</span>
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