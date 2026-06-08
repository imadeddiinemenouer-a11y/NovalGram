import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, Globe, Moon, Sun, Palette, Shield, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Account Settings',
          description: 'Email, password, delete account',
          onClick: () => navigate('/settings/account'),
          color: 'text-blue-500',
        },
        {
          icon: BookOpen,
          label: 'Reading Preferences',
          description: 'Language, theme, font size',
          onClick: () => navigate('/settings/reading'),
          color: 'text-indigo-500',
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: theme === 'dark' ? Moon : Sun,
          label: 'Dark Mode',
          description: theme === 'dark' ? 'Switch to Light' : 'Switch to Dark',
          onClick: toggleTheme,
          color: theme === 'dark' ? 'text-gray-400' : 'text-yellow-500',
        },
        {
          icon: Palette,
          label: 'Theme Color',
          description: 'Indigo (default)',
          onClick: () => {},
          color: 'text-purple-500',
        },
      ],
    },
    {
      title: 'More',
      items: [
        {
          icon: Globe,
          label: 'Language',
          description: 'Change interface language',
          onClick: () => navigate('/language/en'),
          color: 'text-green-500',
        },
        {
          icon: Shield,
          label: 'Privacy Policy',
          description: 'How we handle your data',
          onClick: () => {},
          color: 'text-gray-500',
        },
      ],
    },
  ];

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`sticky top-14 z-30 shadow-sm ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <h2 className={`text-sm font-semibold mb-3 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {section.title}
            </h2>
            <div className={`rounded-2xl shadow-sm overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
              {section.items.map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-4 px-5 py-4 transition-colors text-left ${
                    index < section.items.length - 1 ? (isDark ? 'border-b border-gray-800' : 'border-b border-gray-100') : ''
                  } ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.label}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.description}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Sign Out */}
        <button
          onClick={() => signOut()}
          className={`w-full py-4 rounded-2xl font-semibold transition-colors ${
            isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
        >
          <LogOut className="w-5 h-5 inline mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
}