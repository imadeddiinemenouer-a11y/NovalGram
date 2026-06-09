import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface TopBarProps {
  onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--void)]/90 backdrop-blur-2xl border-b border-[var(--b2)] transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {showSearch ? (
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Search novels, authors…"
              className="flex-1 px-4 py-2 bg-[var(--surface2)] border border-[var(--b2)] rounded-xl text-sm text-[var(--txt)] placeholder-[var(--txt3)] focus:outline-none focus:ring-2 focus:ring-[var(--v)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="button" onClick={() => setShowSearch(false)} className="p-2">
              <X className="w-5 h-5 text-[var(--txt3)]" />
            </button>
          </form>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={onMenuToggle}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface2)] text-[var(--txt2)] hover:text-[var(--txt)] transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => navigate('/')}>
                <svg className="w-8 h-8" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="bl" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6"/>
                      <stop offset="100%" stopColor="#db2777"/>
                    </linearGradient>
                  </defs>
                  <rect x="2" y="3" width="28" height="26" rx="7" fill="none" stroke="url(#bl)" strokeWidth="1.5" opacity="0.4"/>
                  <rect x="2" y="3" width="14" height="26" rx="7" fill="url(#bl)" opacity="0.88"/>
                  <rect x="13" y="3" width="3" height="26" fill="url(#bl)" opacity="0.88"/>
                  <rect x="16" y="3" width="14" height="26" rx="7" fill="rgba(255,255,255,0.04)"/>
                  <text x="10" y="21" fontSize="10.5" fontWeight="900" fill="white" fontFamily="Georgia,serif" textAnchor="middle">N</text>
                  <rect x="20" y="9" width="8" height="2.5" rx="1.25" fill="rgba(255,255,255,0.38)"/>
                  <rect x="20" y="14" width="6" height="2" rx="1" fill="rgba(255,255,255,0.24)"/>
                  <rect x="20" y="19" width="7" height="2" rx="1" fill="rgba(255,255,255,0.22)"/>
                  <rect x="20" y="24" width="5" height="2" rx="1" fill="rgba(255,255,255,0.18)"/>
                  <circle cx="28" cy="6" r="6" fill="url(#bl)"/>
                  <text x="28" y="10" fontSize="7" fontWeight="900" fill="white" textAnchor="middle">!</text>
                </svg>
                <span className="font-serif text-xl font-bold tracking-tight bg-gradient-to-r from-[#a78bfa] to-[#db2777] bg-clip-text text-transparent">
                  Novelgram
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate('/wallet')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(217,119,6,0.14)] border border-[rgba(245,158,11,0.28)] text-[#f59e0b] text-xs font-bold transition-all active:scale-90"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                  <circle cx="12" cy="12" r="10"/>
                  <text x="12" y="16.5" fontSize="10" fontWeight="900" fill="#92400e" textAnchor="middle">₦</text>
                </svg>
                <span>1.2K</span>
              </button>
              <button onClick={() => setShowSearch(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface2)] text-[var(--txt2)] hover:text-[var(--txt)] transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/notifications')} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface2)] text-[var(--txt2)] hover:text-[var(--txt)] transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--mg)] border-2 border-[var(--void)]" />
              </button>
              <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface2)] text-[var(--txt2)] hover:text-[var(--txt)] transition-colors">
                {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--v)] to-[var(--mg)] flex items-center justify-center text-white text-sm font-bold">
                {user?.display_name?.[0] || user?.username?.[0] || 'U'}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}