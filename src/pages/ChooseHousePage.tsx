import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Flame, Droplets, Wind, Mountain, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const houses = [
  { id: 'fire', name: 'House of Fire', description: 'For passionate stories and epic adventures. You are the flame of the platform.', icon: Flame, color: 'from-orange-500 to-red-600' },
  { id: 'water', name: 'House of Water', description: 'For romantic and emotional tales. You are the heartbeat of the platform.', icon: Droplets, color: 'from-blue-500 to-cyan-600' },
  { id: 'wind', name: 'House of Wind', description: 'For sci-fi and creative imagination. You are the mind of the platform.', icon: Wind, color: 'from-emerald-500 to-teal-600' },
  { id: 'earth', name: 'House of Earth', description: 'For historical and realistic stories. You are the roots of the platform.', icon: Mountain, color: 'from-yellow-500 to-amber-600' },
  { id: 'lightning', name: 'House of Lightning', description: 'For mystery and thriller genres. You are the intellect of the platform.', icon: Zap, color: 'from-purple-500 to-pink-600' },
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
      toast.success(`Welcome to the ${houses.find(h => h.id === selected)?.name}!`);
      navigate('/');
    } catch (error) { toast.error('Something went wrong'); } finally { setIsSaving(false); }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${isDark ? 'bg-[var(--void)]' : 'bg-gray-50'}`}>
      <div className="max-w-2xl w-full text-center">
        <h1 className={`text-3xl font-serif font-extrabold mb-2 ${isDark ? 'text-[var(--txt)]' : 'text-gray-900'}`}>Choose Your House 🏠</h1>
        <p className={`text-sm mb-8 ${isDark ? 'text-[var(--txt2)]' : 'text-gray-500'}`}>Each house has a unique spirit. Choose the one that matches your creative soul.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {houses.map((house) => {
            const Icon = house.icon;
            const isSelected = selected === house.id;
            return (
              <button key={house.id} onClick={() => setSelected(house.id)} className={`relative p-6 rounded-2xl border-2 transition-all text-left ${isSelected ? 'border-[var(--v)] shadow-lg scale-105' : isDark ? 'border-[var(--b2)] hover:border-[var(--vb)]' : 'border-gray-200 hover:border-gray-300'} ${isDark ? 'bg-[var(--surface)]' : 'bg-white'}`}>
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${house.color} flex items-center justify-center`}><Icon className="w-6 h-6 text-white" /></div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-[var(--txt)]' : 'text-gray-900'}`}>{house.name}</h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-[var(--txt2)]' : 'text-gray-500'}`}>{house.description}</p>
                {isSelected && <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--v)] flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
              </button>
            );
          })}
        </div>
        <button onClick={handleChoose} disabled={!selected || isSaving} className={`mt-8 w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${isDark ? 'bg-gradient-to-r from-[var(--v)] to-[var(--mg)] text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'}`}>{isSaving ? 'Joining...' : 'Join House'}</button>
      </div>
    </div>
  );
}