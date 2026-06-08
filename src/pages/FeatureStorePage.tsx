import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Check, Crown, Palette, Sparkles, MessageSquare, Clock, BookOpen, Star, Paintbrush, Zap, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFeatureStoreItems, purchaseFeature, getUserFeatures, getUserBalance, supabase } from '../utils/api';
import { formatNumber } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const categoryIcons: Record<string, any> = {
  profile: Palette,
  comment: MessageSquare,
  reading: Clock,
  novel: BookOpen,
  special: Star
};

const categoryColors: Record<string, string> = {
  profile: 'bg-purple-100 text-purple-700',
  comment: 'bg-blue-100 text-blue-700',
  reading: 'bg-green-100 text-green-700',
  novel: 'bg-orange-100 text-orange-700',
  special: 'bg-pink-100 text-pink-700'
};

export default function FeatureStorePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [userFeatures, setUserFeatures] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    try {
      setIsLoading(true);
      const [itemsData, featuresData, balanceData] = await Promise.all([
        getFeatureStoreItems(),
        getUserFeatures(user!.id),
        getUserBalance(user!.id)
      ]);
      setItems(itemsData || []);
      setUserFeatures(featuresData || []);
      setBalance(balanceData);
    } catch (error) {
      console.error('Error loading store:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePurchase(itemId: string) {
    if (!user) {
      toast.error('Please sign in first');
      navigate('/login');
      return;
    }

    setPurchasing(itemId);
    try {
      const result = await purchaseFeature(user.id, itemId);

      if (result.success) {
        toast.success(result.message || 'Purchase successful!');
        loadData();
      } else {
        if (result.error?.includes('Insufficient')) {
          toast.error('Insufficient NGC balance. Please deposit first.');
          navigate('/wallet');
        } else {
          toast.error(result.error || 'Purchase failed');
        }
      }
    } catch (error) {
      toast.error('Purchase error');
    } finally {
      setPurchasing(null);
    }
  }

  function hasFeature(itemId: string): boolean {
    return userFeatures.some(uf => uf.feature_id === itemId && uf.is_active);
  }

  const categories = ['all', ...Array.from(new Set(items.map(i => i.category)))];
  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(i => i.category === selectedCategory);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to access store</h2>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Feature Store</h1>
              <p className="text-purple-100">Enhance your experience with premium features</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <p className="text-xs text-purple-200">Balance</p>
              <p className="text-xl font-bold">{formatNumber(balance?.ngc_balance || 0)} NGC</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const Icon = categoryIcons[item.category] || Star;
              const owned = hasFeature(item.id);
              const canAfford = (balance?.ngc_balance || 0) >= item.price_ngc;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl shadow-sm p-5 transition-all ${
                    owned ? 'ring-2 ring-green-400' : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      categoryColors[item.category] || 'bg-gray-100'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {owned && (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <Check className="w-3 h-3" />
                            Owned
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 mb-3">{item.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-indigo-600">
                            {formatNumber(item.price_ngc)} NGC
                          </span>
                          {item.duration_days && (
                            <span className="text-xs text-gray-400">
                              / {item.duration_days} days
                            </span>
                          )}
                          {!item.duration_days && (
                            <span className="text-xs text-green-600">Permanent</span>
                          )}
                        </div>

                        <button
                          onClick={() => !owned && handlePurchase(item.id)}
                          disabled={owned || purchasing === item.id || !canAfford}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            owned
                              ? 'bg-green-100 text-green-700 cursor-default'
                              : !canAfford
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : purchasing === item.id
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {owned ? (
                            <span className="flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              Active
                            </span>
                          ) : purchasing === item.id ? (
                            <span className="flex items-center gap-1">
                              <Zap className="w-4 h-4 animate-pulse" />
                              Processing...
                            </span>
                          ) : !canAfford ? (
                            <span className="flex items-center gap-1">
                              <Lock className="w-4 h-4" />
                              Need {item.price_ngc - (balance?.ngc_balance || 0)} NGC
                            </span>
                          ) : (
                            'Purchase'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* My Features */}
        {userFeatures.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Features</h2>
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
              {userFeatures.map((uf) => (
                <div key={uf.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      categoryColors[uf.feature?.category] || 'bg-gray-100'
                    }`}>
                      {React.createElement(categoryIcons[uf.feature?.category] || Star, { className: "w-4 h-4" })}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{uf.feature?.name}</p>
                      <p className="text-xs text-gray-500">
                        {uf.expires_at 
                          ? `Expires: ${new Date(uf.expires_at).toLocaleDateString()}`
                          : 'Permanent'
                        }
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
