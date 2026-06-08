import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Compass, Library, Bookmark, PenTool, User, Wallet, ShoppingBag } from 'lucide-react';

const navItems = [
  { path: '/', icon: Compass, label: 'Discover' },
  { path: '/library', icon: Library, label: 'Library' },
  { path: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/store', icon: ShoppingBag, label: 'Store' },
  { path: '/studio', icon: PenTool, label: 'Studio' },
  { path: '/profile', icon: User, label: 'Me' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-50 safe-area-bottom transition-colors">
      <div className="max-w-4xl mx-auto flex justify-around items-center py-2 overflow-x-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px] ${
                isActive 
                  ? 'text-indigo-600 dark:text-red-400' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}