import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helpers
export async function signUp(email: string, password: string, username: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username,
        role: 'reader'
      });

    if (profileError) throw profileError;
  }

  return authData;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

// Novels
export async function getNovels(filters?: {
  genre?: string;
  status?: string;
  search?: string;
  sort?: 'trending' | 'new' | 'popular' | 'rating';
}) {
  let query = supabase
    .from('novels')
    .select('*, author:profiles(*), chapters:chapters(count)')
    .eq('is_published', true);

  if (filters?.genre && filters.genre !== 'all') {
    query = query.contains('genre', [filters.genre]);
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  switch (filters?.sort) {
    case 'trending':
      query = query.order('views', { ascending: false });
      break;
    case 'new':
      query = query.order('created_at', { ascending: false });
      break;
    case 'popular':
      query = query.order('views', { ascending: false });
      break;
    case 'rating':
      query = query.order('rating', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getNovelById(id: string) {
  const { data, error } = await supabase
    .from('novels')
    .select('*, author:profiles(*), chapters:chapters(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createNovel(novel: Partial<Novel>) {
  const { data, error } = await supabase
    .from('novels')
    .insert(novel)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateNovel(id: string, updates: Partial<Novel>) {
  const { data, error } = await supabase
    .from('novels')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Chapters
export async function getChapters(novelId: string) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('novel_id', novelId)
    .eq('is_published', true)
    .order('chapter_number', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getChapterById(id: string) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*, novel:novels(*)')
    .eq('id', id)
    .single();

  if (error) throw error;

  // Increment views
  await supabase
    .from('chapters')
    .update({ views: (data.views || 0) + 1 })
    .eq('id', id);

  return data;
}

export async function createChapter(chapter: Partial<Chapter>) {
  const { data, error } = await supabase
    .from('chapters')
    .insert(chapter)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Library
export async function getLibrary(userId: string) {
  const { data, error } = await supabase
    .from('library')
    .select('*, novel:novels(*)')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

export async function addToLibrary(userId: string, novelId: string, status: string = 'reading') {
  const { data, error } = await supabase
    .from('library')
    .upsert({
      user_id: userId,
      novel_id: novelId,
      status,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateLibraryStatus(libraryId: string, status: string) {
  const { data, error } = await supabase
    .from('library')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', libraryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFromLibrary(libraryId: string) {
  const { error } = await supabase
    .from('library')
    .delete()
    .eq('id', libraryId);

  if (error) throw error;
}

// Comments
export async function getComments(chapterId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, user:profiles(*)')
    .eq('chapter_id', chapterId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addComment(comment: Partial<Comment>) {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select('*, user:profiles(*)')
    .single();

  if (error) throw error;
  return data;
}

// Ratings
export async function getRatings(novelId: string) {
  const { data, error } = await supabase
    .from('ratings')
    .select('*, user:profiles(*)')
    .eq('novel_id', novelId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function rateNovel(userId: string, novelId: string, rating: number, review?: string) {
  const { data, error } = await supabase
    .from('ratings')
    .upsert({
      user_id: userId,
      novel_id: novelId,
      rating,
      review
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Follows
export async function followNovel(userId: string, novelId: string) {
  const { data, error } = await supabase
    .from('follows')
    .insert({
      follower_id: userId,
      novel_id: novelId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unfollowNovel(userId: string, novelId: string) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', userId)
    .eq('novel_id', novelId);

  if (error) throw error;
}

export async function isFollowingNovel(userId: string, novelId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', userId)
    .eq('novel_id', novelId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

// Notifications
export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

// Stats
export async function getNovelStats(novelId: string, days: number = 30) {
  const { data, error } = await supabase
    .from('novel_stats')
    .select('*')
    .eq('novel_id', novelId)
    .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}
