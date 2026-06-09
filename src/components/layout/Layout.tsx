import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { X, Wallet, ShoppingBag, PenTool, Search, Gift, Bookmark, Globe, User, Settings, Bell, Home } from 'lucide-react';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/search', label: 'Search', icon: Search },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/store', label: 'Feature Store', icon: ShoppingBag },
    { path: '/rewards', label: 'Earn NGC', icon: Gift },
    { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { path: '/choose-house', label: 'Choose House', icon: Home },
    { path: '/studio', label: 'Studio', icon: PenTool },
    { path: '/language/en', label: 'Languages', icon: Globe },
    { path: '/notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[var(--void)] text-[var(--txt)] transition-colors relative">
      <TopBar onMenuToggle={() => setSidebarOpen(true)} />

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-[var(--surface)] border-r border-[var(--b2)] shadow-2xl z-50 overflow-y-auto">
            <div className="p-5 border-b border-[var(--b2)] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--txt)]">Menu</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-full hover:bg-[var(--surface2)] text-[var(--txt2)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                      isActive
                        ? 'bg-[var(--b1)] text-[var(--vb)]'
                        : 'text-[var(--txt2)] hover:bg-[var(--surface2)] hover:text-[var(--txt)]'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="border-t border-[var(--b2)] p-3 mt-auto">
              <button onClick={() => { navigate('/profile'); setSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--txt2)] hover:bg-[var(--surface2)] hover:text-[var(--txt)] transition-colors">
                <User className="w-5 h-5" /> <span className="text-sm font-medium">Profile</span>
              </button>
              <button onClick={() => { navigate('/settings'); setSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--txt2)] hover:bg-[var(--surface2)] hover:text-[var(--txt)] transition-colors">
                <Settings className="w-5 h-5" /> <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
          </div>
        </>
      )}

      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}