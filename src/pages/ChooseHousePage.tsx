import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Flame, Droplets, Wind, Mountain, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const houses = [
  {
    id: 'fire',
    name: 'بيت النار',
    description: 'لأصحاب القصص الحماسية والمغامرات. أنتم شعلة المنصة.',
    icon: Flame,
    color: 'from-orange-500 to-red-600',
    textColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'water',
    name: 'بيت الماء',
    description: 'لأصحاب القصص الرومانسية والعاطفية. أنتم نبض المنصة.',
    icon: Droplets,
    color: 'from-blue-500 to-cyan-600',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'wind',
    name: 'بيت الريح',
    description: 'لأصحاب قصص الخيال العلمي والإبداع. أنتم عقل المنصة.',
    icon: Wind,
    color: 'from-emerald-500 to-teal-600',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'earth',
    name: 'بيت الأرض',
    description: 'لأصحاب القصص التاريخية والواقعية. أنتم جذور المنصة.',
    icon: Mountain,
    color: 'from-yellow-500 to-amber-600',
    textColor: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    id: 'lightning',
    name: 'بيت البرق',
    description: 'لأصحاب القصص البوليسية والغموض. أنتم ذكاء المنصة.',
    icon: Zap,
    color: 'from-purple-500 to-pink-600',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
];

export default function ChooseHousePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selected, setSelected] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleChoose = async () => {
    if (!selected || !user) return;
    setIsSaving(true);
    try {
      updateUser({ house: selected } as any);
      localStorage.setItem('novelgram_house', selected);
      toast.success(`انضممت إلى ${houses.find(h => h.id === selected)?.name}!`);
      navigate('/');
    } catch (error) {
      toast.error('حدث خطأ، حاول مجدداً');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      isDark ? 'bg-gray-950' : 'bg-gray-50'
    }`}>
      <div className="max-w-2xl w-full text-center">
        <h1 className={`text-3xl font-extrabold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          اختر منزلك 🏠
        </h1>
        <p className={`text-sm mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          كل منزل له روح خاصة. اختر ما يناسب شخصيتك الإبداعية.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {houses.map((house) => {
            const Icon = house.icon;
            const isSelected = selected === house.id;
            return (
              <button
                key={house.id}
                onClick={() => setSelected(house.id)}
                className={`relative p-6 rounded-2xl border-2 transition-all text-right ${
                  isSelected
                    ? 'border-indigo-600 dark:border-red-500 shadow-lg scale-105'
                    : isDark
                      ? 'border-gray-800 hover:border-gray-600'
                      : 'border-gray-200 hover:border-gray-300'
                } ${isDark ? 'bg-gray-900' : 'bg-white'}`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${house.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {house.name}
                  </h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {house.description}
                </p>
                {isSelected && (
                  <div className={`absolute top-3 left-3 w-6 h-6 rounded-full bg-indigo-600 dark:bg-red-500 flex items-center justify-center`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleChoose}
          disabled={!selected || isSaving}
          className={`mt-8 w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
            isDark
              ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
          }`}
        >
          {isSaving ? 'جارٍ الانضمام...' : 'انضم إلى المنزل'}
        </button>
      </div>
    </div>
  );
}