import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Compass, Library, Bookmark, PenTool, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-50 safe-area-bottom transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-around px-2 py-3">
        
        {/* Discover */}
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all ${
            isActive('/')
              ? 'text-indigo-600 dark:text-red-400'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <Compass className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Discover</span>
        </button>

        {/* Library */}
        <button
          onClick={() => navigate('/library')}
          className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all ${
            isActive('/library')
              ? 'text-indigo-600 dark:text-red-400'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <Library className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Library</span>
        </button>

        {/* زر مركزي: Write (للكاتب) أو Bookmarks (للقارئ) */}
        <button
          onClick={() => {
            if (user?.role === 'author') {
              navigate('/studio');
            } else {
              navigate('/bookmarks');
            }
          }}
          className={`-mt-6 w-14 h-14 rounded-full bg-indigo-600 dark:bg-red-600 text-white shadow-lg shadow-indigo-500/30 dark:shadow-red-500/30 flex items-center justify-center hover:scale-105 transition-transform ${
            user?.role === 'author' ? 'bg-purple-600 dark:bg-amber-500' : ''
          }`}
        >
          {user?.role === 'author' ? (
            <PenTool className="w-6 h-6" />
          ) : (
            <Bookmark className="w-6 h-6" />
          )}
        </button>

        {/* Write / Studio (بدلاً من Alerts) */}
        <button
          onClick={() => navigate('/studio')}
          className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all ${
            isActive('/studio')
              ? 'text-indigo-600 dark:text-red-400'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <PenTool className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Write</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all ${
            isActive('/profile')
              ? 'text-indigo-600 dark:text-red-400'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Me</span>
        </button>
      </div>
    </nav>
  );
}