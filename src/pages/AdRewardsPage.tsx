import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Play, Clock, Gift, TrendingUp, AlertCircle, CheckCircle, Star, Zap, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { processAdReward, getUserBalance, getDailyAdStats } from '../utils/api';
import { formatNumber } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdRewardsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [balance, setBalance] = useState<any>(null);
  const [dailyStats, setDailyStats] = useState<any>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(15);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    try {
      setIsLoading(true);
      const [balanceData, statsData] = await Promise.all([
        getUserBalance(user!.id),
        getDailyAdStats(user!.id)
      ]);
      setBalance(balanceData);
      setDailyStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleWatchAd() {
    if (!user) {
      toast.error('Please sign in first');
      navigate('/login');
      return;
    }

    if (dailyStats && dailyStats.ads_watched >= dailyStats.max_ads) {
      toast.error('Daily ad limit reached. Come back tomorrow!');
      return;
    }

    setIsWatching(true);
    setProgress(0);
    setCountdown(15);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
      setProgress(prev => prev + (100 / 15));
    }, 1000);

    setTimeout(async () => {
      try {
        const result = await processAdReward(user.id, 15);
        if (result.success) {
          toast.success(result.message || 'Earned 5 NGC!');
          loadData();
        } else {
          toast.error(result.error || 'Failed to earn reward');
        }
      } catch (error) {
        toast.error('Error processing reward');
      } finally {
        setIsWatching(false);
        setProgress(0);
      }
    }, 15000);
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className={`rounded-3xl p-8 max-w-md w-full text-center ${isDark ? 'bg-gray-900' : 'bg-white shadow-xl'}`}>
          <Gift className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-indigo-600'}`} />
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Earn Free NGC</h2>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sign in to start earning rewards</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <Zap className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Earn Free NGC</span>
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Watch Ads, Earn Rewards</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Support the platform while earning free Novelgram Coins</p>
        </div>

        {/* Balance Card */}
        <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your Balance</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatNumber(balance?.ngc_balance || 0)} NGC</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
              <Star className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Daily Progress */}
        <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Daily Progress</span>
            </div>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {dailyStats?.ads_watched || 0} / {dailyStats?.max_ads || 20} ads
            </span>
          </div>

          <div className={`w-full rounded-full h-3 mb-2 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <div
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all"
              style={{ width: `${((dailyStats?.ads_watched || 0) / (dailyStats?.max_ads || 20)) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {dailyStats?.ngc_earned || 0} / {dailyStats?.max_ngc || 100} NGC earned
            </span>
            <span className="text-green-400">
              {Math.max(0, (dailyStats?.max_ads || 20) - (dailyStats?.ads_watched || 0))} ads remaining
            </span>
          </div>
        </div>

        {/* Watch Ad Button */}
        <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
          {isWatching ? (
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                <Play className="w-10 h-10 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Watching Ad...</h3>
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Please wait {countdown} seconds</p>

              <div className={`w-full rounded-full h-4 mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Clock className="w-4 h-4" />
                <span>Earning 5 NGC...</span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div
                className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                onClick={handleWatchAd}
              >
                <Play className="w-10 h-10 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Watch Ad & Earn</h3>
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Watch a 15-second ad to earn 5 NGC</p>

              <button
                onClick={handleWatchAd}
                disabled={dailyStats?.ads_watched >= dailyStats?.max_ads}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dailyStats?.ads_watched >= dailyStats?.max_ads
                  ? 'Daily Limit Reached'
                  : '▶ Watch Ad (15s)'}
              </button>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`rounded-2xl p-4 ${isDark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <Clock className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>15 Seconds</span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Short ads that respect your time</p>
          </div>

          <div className={`rounded-2xl p-4 ${isDark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <Gift className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>5 NGC Reward</span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Earned instantly after watching</p>
          </div>

          <div className={`rounded-2xl p-4 ${isDark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                <Shield className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Daily Limit</span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>20 ads max (100 NGC/day)</p>
          </div>
        </div>

        {/* How it Works */}
        <div className={`rounded-2xl p-6 mt-6 ${isDark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>How It Works</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Click Watch Ad</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Start watching a short advertisement</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Wait 15 Seconds</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Watch the full ad to earn rewards</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Earn 5 NGC Instantly</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Use NGC to buy premium chapters or support authors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className={`rounded-2xl p-4 mt-6 ${isDark ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <div>
              <p className={`font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>Important</p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-yellow-600'}`}>Please watch ads honestly. Using VPN or bots will result in account suspension.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}