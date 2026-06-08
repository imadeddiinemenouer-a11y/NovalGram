import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, BookOpen, Heart, MessageCircle, LogOut, Edit, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/api';
import { formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view your profile</h2>
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
      const { error } = await supabase
        .from('profiles')
        .update({ 
          display_name: displayName,
          bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-3xl font-bold">
                {user.display_name?.[0] || user.username[0]}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display Name"
                    className="w-full px-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setDisplayName(user.display_name || '');
                        setBio(user.bio || '');
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {user.display_name || user.username}
                      </h1>
                      <p className="text-gray-500">@{user.username}</p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Edit className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <p className="text-gray-600 mt-2">{user.bio || 'No bio yet'}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      Member since {formatDate(user.created_at)}
                    </span>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full capitalize">
                      {user.role}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <BookOpen className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500">Reading</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <Heart className="w-6 h-6 mx-auto mb-2 text-pink-600" />
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500">Following</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <MessageCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500">Comments</p>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Settings</h2>
          </div>

          <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="flex-1 text-left">Account Settings</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors">
            <BookOpen className="w-5 h-5 text-gray-600" />
            <span className="flex-1 text-left">Reading Preferences</span>
          </button>

          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-50 text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
