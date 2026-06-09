import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Wallet, Bell, Shield, AlertTriangle, Loader2, Eye, EyeOff, BookOpen, Heart, MessageCircle, Gift, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [username, setUsername] = useState(user?.username || '');
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({ new_chapter: true, comment: true, follow: true, like: false, donation: true, ad_reward: false });
  const [privacy, setPrivacy] = useState({ showProfile: true, showEmail: false });

  useEffect(() => {
    const savedNotif = localStorage.getItem('novelgram_notifs');
    if (savedNotif) setNotifPrefs(JSON.parse(savedNotif));
    const savedPrivacy = localStorage.getItem('novelgram_privacy');
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
  }, []);
  useEffect(() => { localStorage.setItem('novelgram_notifs', JSON.stringify(notifPrefs)); }, [notifPrefs]);
  useEffect(() => { localStorage.setItem('novelgram_privacy', JSON.stringify(privacy)); }, [privacy]);

  async function handleSaveUsername() {
    if (!username.trim() || username === user?.username) return;
    if (username.length < 3) { toast.error('Username must be at least 3 characters'); return; }
    setIsSavingUsername(true);
    try { updateUser({ username }); toast.success('Username updated!'); } catch (err: any) { toast.error(err.message); } finally { setIsSavingUsername(false); }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setIsChangingPassword(true);
    try { await new Promise(r => setTimeout(r, 800)); toast.success('Password updated (mock)'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); } catch (err: any) { toast.error(err.message); } finally { setIsChangingPassword(false); }
  }

  const notifTypes = [
    { key: 'new_chapter', label: 'New Chapters', icon: BookOpen },
    { key: 'comment', label: 'Comments', icon: MessageCircle },
    { key: 'follow', label: 'New Followers', icon: Heart },
    { key: 'like', label: 'Likes', icon: Heart },
    { key: 'donation', label: 'Donations', icon: Gift },
    { key: 'ad_reward', label: 'Ad Rewards', icon: Star },
  ];

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-[var(--void)] text-[var(--txt)]' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`sticky top-14 z-30 shadow-sm border-b ${isDark ? 'bg-[var(--void)]/95 backdrop-blur-2xl border-[var(--b2)]' : 'bg-white border-gray-200'}`}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-[var(--surface2)]' : 'hover:bg-gray-100'}`}><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold">Account Settings</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-[var(--surface)]' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4"><User className="w-5 h-5 text-[var(--vb)]" /><h2 className="font-semibold text-lg">Username</h2></div>
          <div className="flex gap-3"><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter new username" className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${isDark ? 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)] focus:ring-[var(--v)]' : 'bg-gray-100 border-transparent focus:ring-indigo-500'}`} /><button onClick={handleSaveUsername} disabled={isSavingUsername || !username.trim() || username === user?.username} className="px-6 py-3 rounded-xl font-semibold bg-[var(--v)] text-white hover:opacity-90 disabled:opacity-50">{isSavingUsername ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}</button></div>
        </div>

        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-[var(--surface)]' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4"><Mail className="w-5 h-5 text-blue-500" /><h2 className="font-semibold text-lg">Email Address</h2></div>
          <div className={`p-3 rounded-xl ${isDark ? 'bg-[var(--surface2)]' : 'bg-gray-100'}`}><p className="font-mono text-sm">{user?.email || 'Loading...'}</p></div>
          <p className={`text-xs mt-2 ${isDark ? 'text-[var(--txt3)]' : 'text-gray-400'}`}>Contact support to change your email.</p>
        </div>

        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-[var(--surface)]' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4"><Lock className="w-5 h-5 text-green-500" /><h2 className="font-semibold text-lg">Change Password</h2></div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="relative"><input type={showPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className={`w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 ${isDark ? 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)] focus:ring-[var(--v)]' : 'bg-gray-100 border-transparent focus:ring-indigo-500'}`} required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--txt3)]">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
            <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${isDark ? 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)] focus:ring-[var(--v)]' : 'bg-gray-100 border-transparent focus:ring-indigo-500'}`} required minLength={6} />
            <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${isDark ? 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)] focus:ring-[var(--v)]' : 'bg-gray-100 border-transparent focus:ring-indigo-500'}`} required />
            <button type="submit" disabled={isChangingPassword} className="w-full py-3 bg-[var(--v)] text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50">{isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Update Password'}</button>
          </form>
        </div>

        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-[var(--surface)]' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4"><Wallet className="w-5 h-5 text-purple-500" /><h2 className="font-semibold text-lg">Wallet</h2></div>
          <button onClick={() => navigate('/wallet')} className={`w-full py-2.5 rounded-xl font-semibold transition-colors ${isDark ? 'bg-[var(--surface2)] hover:bg-[var(--surface3)]' : 'bg-gray-200 hover:bg-gray-300'}`}>Go to Wallet</button>
        </div>

        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-[var(--surface)]' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4"><Bell className="w-5 h-5 text-yellow-500" /><h2 className="font-semibold text-lg">Notifications</h2></div>
          <div className="space-y-4">
            {notifTypes.map((item) => {
              const Icon = item.icon;
              const isEnabled = notifPrefs[item.key as keyof typeof notifPrefs];
              return (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><Icon className="w-5 h-5 text-[var(--txt3)]" /><span className="text-sm font-medium">{item.label}</span></div>
                  <button onClick={() => setNotifPrefs(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))} className={`relative w-12 h-7 rounded-full transition-colors ${isEnabled ? 'bg-[var(--v)]' : 'bg-[var(--surface3)]'}`}><span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-5' : ''}`} /></button>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-[var(--surface)]' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4"><Shield className="w-5 h-5 text-green-500" /><h2 className="font-semibold text-lg">Privacy</h2></div>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Public Profile</p><p className={`text-xs ${isDark ? 'text-[var(--txt3)]' : 'text-gray-500'}`}>Allow others to see your profile</p></div><button onClick={() => setPrivacy(prev => ({ ...prev, showProfile: !prev.showProfile }))} className={`relative w-12 h-7 rounded-full transition-colors ${privacy.showProfile ? 'bg-[var(--v)]' : 'bg-[var(--surface3)]'}`}><span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${privacy.showProfile ? 'translate-x-5' : ''}`} /></button></div>
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Show Email</p><p className={`text-xs ${isDark ? 'text-[var(--txt3)]' : 'text-gray-500'}`}>Display email on profile</p></div><button onClick={() => setPrivacy(prev => ({ ...prev, showEmail: !prev.showEmail }))} className={`relative w-12 h-7 rounded-full transition-colors ${privacy.showEmail ? 'bg-[var(--v)]' : 'bg-[var(--surface3)]'}`}><span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${privacy.showEmail ? 'translate-x-5' : ''}`} /></button></div>
          </div>
        </div>

        <div className={`p-5 rounded-2xl shadow-sm border ${isDark ? 'bg-[var(--surface)] border-red-900/50' : 'bg-white border-red-200'}`}>
          <div className="flex items-center gap-3 mb-4"><AlertTriangle className="w-5 h-5 text-red-500" /><h2 className="font-semibold text-lg text-red-600 dark:text-red-400">Delete Account</h2></div>
          <p className={`text-sm mb-4 ${isDark ? 'text-[var(--txt3)]' : 'text-gray-500'}`}>Permanently delete your account and all data.</p>
          {!showDeleteConfirm ? <button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold">Delete My Account</button> : (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-red-900/20' : 'bg-red-50'} space-y-3`}>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">Are you sure? This cannot be undone.</p>
              <div className="flex gap-3"><button onClick={() => { toast.success('Account deleted (mock)'); setShowDeleteConfirm(false); }} className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-semibold">Yes, Delete</button><button onClick={() => setShowDeleteConfirm(false)} className={`px-6 py-2.5 rounded-xl font-semibold ${isDark ? 'bg-[var(--surface2)] hover:bg-[var(--surface3)]' : 'bg-gray-200 hover:bg-gray-300'}`}>Cancel</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}