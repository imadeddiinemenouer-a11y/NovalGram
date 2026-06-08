import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Search, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { LANGUAGE_NAMES, LANGUAGE_FLAGS, RTL_LANGUAGES } from '../../i18n/config';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language.split('-')[0];
  const isRTL = RTL_LANGUAGES.includes(currentLang);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [currentLang, isRTL]);

  const languages = Object.keys(LANGUAGE_NAMES).filter(
    lang => LANGUAGE_NAMES[lang].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
          isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        <Globe className="w-5 h-5" />
        <span className="text-sm font-medium">{LANGUAGE_FLAGS[currentLang]} {LANGUAGE_NAMES[currentLang]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-2 right-0 w-72 rounded-2xl shadow-2xl border z-50 overflow-hidden animate-fade-in ${
          isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`p-3 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages..."
                className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                  isDark 
                    ? 'bg-gray-800 text-white placeholder-gray-500 focus:ring-red-500' 
                    : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:ring-indigo-500'
                }`}
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left ${
                  currentLang === lang
                    ? isDark ? 'bg-red-900/20 text-red-300' : 'bg-indigo-50 text-indigo-700'
                    : isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{LANGUAGE_FLAGS[lang]}</span>
                  <div>
                    <p className="font-medium text-sm">{LANGUAGE_NAMES[lang]}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{lang.toUpperCase()}</p>
                  </div>
                </div>
                {currentLang === lang && (
                  <Check className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-indigo-600'}`} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}