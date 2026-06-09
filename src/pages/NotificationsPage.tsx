import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BookOpen, Heart, MessageCircle, Star, Gift, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getNotifications } from '../utils/api';
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

const colorMap: Record<string, { light: string; dark: string }> = {
  new_chapter: { light: 'bg-blue-100 text-blue-600', dark: 'bg-blue-900/30 text-blue-400' },
  comment: { light: 'bg-green-100 text-green-600', dark: 'bg-green-900/30 text-green-400' },
  follow: { light: 'bg-purple-100 text-purple-600', dark: 'bg-purple-900/30 text-purple-400' },
  like: { light: 'bg-red-100 text-red-600', dark: 'bg-red-900/30 text-red-400' },
  donation: { light: 'bg-yellow-100 text-yellow-600', dark: 'bg-yellow-900/30 text-yellow-400' },
  ad_reward: { light: 'bg-orange-100 text-orange-600', dark: 'bg-orange-900/30 text-orange-400' },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { if (user) loadNotifications(); }, [user]);

  async function loadNotifications() {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await getNotifications(user.id);
      setNotifications(data || []);
    } catch (err) { console.error('Error loading notifications:', err); } finally { setIsLoading(false); }
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[var(--void)]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-[var(--txt3)]" />
          <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-[var(--txt)]' : 'text-gray-900'}`}>Sign in to view notifications</h2>
          <button onClick={() => navigate('/login')} className="px-6 py-3 bg-gradient-to-r from-[var(--v)] to-[var(--mg)] text-white rounded-full font-semibold">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-[var(--void)] text-[var(--txt)]' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`sticky top-14 z-30 shadow-sm border-b ${isDark ? 'bg-[var(--void)]/95 backdrop-blur-2xl border-[var(--b2)]' : 'bg-white border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className={`w-6 h-6 ${isDark ? 'text-[var(--vb)]' : 'text-indigo-600'}`} />Notifications</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? <LoadingSpinner className="py-12" /> : notifications.length === 0 ? <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" /> : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const Icon = iconMap[notif.type] || Bell;
              const color = colorMap[notif.type] || { light: 'bg-gray-100 text-gray-600', dark: 'bg-[var(--surface2)] text-[var(--txt2)]' };
              return (
                <div key={notif.id} className={`rounded-xl p-4 shadow-sm transition-all hover:shadow-md ${isDark ? 'bg-[var(--surface)] hover:bg-[var(--surface2)]' : 'bg-white hover:bg-gray-50'} ${!notif.is_read ? `ring-2 ${isDark ? 'ring-[var(--v)]/50' : 'ring-indigo-300'}` : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? color.dark : color.light}`}><Icon className="w-5 h-5" /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium ${isDark ? 'text-[var(--txt)]' : 'text-gray-900'}`}>{notif.title}</h3>
                      {notif.message && <p className={`text-sm mt-1 ${isDark ? 'text-[var(--txt2)]' : 'text-gray-500'}`}>{notif.message}</p>}
                      <p className={`text-xs mt-2 ${isDark ? 'text-[var(--txt3)]' : 'text-gray-400'}`}>{new Date(notif.created_at).toLocaleString()}</p>
                    </div>
                    {!notif.is_read && <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-2 ${isDark ? 'bg-[var(--vb)]' : 'bg-indigo-500'}`} />}
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