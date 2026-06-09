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
        <div className={`w-16 h-16 rounded-full border-4 border-transparent border-t-[var(--v)] animate-spin`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className={`w-6 h-6 ${isDark ? 'text-[var(--vb)]' : 'text-[var(--v)]'}`} />
        </div>
      </div>
      <p className={`mt-4 text-sm font-medium animate-pulse ${isDark ? 'text-[var(--txt2)]' : 'text-[var(--txt3)]'}`}>
        Loading stories...
      </p>
    </div>
  );
}