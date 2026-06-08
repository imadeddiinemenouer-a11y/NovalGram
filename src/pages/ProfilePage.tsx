import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, BookOpen, Heart, MessageCircle, LogOut, Edit, Camera, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatDate } from '../utils/helpers';
import { uploadAvatar } from '../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut, updateUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Sign in to view your profile</h2>
          <p className="text-gray-500 mb-4">Join our community of readers and writers</p>
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

  async function handleSave() {
    try {
      setIsSaving(true);
      updateUser({ display_name: displayName, bio, updated_at: new Date().toISOString() });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  }

  const avatarLetter = user.display_name?.[0] || user.username?.[0] || 'U';

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header with gradient background */}
      <div className={`relative overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white'}`}>
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
        <div className="max-w-4xl mx-auto px-4 py-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-white/30 shadow-lg" />
              ) : (
                <div className={`w-28 h-28 rounded-full border-4 ${isDark ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-white/30 bg-white/20 text-white'} flex items-center justify-center text-4xl font-bold shadow-lg`}>
                  {avatarLetter}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 w-9 h-9 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white rounded-full flex items-center justify-center shadow hover:scale-105 transition-transform cursor-pointer">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && user) {
                      try {
                        const url = await uploadAvatar(user.id, file);
                        if (url) updateUser({ avatar_url: url });
                        toast.success('Avatar updated!');
                      } catch (err) {
                        toast.error('Failed to upload avatar');
                      }
                    }
                  }}
                />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">{user.display_name || user.username || 'User'}</h1>
              <p className="opacity-80">@{user.username || 'user'}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <span className={`px-3 py-1 rounded-full text-xs capitalize ${
                  user.role === 'author' ? 'bg-yellow-400/30 text-yellow-100' :
                  user.role === 'admin' ? 'bg-red-400/30 text-red-100' :
                  'bg-white/20 text-white'
                }`}>
                  <Shield className="w-3 h-3 inline mr-1" /> {user.role || 'reader'}
                </span>
                <span className="text-sm opacity-70">Joined {formatDate(user.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        <div className={`grid grid-cols-3 gap-4 p-4 rounded-2xl shadow-lg ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="text-center">
            <BookOpen className="w-6 h-6 mx-auto mb-1 text-indigo-600 dark:text-indigo-400" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm opacity-70">Reading</p>
          </div>
          <div className="text-center">
            <Heart className="w-6 h-6 mx-auto mb-1 text-pink-600 dark:text-pink-400" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm opacity-70">Following</p>
          </div>
          <div className="text-center">
            <MessageCircle className="w-6 h-6 mx-auto mb-1 text-green-600 dark:text-green-400" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm opacity-70">Comments</p>
          </div>
        </div>
      </div>

      {/* Bio & Edit */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className={`p-6 rounded-2xl shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name"
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border resize-none ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(user.display_name || '');
                    setBio(user.bio || '');
                  }}
                  className={`px-6 py-2.5 rounded-xl ${
                    isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold">About</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`p-2 rounded-full transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {user.bio || 'No bio yet. Click edit to tell readers about yourself.'}
              </p>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className={`mt-6 rounded-2xl shadow-sm overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
            <h2 className="font-semibold">Settings</h2>
          </div>
          <button className={`w-full flex items-center gap-3 px-4 py-4 transition-colors ${
            isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
          }`}>
            <Settings className="w-5 h-5" />
            <span>Account Settings</span>
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-4 transition-colors ${
            isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
          }`}>
            <BookOpen className="w-5 h-5" />
            <span>Reading Preferences</span>
          </button>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}