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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // محاولة تحميل المستخدم عند فتح الموقع
  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await getCurrentUser();
        setUser(profile || buildLocalUser(session.user.id, session.user.email));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // دالة مساعدة لبناء كائن مستخدم محلي في حال عدم وجود بروفايل
  function buildLocalUser(id: string, email?: string): Profile {
    return {
      id,
      username: email?.split('@')[0] || 'user',
      display_name: email?.split('@')[0] || 'User',
      bio: null,
      avatar_url: null,
      role: 'reader',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Profile;
  }

  async function checkUser() {
    try {
      const profile = await getCurrentUser();
      setUser(profile);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(email: string, password: string, username: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      // محاولة إدراج البروفايل
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          role: 'reader'
        });

      if (profileError) {
        console.warn('Could not insert profile, using local user');
      }

      // بناء كائن مستخدم مباشرة وتسجيل الدخول
      const localUser = buildLocalUser(authData.user.id, authData.user.email);
      setUser(localUser);
    }
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // محاولة جلب البروفايل الحقيقي، وإلا استخدم المحلي
      const profile = await getCurrentUser();
      setUser(profile || buildLocalUser(data.user.id, data.user.email));
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }

  async function refreshUser() {
    await checkUser();
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