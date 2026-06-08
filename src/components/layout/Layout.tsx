import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { X, Wallet, ShoppingBag, PenTool, Search, Gift, ArrowUpRight, Bookmark, Globe, User, Settings } from 'lucide-react';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  const menuItems = [
    { path: '/search', label: 'Search', icon: Search },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/store', label: 'Feature Store', icon: ShoppingBag },
    { path: '/rewards', label: 'Earn NGC', icon: Gift },
    { path: '/withdraw', label: 'Withdraw', icon: ArrowUpRight },
    { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { path: '/studio', label: 'Studio', icon: PenTool },
    { path: '/language/en', label: 'Languages', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] transition-colors relative">
      {/* ✅ نمرر openSidebar إلى TopBar */}
      <TopBar onMenuToggle={openSidebar} />

      {/* القائمة الجانبية */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
            onClick={closeSidebar}
          />
          <div className="fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu</h2>
              <button onClick={closeSidebar} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-3 space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      closeSidebar();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-red-900/20 text-indigo-600 dark:text-red-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 p-3 mt-auto">
              <button onClick={() => { navigate('/profile'); closeSidebar(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                <User className="w-5 h-5" /> <span>Profile</span>
              </button>
              <button onClick={() => { navigate('/settings'); closeSidebar(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                <Settings className="w-5 h-5" /> <span>Settings</span>
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