import React from 'react';
import { TrendingUp, Clock, Star, BookOpen, Filter } from 'lucide-react';
import { GENRES } from '../../utils/helpers';

interface NovelFilterProps {
  activeFilter: string;
  activeGenre: string;
  onFilterChange: (filter: string) => void;
  onGenreChange: (genre: string) => void;
}

const filters = [
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'new', label: 'New', icon: Clock },
  { id: 'popular', label: 'Popular', icon: Star },
  { id: 'completed', label: 'Completed', icon: BookOpen },
];

export default function NovelFilter({ 
  activeFilter, 
  activeGenre, 
  onFilterChange, 
  onGenreChange 
}: NovelFilterProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              activeFilter === f.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <f.icon className="w-4 h-4" />
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => onGenreChange('all')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all ${
            activeGenre === 'all'
              ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
          }`}
        >
          All
        </button>
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => onGenreChange(g)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all ${
              activeGenre === g
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}
