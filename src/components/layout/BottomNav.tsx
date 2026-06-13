import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const icons: Record<string, string[]> = {
  home: ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  discover: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.35-4.35'],
  library: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'],
  profile: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 20c0-4 3.6-7 8-7s8 3 8 7'],
};

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const activeColor = 'var(--text)';
  const mutedColor = 'var(--text3)';
  const pillBg = isDark ? '#f0eff8' : '#0f0f14';
  const pillIcon = isDark ? '#0f0f14' : '#f0eff8';

  return (
    <nav className="flex items-end bg-[var(--bg)] border-t border-[var(--border)] flex-shrink-0 z-50 relative" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {[
        { path: '/', label: 'Home', icon: 'home' },
        { path: '/search', label: 'Discover', icon: 'discover' },
      ].map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className="flex-1 flex flex-col items-center gap-1 py-2.5 border-none bg-transparent cursor-pointer transition-colors"
          style={{ color: isActive(item.path) ? activeColor : mutedColor }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            {icons[item.icon].map((d, i) => (<path key={i} d={d} />))}
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
        </button>
      ))}

      <button
        onClick={() => navigate('/studio')}
        className="flex-1 flex flex-col items-center justify-end border-none bg-transparent cursor-pointer relative"
        style={{ height: '56px' }}
      >
        <div
          className="w-[46px] h-[46px] rounded-full flex items-center justify-center absolute shadow-lg"
          style={{ top: '-16px', left: '50%', transform: 'translateX(-50%)', background: pillBg }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={pillIcon} strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider mt-auto pb-1" style={{ color: mutedColor }}>Write</span>
      </button>

      {[
        { path: '/library', label: 'Library', icon: 'library' },
        { path: '/profile', label: 'Me', icon: 'profile' },
      ].map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className="flex-1 flex flex-col items-center gap-1 py-2.5 border-none bg-transparent cursor-pointer transition-colors"
          style={{ color: isActive(item.path) ? activeColor : mutedColor }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            {icons[item.icon].map((d, i) => (<path key={i} d={d} />))}
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}