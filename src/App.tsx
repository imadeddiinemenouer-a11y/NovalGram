import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

import DiscoverPage from './pages/DiscoverPage';
import LibraryPage from './pages/LibraryPage';
import BookmarksPage from './pages/BookmarksPage';
import StudioPage from './pages/StudioPage';
import ProfilePage from './pages/ProfilePage';
import NovelPage from './pages/NovelPage';
import ChapterPage from './pages/ChapterPage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import WalletPage from './pages/WalletPage';
import FeatureStorePage from './pages/FeatureStorePage';
import AdRewardsPage from './pages/AdRewardsPage';
import LanguageNovelsPage from './pages/LanguageNovelsPage';
import NotificationsPage from './pages/NotificationsPage';
import NewNovelPage from './pages/NewNovelPage';
import StudioChaptersPage from './pages/StudioChaptersPage';
import EditNovelPage from './pages/EditNovelPage';
import AuthorPage from './pages/AuthorPage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: '#363636', color: '#fff' }}} />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<DiscoverPage />} />
                <Route path="library" element={<LibraryPage />} />
                <Route path="bookmarks" element={<BookmarksPage />} />
                <Route path="studio" element={<StudioPage />} />
                <Route path="studio/new" element={<NewNovelPage />} />
                <Route path="studio/edit/:novelId" element={<EditNovelPage />} />
                <Route path="studio/chapters/:novelId" element={<StudioChaptersPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="novel/:id" element={<NovelPage />} />
                <Route path="chapter/:chapterId" element={<ChapterPage />} />
                <Route path="author/:authorId" element={<AuthorPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="store" element={<FeatureStorePage />} />
                <Route path="rewards" element={<AdRewardsPage />} />
                <Route path="language/:langCode" element={<LanguageNovelsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;