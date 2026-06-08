import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'sepia';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('novelgram-theme');
    return (saved as Theme) || 'light';
  });

  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('novelgram-fontsize');
    return saved ? parseInt(saved) : 16;
  });

  useEffect(() => {
    localStorage.setItem('novelgram-theme', theme);
    localStorage.setItem('novelgram-fontsize', fontSize.toString());

    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'sepia');
    root.classList.add(theme);
  }, [theme, fontSize]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
