import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, BookMarked, Type, Globe, Eye } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const readingThemes = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'sepia', label: 'Sepia', icon: BookMarked },
];

const fontSizes = [14, 16, 18, 20, 22, 24, 28];

export default function ReadingPreferencesPage() {
  const navigate = useNavigate();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  const { i18n } = useTranslation();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-[var(--void)] text-[var(--txt)]' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`sticky top-14 z-30 shadow-sm border-b ${isDark ? 'bg-[var(--void)]/95 backdrop-blur-2xl border-[var(--b2)]' : 'bg-white border-gray-200'}`}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-[var(--surface2)]' : 'hover:bg-gray-100'}`}><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold flex items-center gap-2"><Eye className={`w-5 h-5 ${isDark ? 'text-[var(--vb)]' : 'text-indigo-600'}`} />Reading Preferences</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-[var(--surface)]' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4"><Type className="w-5 h-5 text-purple-500" /><h2 className="font-semibold text-lg">Reading Theme</h2></div>
          <div className="grid grid-cols-3 gap-3">
            {readingThemes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.id;
              return (
                <button key={t.id} onClick={() => setTheme(t.id as any)} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${isActive ? 'border-[var(--v)] bg-[var(--b1)]' : isDark ? 'border-[var(--b2)] hover:border-[var(--vb)]' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Icon className={`w-6 h-6 ${isActive ? (isDark ? 'text-[var(--vb)]' : 'text-[var(--v)]') : ''}`} /><span className="text-sm font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-[var(--surface)]' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4"><Type className="w-5 h-5 text-blue-500" /><h2 className="font-semibold text-lg">Font Size</h2></div>
          <div className="flex items-center justify-center gap-1">
            {fontSizes.map((size) => (
              <button key={size} onClick={() => setFontSize(size)} className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${fontSize === size ? 'bg-[var(--v)] text-white shadow-lg' : isDark ? 'text-[var(--txt3)] hover:bg-[var(--surface2)]' : 'text-gray-600 hover:bg-gray-200'}`}>{size}</button>
            ))}
          </div>
          <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'border-[var(--b2)] bg-[var(--surface2)]' : 'border-gray-200 bg-gray-50'}`}><p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed">This is a preview of how your text will look at size {fontSize}px.</p></div>
        </div>
        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-[var(--surface)]' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4"><Globe className="w-5 h-5 text-green-500" /><h2 className="font-semibold text-lg">Interface Language</h2></div>
          <button onClick={() => navigate('/language/en')} className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${isDark ? 'bg-[var(--surface2)] hover:bg-[var(--surface3)]' : 'bg-gray-100 hover:bg-gray-200'}`}><span className="font-medium">{i18n.language === 'en' ? 'English' : i18n.language.toUpperCase()}</span><span className={`text-sm ${isDark ? 'text-[var(--txt3)]' : 'text-gray-500'}`}>Change →</span></button>
        </div>
      </div>
    </div>
  );
}