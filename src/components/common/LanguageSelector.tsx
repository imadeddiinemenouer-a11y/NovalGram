import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Search, Check, ChevronDown } from 'lucide-react';
import { LANGUAGE_NAMES, LANGUAGE_FLAGS, RTL_LANGUAGES } from '../../i18n/config';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
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
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium">{LANGUAGE_FLAGS[currentLang]} {LANGUAGE_NAMES[currentLang]}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages..."
                className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                  currentLang === lang ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{LANGUAGE_FLAGS[lang]}</span>
                  <div>
                    <p className="font-medium text-sm">{LANGUAGE_NAMES[lang]}</p>
                    <p className="text-xs text-gray-400">{lang.toUpperCase()}</p>
                  </div>
                </div>
                {currentLang === lang && <Check className="w-5 h-5 text-indigo-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
