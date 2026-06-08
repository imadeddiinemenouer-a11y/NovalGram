import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BookOpen, Heart, MessageCircle, Star, Gift, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const iconMap: Record<string, any> = {
  new_chapter: BookOpen,
  comment: MessageCircle,
  follow: User,
  like: Heart,
  donation: Gift,
  ad_reward: Star,
};

const colorMap: Record<string, string> = {
  new_chapter: 'bg-blue-100 text-blue-600',
  comment: 'bg-green-100 text-green-600',
  follow: 'bg-purple-100 text-purple-600',
  like: 'bg-red-100 text-red-600',
  donation: 'bg-yellow-100 text-yellow-600',
  ad_reward: 'bg-orange-100 text-orange-600',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  async function loadNotifications() {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) setNotifications(data || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view notifications</h2>
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
      <div className="bg-white shadow-sm sticky top-14 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up!"
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const Icon = iconMap[notif.type] || Bell;
              const colorClass = colorMap[notif.type] || 'bg-gray-100 text-gray-600';
              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-xl p-4 shadow-sm ${!notif.is_read ? 'ring-2 ring-indigo-200' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{notif.title}</h3>
                      {notif.message && <p className="text-sm text-gray-500 mt-1">{notif.message}</p>}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
                    )}
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