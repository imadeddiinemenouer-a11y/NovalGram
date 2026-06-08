import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, BookMarked, Type, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const readingThemes = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'sepia', label: 'Sepia', icon: BookMarked },
];

const fontSizes = [14, 16, 18, 20, 22, 24];

export default function ReadingPreferencesPage() {
  const navigate = useNavigate();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  const { i18n } = useTranslation();
  const isDark = theme === 'dark';

  const [selectedReadingTheme, setSelectedReadingTheme] = useState(theme);

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`sticky top-14 z-30 shadow-sm ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Reading Preferences</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Reading Theme */}
        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Type className="w-5 h-5 text-purple-500" />
            <h2 className="font-semibold text-lg">Reading Theme</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {readingThemes.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => { setSelectedReadingTheme(t.id); setTheme(t.id as any); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedReadingTheme === t.id
                      ? 'border-indigo-600 dark:border-red-500 bg-indigo-50 dark:bg-red-900/20'
                      : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${selectedReadingTheme === t.id ? (isDark ? 'text-red-400' : 'text-indigo-600') : ''}`} />
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Size */}
        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Type className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-lg">Font Size</h2>
          </div>
          <div className="flex items-center justify-center gap-1">
            {fontSizes.map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                  fontSize === size
                    ? 'bg-indigo-600 dark:bg-red-600 text-white shadow-lg'
                    : isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed">
              This is a preview of how your text will look at size {fontSize}px. You can adjust this anytime while reading.
            </p>
          </div>
        </div>

        {/* Interface Language */}
        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-lg">Interface Language</h2>
          </div>
          <button
            onClick={() => navigate('/language/en')}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
              isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <span className="font-medium">{i18n.language === 'en' ? 'English' : i18n.language.toUpperCase()}</span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Change →</span>
          </button>
        </div>
      </div>
    </div>
  );
}