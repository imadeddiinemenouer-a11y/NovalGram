import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface TopBarProps { onMenuToggle: () => void; }

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
    <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-2xl border-b border-[var(--border)] transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {showSearch ? (
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Search novels, authors…"
              className="flex-1 px-4 py-2 bg-[var(--bg2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder-[var(--text3)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="button" onClick={() => setShowSearch(false)} className="p-2">
              <X className="w-5 h-5 text-[var(--text3)]" />
            </button>
          </form>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <button onClick={onMenuToggle} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--bg2)] text-[var(--text2)]" aria-label="Menu">
                <Menu className="w-4 h-4" />
              </button>
              <span onClick={() => navigate('/')} className="font-serif text-xl font-bold text-[var(--text)] cursor-pointer select-none">
                Novelgram
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setShowSearch(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--bg2)] text-[var(--text2)]" aria-label="Search">
                <Search className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/notifications')} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--bg2)] text-[var(--text2)] relative" aria-label="Notifications">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--accent)]" />
              </button>
              <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--bg2)] text-[var(--text2)]" aria-label="Toggle theme">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-sm font-bold">
                {user?.display_name?.[0] || user?.username?.[0] || 'U'}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}