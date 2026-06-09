import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase, getCurrentUser } from '../utils/api';
import type { Profile } from '../types';

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_KEY = 'novelgram_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(() => {
    // استعادة سريعة من localStorage لتفادي شاشة بيضاء
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // مستمع لـ Supabase Auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await getCurrentUser();
        setUser(profile);
        if (profile) localStorage.setItem(USER_KEY, JSON.stringify(profile));
      } else {
        setUser(null);
        localStorage.removeItem(USER_KEY);
      }
      setIsLoading(false);
    });

    // فحص أولي
    checkUser();

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    try {
      const profile = await getCurrentUser();
      setUser(profile);
      if (profile) localStorage.setItem(USER_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  const updateUser = (updates: Partial<Profile>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  async function signUp(email: string, password: string, username: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) throw authError;

    if (authData.user) {
      await supabase.from('profiles').insert({ id: authData.user.id, username, role: 'reader' });
      const profile = await getCurrentUser();
      setUser(profile);
      if (profile) localStorage.setItem(USER_KEY, JSON.stringify(profile));
    }
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data.user) {
      const profile = await getCurrentUser();
      setUser(profile);
      if (profile) localStorage.setItem(USER_KEY, JSON.stringify(profile));
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }

  async function refreshUser() {
    await checkUser();
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}