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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'novelgram_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // أي تغيير في المستخدم -> نخزنه مباشرة
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  function buildLocalUser(id: string, email?: string, username?: string): Profile {
    const name = username || email?.split('@')[0] || 'user';
    return {
      id,
      username: name,
      display_name: name,
      bio: null,
      avatar_url: null,
      role: 'reader',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Profile;
  }

  async function signUp(email: string, password: string, username: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) throw authError;

    if (authData.user) {
      await supabase.from('profiles').insert({
        id: authData.user.id,
        username,
        role: 'reader',
      });
      // بناء مستخدم محلي وتسجيله فوراً
      const local = buildLocalUser(authData.user.id, authData.user.email, username);
      setUser(local);
    }
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data.user) {
      const profile = await getCurrentUser();
      const finalUser = profile || buildLocalUser(data.user.id, data.user.email);
      setUser(finalUser);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function refreshUser() {
    const profile = await getCurrentUser();
    if (profile) setUser(profile);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}