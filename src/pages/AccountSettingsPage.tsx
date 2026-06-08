import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Lock, User, Wallet, Bell, Shield, AlertTriangle,
  Loader2, Eye, EyeOff, Globe, BookOpen, Heart, MessageCircle, Gift, Star, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // --- الحالات المحلية ---
  const [username, setUsername] = useState(user?.username || '');
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // تفضيلات الإشعارات (محفوظة محليًا)
  const [notifPrefs, setNotifPrefs] = useState({
    new_chapter: true,
    comment: true,
    follow: true,
    like: false,
    donation: true,
    ad_reward: false,
  });

  // إعدادات الخصوصية
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showEmail: false,
  });

  // تحميل التفضيلات من localStorage
  useEffect(() => {
    const savedNotif = localStorage.getItem('novelgram_notif_prefs');
    if (savedNotif) setNotifPrefs(JSON.parse(savedNotif));

    const savedPrivacy = localStorage.getItem('novelgram_privacy');
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
  }, []);

  // حفظ التفضيلات تلقائيًا
  useEffect(() => {
    localStorage.setItem('novelgram_notif_prefs', JSON.stringify(notifPrefs));
  }, [notifPrefs]);

  useEffect(() => {
    localStorage.setItem('novelgram_privacy', JSON.stringify(privacy));
  }, [privacy]);

  // --- المنطق ---
  async function handleSaveUsername() {
    if (!username.trim() || username === user?.username) return;
    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    setIsSavingUsername(true);
    try {
      updateUser({ username });
      toast.success('Username updated!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingUsername(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsChangingPassword(true);
    try {
      // محاكاة تغيير كلمة المرور
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password updated successfully (mock)');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      // محاكاة حذف الحساب
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Account deletion requested (mock)');
      setShowDeleteConfirm(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  // قائمة أنواع الإشعارات
  const notifTypes = [
    { key: 'new_chapter', label: 'New Chapters', icon: BookOpen },
    { key: 'comment', label: 'Comments', icon: MessageCircle },
    { key: 'follow', label: 'New Followers', icon: Heart },
    { key: 'like', label: 'Likes', icon: Heart },
    { key: 'donation', label: 'Donations', icon: Gift },
    { key: 'ad_reward', label: 'Ad Rewards', icon: Star },
  ];

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-14 z-30 shadow-sm border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Account Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        
        {/* 1. تغيير اسم المستخدم */}
        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">Username</h2>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter new username"
              className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-red-500' : 'bg-gray-100 border-transparent focus:ring-indigo-500'
              }`}
            />
            <button
              onClick={handleSaveUsername}
              disabled={isSavingUsername || !username.trim() || username === user?.username}
              className={`px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
                isDark ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isSavingUsername ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>

        {/* 2. البريد الإلكتروني */}
        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-lg">Email Address</h2>
          </div>
          <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <p className="font-mono text-sm">{user?.email || 'Loading...'}</p>
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Contact support to change your email address.
          </p>
        </div>

        {/* 3. تغيير كلمة المرور */}
        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-lg">Change Password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className={`w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-red-500' : 'bg-gray-100 border-transparent focus:ring-indigo-500'
                }`}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 chars)"
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-red-500' : 'bg-gray-100 border-transparent focus:ring-indigo-500'
              }`}
              required
              minLength={6}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-red-500' : 'bg-gray-100 border-transparent focus:ring-indigo-500'
              }`}
              required
            />
            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full py-3 bg-indigo-600 dark:bg-red-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Update Password'}
            </button>
          </form>
        </div>

        {/* 4. ربط المحفظة */}
        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-5 h-5 text-purple-500" />
            <h2 className="font-semibold text-lg">Wallet Connection</h2>
          </div>
          <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <p className="text-sm">Manage your deposits, withdrawals, and NGC balance.</p>
          </div>
          <button
            onClick={() => navigate('/wallet')}
            className={`mt-3 w-full py-2.5 rounded-xl font-semibold transition-colors ${
              isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Go to Wallet
          </button>
        </div>

        {/* 5. تفضيلات الإشعارات */}
        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-yellow-500" />
            <h2 className="font-semibold text-lg">Notification Preferences</h2>
          </div>
          <div className="space-y-4">
            {notifTypes.map((item) => {
              const Icon = item.icon;
              const isEnabled = notifPrefs[item.key as keyof typeof notifPrefs];
              return (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <button
                    onClick={() =>
                      setNotifPrefs(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))
                    }
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      isEnabled
                        ? isDark ? 'bg-red-600' : 'bg-indigo-600'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. إعدادات الخصوصية */}
        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-lg">Privacy Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Public Profile</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Allow others to see your profile</p>
              </div>
              <button
                onClick={() => setPrivacy(prev => ({ ...prev, showProfile: !prev.showProfile }))}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  privacy.showProfile
                    ? isDark ? 'bg-red-600' : 'bg-indigo-600'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    privacy.showProfile ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show Email</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Display email on your profile</p>
              </div>
              <button
                onClick={() => setPrivacy(prev => ({ ...prev, showEmail: !prev.showEmail }))}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  privacy.showEmail
                    ? isDark ? 'bg-red-600' : 'bg-indigo-600'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    privacy.showEmail ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 7. حذف الحساب */}
        <div className={`p-5 rounded-2xl shadow-sm border ${isDark ? 'bg-gray-900 border-red-900/50' : 'bg-white border-red-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="font-semibold text-lg text-red-600 dark:text-red-400">Delete Account</h2>
          </div>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              Delete My Account
            </button>
          ) : (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-red-900/20' : 'bg-red-50'} space-y-3`}>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">Are you sure? This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={handleDeleteAccount} className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700">
                  Yes, Delete
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className={`px-6 py-2.5 rounded-xl font-semibold ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}