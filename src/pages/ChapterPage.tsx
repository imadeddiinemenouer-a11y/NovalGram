import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ChapterReader from '../components/novels/ChapterReader';
import { useTheme } from '../context/ThemeContext';

export default function ChapterPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!chapterId) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-[var(--void)] text-[var(--txt2)]' : 'bg-gray-50 text-gray-500'}`}>
        <p className="text-lg mb-4">Chapter not found</p>
        <button onClick={() => navigate(-1)} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${isDark ? 'bg-[var(--surface2)] hover:bg-[var(--surface3)]' : 'bg-gray-200 hover:bg-gray-300'}`}><ArrowLeft className="w-4 h-4" /> Go Back</button>
      </div>
    );
  }

  return <ChapterReader />;
}