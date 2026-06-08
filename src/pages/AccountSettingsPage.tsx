import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      // This would call a real API in production
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
      toast.success('Account deletion requested (mock)');
      setShowDeleteConfirm(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`sticky top-14 z-30 shadow-sm ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Account Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Email */}
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

        {/* Change Password */}
        <div className={`p-5 rounded-2xl shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-lg">Change Password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                isDark ? 'bg-gray-800 border-gray-700 focus:ring-red-500 text-white' : 'bg-gray-100 border-transparent focus:ring-indigo-500'
              }`}
              required
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 chars)"
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                isDark ? 'bg-gray-800 border-gray-700 focus:ring-red-500 text-white' : 'bg-gray-100 border-transparent focus:ring-indigo-500'
              }`}
              required
              minLength={6}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                isDark ? 'bg-gray-800 border-gray-700 focus:ring-red-500 text-white' : 'bg-gray-100 border-transparent focus:ring-indigo-500'
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

        {/* Delete Account */}
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