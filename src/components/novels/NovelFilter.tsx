import React from 'react';
import { TrendingUp, Clock, Star, BookOpen, Filter } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-4">
      {/* Filter Row */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {filters.map((f) => {
          const Icon = f.icon;
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 dark:bg-red-600 text-white shadow-lg shadow-indigo-500/30 dark:shadow-red-500/30'
                  : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Genre Row */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => onGenreChange('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
            activeGenre === 'all'
              ? 'bg-indigo-100 dark:bg-red-900/30 text-indigo-700 dark:text-red-300 border-indigo-300 dark:border-red-700'
              : isDark
                ? 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
          }`}
        >
          All Genres
        </button>
        {GENRES.map((g) => {
          const isActive = activeGenre === g;
          return (
            <button
              key={g}
              onClick={() => onGenreChange(g)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-indigo-100 dark:bg-red-900/30 text-indigo-700 dark:text-red-300 border-indigo-300 dark:border-red-700'
                  : isDark
                    ? 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>
    </div>
  );
}