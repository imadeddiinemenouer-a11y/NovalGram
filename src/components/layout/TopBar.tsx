import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TopBar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {showSearch ? (
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Search novels, authors..."
              className="flex-1 px-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="button" onClick={() => setShowSearch(false)} className="p-2">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </form>
        ) : (
          <>
            <h1 
              className="text-xl font-bold text-indigo-600 cursor-pointer"
              onClick={() => navigate('/')}
            >
              Novelgram
            </h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowSearch(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium text-sm"
              >
                {user?.display_name?.[0] || user?.username?.[0] || 'U'}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}