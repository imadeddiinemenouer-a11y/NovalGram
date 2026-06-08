import React from 'react';
import { BookOpen } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className = '' }: LoadingSpinnerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <div className="relative">
        {/* حلقة خارجية دوارة */}
        <div className={`w-16 h-16 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-red-500 animate-spin`} />
        {/* أيقونة ثابتة في المنتصف */}
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-indigo-600'}`} />
        </div>
      </div>
      <p className={`mt-4 text-sm font-medium animate-pulse ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Loading stories...
      </p>
    </div>
  );
}