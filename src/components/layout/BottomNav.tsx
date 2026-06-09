import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const LibraryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const WriteIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="flex bg-[var(--void)]/97 backdrop-blur-2xl border-t border-[var(--b2)] flex-shrink-0 z-50 relative"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Home */}
      <button
        onClick={() => navigate('/')}
        className={`flex-1 flex flex-col items-center gap-1 py-2 border-none bg-transparent cursor-pointer transition-colors duration-200 ${
          isActive('/') ? 'text-[var(--vb)]' : 'text-[var(--txt3)]'
        }`}
      >
        <HomeIcon />
        <span className="text-[10px] font-semibold tracking-wide">Home</span>
      </button>

      {/* Discover / Search */}
      <button
        onClick={() => navigate('/search')}
        className={`flex-1 flex flex-col items-center gap-1 py-2 border-none bg-transparent cursor-pointer transition-colors duration-200 ${
          isActive('/search') ? 'text-[var(--vb)]' : 'text-[var(--txt3)]'
        }`}
      >
        <SearchIcon />
        <span className="text-[10px] font-semibold tracking-wide">Discover</span>
      </button>

      {/* Write (Central Pill) */}
      <button
        onClick={() => navigate('/studio')}
        className="flex-1 flex flex-col items-center gap-1 py-1 border-none bg-transparent cursor-pointer"
      >
        <div
          className="w-[50px] h-[30px] rounded-full -mt-4 flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, var(--v), var(--mg))',
            boxShadow: '0 3px 16px rgba(109, 40, 217, 0.55)',
          }}
        >
          <WriteIcon />
        </div>
        <span className="text-[10px] font-semibold text-[var(--txt3)] tracking-wide mt-0.5">Write</span>
      </button>

      {/* Library */}
      <button
        onClick={() => navigate('/library')}
        className={`flex-1 flex flex-col items-center gap-1 py-2 border-none bg-transparent cursor-pointer transition-colors duration-200 ${
          isActive('/library') ? 'text-[var(--vb)]' : 'text-[var(--txt3)]'
        }`}
      >
        <LibraryIcon />
        <span className="text-[10px] font-semibold tracking-wide">Library</span>
      </button>

      {/* Profile / Me */}
      <button
        onClick={() => navigate('/profile')}
        className={`flex-1 flex flex-col items-center gap-1 py-2 border-none bg-transparent cursor-pointer transition-colors duration-200 relative ${
          isActive('/profile') ? 'text-[var(--vb)]' : 'text-[var(--txt3)]'
        }`}
      >
        <ProfileIcon />
        <span className="text-[10px] font-semibold tracking-wide">Me</span>
        {/* Notification dot */}
        <span className="absolute top-1.5 right-[calc(50%-14px)] w-[7px] h-[7px] rounded-full bg-[var(--mg)] border-2 border-[var(--void)]" />
      </button>
    </nav>
  );
}