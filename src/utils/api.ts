// Minimal dummy API for build (replace with real Supabase later)

// Simple Supabase mock
export const supabase = {
  from: () => ({
    select: () => ({
      eq: () => ({ single: async () => ({ data: null, error: null }) }),
      order: () => ({ limit: async () => ({ data: [], error: null }) })
    }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ error: null })
  }),
  rpc: async () => ({ data: null, error: null }),
  auth: {
    signUp: async () => ({ data: { user: { id: 'mock' } }, error: null }),
    signInWithPassword: async () => ({ data: { user: { id: 'mock' } }, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null } })
  }
};

// Auth
export async function signUp(email: string, password: string, username: string) { return { user: { id: 'mock' } }; }
export async function signIn(email: string, password: string) { return { user: { id: 'mock' } }; }
export async function signOut() {}
export async function getCurrentUser() { return null; }

// Novels
export async function getNovels(filters?: any) { return []; }
export async function getNovelById(id: string) { return {} as any; }
export async function createNovel(novel: any) { return {} as any; }
export async function updateNovel(id: string, updates: any) { return {} as any; }

// Chapters
export async function getChapters(novelId: string) { return []; }
export async function getChapterById(id: string) { return {} as any; }
export async function createChapter(chapter: any) { return {} as any; }

// Library
export async function getLibrary(userId: string) { return []; }
export async function addToLibrary(userId: string, novelId: string, status?: string) { return {} as any; }
export async function updateLibraryStatus(libraryId: string, status: string) { return {} as any; }
export async function removeFromLibrary(libraryId: string) {}

// Comments
export async function getComments(chapterId: string) { return []; }
export async function addComment(comment: any) { return {} as any; }

// Ratings
export async function getRatings(novelId: string) { return []; }
export async function rateNovel(userId: string, novelId: string, rating: number, review?: string) { return {} as any; }

// Follows
export async function followNovel(userId: string, novelId: string) { return {} as any; }
export async function unfollowNovel(userId: string, novelId: string) {}
export async function isFollowingNovel(userId: string, novelId: string) { return false; }

// Notifications
export async function getNotifications(userId: string) { return []; }
export async function markNotificationAsRead(notificationId: string) {}

// Stats
export async function getNovelStats(novelId: string, days?: number) { return []; }

// Extra functions needed by current pages
export async function processDeposit(userId: string, amount: number) { return { success: true, message: 'Deposit processed' }; }
export async function getUserBalance(userId: string) { return { ngc_balance: 1000, usdt_balance: 500 }; }
export async function requestWithdrawal(userId: string, amount: number) { return { success: true, message: 'Withdrawal requested' }; }
export async function getFeatureStoreItems() { return []; }
export async function purchaseFeature(userId: string, featureId: string) { return { success: true, message: 'Feature purchased' }; }
export async function getUserFeatures(userId: string) { return []; }