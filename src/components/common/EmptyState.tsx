import React from 'react';
import { BookOpen, type LucideIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ 
  icon: Icon = BookOpen, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-lg transition-all ${
        isDark ? 'bg-gray-800 shadow-gray-900/50' : 'bg-gray-100 shadow-gray-200/50'
      }`}>
        <Icon className={`w-12 h-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} strokeWidth={1.5} />
      </div>
      <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      {description && (
        <p className={`text-sm max-w-xs mb-6 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      )}
      {action && (
        <div className="transform hover:scale-105 transition-transform">
          {action}
        </div>
      )}
    </div>
  );
}