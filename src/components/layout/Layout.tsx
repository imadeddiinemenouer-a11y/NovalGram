import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] transition-colors">
      <TopBar />
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}