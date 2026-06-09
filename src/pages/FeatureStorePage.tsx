import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Check, Palette, Sparkles, MessageSquare, Clock, BookOpen, Star, Zap, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getFeatureStoreItems, purchaseFeature, getUserFeatures, getUserBalance } from '../utils/api';
import { formatNumber } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const categoryIcons: Record<string, any> = { profile: Palette, comment: MessageSquare, reading: Clock, novel: BookOpen, special: Star };
const categoryColors: Record<string, { light: string; dark: string }> = {
  profile: { light: 'bg-purple-100 text-purple-700', dark: 'bg-purple-900/30 text-purple-400' },
  comment: { light: 'bg-blue-100 text-blue-700', dark: 'bg-blue-900/30 text-blue-400' },
  reading: { light: 'bg-green-100 text-green-700', dark: 'bg-green-900/30 text-green-400' },
  novel: { light: 'bg-orange-100 text-orange-700', dark: 'bg-orange-900/30 text-orange-400' },
  special: { light: 'bg-pink-100 text-pink-700', dark: 'bg-pink-900/30 text-pink-400' },
};

export default function FeatureStorePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [items, setItems] = useState<any[]>([]);
  const [userFeatures, setUserFeatures] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    try { setIsLoading(true); const [itemsData, featuresData, balanceData] = await Promise.all([getFeatureStoreItems(), getUserFeatures(user!.id), getUserBalance(user!.id)]); setItems(itemsData || []); setUserFeatures(featuresData || []); setBalance(balanceData); } catch (error) { console.error('Error loading store:', error); } finally { setIsLoading(false); }
  }

  function hasFeature(itemId: string): boolean { return userFeatures.some(uf => uf.feature_id === itemId && uf.is_active); }

  const categories = ['all', ...Array.from(new Set(items.map(i => i.category)))];
  const filteredItems = selectedCategory === 'all' ? items : items.filter(i => i.category === selectedCategory);

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[var(--void)]' : 'bg-gray-50'}`}><div className="text-center"><ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[var(--txt3)]" /><h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-[var(--txt)]' : 'text-gray-900'}`}>Sign in to access store</h2><button onClick={() => navigate('/login')} className="px-6 py-3 bg-[var(--v)] text-white rounded-full font-semibold">Sign In</button></div></div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-[var(--void)] text-[var(--txt)]' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white`}>
        <div className="max-w-4xl mx-auto px-4 py-8"><h1 className="text-2xl font-bold mb-2">Feature Store</h1><div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 inline-block"><p className="text-xs text-white/70">Balance</p><p className="text-xl font-bold">{formatNumber(balance?.ngc_balance || 0)} NGC</p></div></div>
      </div>
      <div className={`sticky top-14 z-30 border-b ${isDark ? 'bg-[var(--void)]/95 backdrop-blur-2xl border-[var(--b2)]' : 'bg-white border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (<button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-[var(--v)] text-white shadow-md' : isDark ? 'bg-[var(--surface2)] text-[var(--txt3)] hover:bg-[var(--surface3)]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat}</button>))}
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? <LoadingSpinner className="py-12" /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const Icon = categoryIcons[item.category] || Star;
              const owned = hasFeature(item.id);
              const catColor = categoryColors[item.category] || { light: 'bg-gray-100 text-gray-600', dark: 'bg-[var(--surface2)] text-[var(--txt2)]' };
              return (
                <div key={item.id} className={`rounded-2xl p-5 shadow-sm transition-all ${isDark ? 'bg-[var(--surface)] hover:bg-[var(--surface2)]' : 'bg-white hover:shadow-md'} ${owned ? `ring-2 ${isDark ? 'ring-green-500/50' : 'ring-green-400'}` : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? catColor.dark : catColor.light}`}><Icon className="w-6 h-6" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1"><h3 className={`font-semibold ${isDark ? 'text-[var(--txt)]' : 'text-gray-900'}`}>{item.name}</h3>{owned && <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'}`}><Check className="w-3 h-3" />Owned</span>}</div>
                      <p className={`text-sm mb-3 ${isDark ? 'text-[var(--txt2)]' : 'text-gray-500'}`}>{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-lg font-bold ${isDark ? 'text-[var(--vb)]' : 'text-indigo-600'}`}>{formatNumber(item.price_ngc)} NGC</span>
                        <button className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${owned ? `${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'} cursor-default` : `bg-[var(--v)] text-white hover:opacity-90`}`}>{owned ? 'Active' : 'Purchase'}</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}