// ============================================================
// محاكي Supabase شامل – يعيد بيانات وهمية لكل الدوال
// ============================================================

// دالة مساعدة لإنشاء كائن وهمي يدعم التسلسل
function createMockQuery() {
  const handler: any = {
    get(target: any, prop: string) {
      if (prop === 'then') return undefined;
      return new Proxy(() => {}, {
        apply() {
          return createMockQuery();
        }
      });
    }
  };
  const mockPromise = Promise.resolve({ data: [], error: null });
  const proxy: any = new Proxy(mockPromise, handler);
  return proxy;
}

export const supabase: any = {
  from: () => createMockQuery(),
  rpc: () => createMockQuery(),
  auth: {
    signUp: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
    signInWithPassword: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: {}, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
};

// ===== البيانات الوهمية =====
const MOCK_NOVELS = [
  {
    id: '1', title: 'Heir of the Shattered Stars', description: 'A fallen star changes everything.',
    author: { display_name: 'Sara Al-Ghalib', username: 'sara_g' },
    author_id: 'a1', genre: ['Fantasy'], status: 'ongoing', rating: 4.9, views: 2400000,
    word_count: 120000, chapters: [], created_at: '2026-01-01', updated_at: '2026-05-01',
    cover_image: null, is_published: true, total_ratings: 8600,
  },
  {
    id: '2', title: 'The Last String', description: 'Music that predicts the future.',
    author: { display_name: 'Lina Haddad', username: 'lina_h' },
    author_id: 'a2', genre: ['Romance'], status: 'ongoing', rating: 4.8, views: 3100000,
    word_count: 150000, chapters: [], created_at: '2026-02-01', updated_at: '2026-05-10',
    cover_image: null, is_published: true, total_ratings: 10200,
  },
  {
    id: '3', title: 'Blue Code 2087', description: 'A fatal flaw in the AI.',
    author: { display_name: 'Mazen Al-Rashid', username: 'mazen_r' },
    author_id: 'a3', genre: ['Sci-Fi'], status: 'completed', rating: 4.6, views: 1200000,
    word_count: 80000, chapters: [], created_at: '2026-03-01', updated_at: '2026-04-20',
    cover_image: null, is_published: true, total_ratings: 5400,
  },
];

// ===== AUTH =====
export async function signUp(email: string, password: string, username: string) {
  return { user: { id: 'mock-user-id', email } };
}

export async function signIn(email: string, password: string) {
  return { user: { id: 'mock-user-id', email } };
}

export async function signOut() {}

export async function getCurrentUser() {
  return {
    id: 'mock-user-id',
    username: 'mockuser',
    display_name: 'Mock User',
    bio: 'This is a mock user for testing.',
    avatar_url: null,
    role: 'reader',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };
}

// ===== NOVELS =====
export async function getNovels(filters?: any) {
  return MOCK_NOVELS;
}

export async function getNovelById(id: string) {
  return MOCK_NOVELS[0];
}

export async function createNovel(novel: any) {
  return { id: 'new-novel-id', ...novel };
}

export async function updateNovel(id: string, updates: any) {
  return { id, ...updates };
}

// ===== CHAPTERS =====
export async function getChapters(novelId: string) {
  return [];
}

export async function getChapterById(id: string) {
  return {
    id,
    novel_id: '1',
    title: 'Mock Chapter',
    content: 'This is mock chapter content.\n\nIt has multiple paragraphs.\n\nEnjoy reading!',
    chapter_number: 1,
    word_count: 1500,
    views: 48000,
    novel: { author: 'Sara Al-Ghalib' },
  };
}

export async function createChapter(chapter: any) {
  return { id: 'new-chapter-id', ...chapter };
}

// ===== LIBRARY =====
export async function getLibrary(userId: string) {
  return [];
}

export async function addToLibrary(userId: string, novelId: string, status: string = 'reading') {
  return { id: 'lib-1', user_id: userId, novel_id: novelId, status };
}

export async function updateLibraryStatus(libraryId: string, status: string) {
  return { id: libraryId, status };
}

export async function removeFromLibrary(libraryId: string) {}

// ===== COMMENTS =====
export async function getComments(chapterId: string) {
  return [];
}

export async function addComment(comment: any) {
  return { id: 'comment-1', ...comment, user: { display_name: 'Mock User', username: 'mockuser' } };
}

// ===== RATINGS =====
export async function getRatings(novelId: string) {
  return [];
}

export async function rateNovel(userId: string, novelId: string, rating: number, review?: string) {
  return { user_id: userId, novel_id: novelId, rating, review };
}

// ===== FOLLOWS =====
export async function followNovel(userId: string, novelId: string) {
  return { follower_id: userId, novel_id: novelId };
}

export async function unfollowNovel(userId: string, novelId: string) {}

export async function isFollowingNovel(userId: string, novelId: string) {
  return false;
}

// ===== NOTIFICATIONS =====
export async function getNotifications(userId: string) {
  return [];
}

export async function markNotificationAsRead(notificationId: string) {}

// ===== STATS =====
export async function getNovelStats(novelId: string, days: number = 30) {
  return [];
}

// ===== BALANCE & PAYMENTS =====
export async function getUserBalance(userId: string) {
  return { ngc_balance: 1250, usdt_balance: 0 };
}

export async function processDeposit(userId: string, txHash: string) {
  return { success: true, message: 'Deposit processed' };
}

export async function requestWithdrawal(userId: string, amount: number, address: string) {
  return { success: true, message: 'Withdrawal requested' };
}

// ===== STORAGE =====
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  return 'https://via.placeholder.com/150';
}

export async function uploadCover(novelId: string, file: File): Promise<string | null> {
  return 'https://via.placeholder.com/300x450';
}

// ===== FEATURE STORE =====
export async function getFeatureStoreItems() {
  return [];
}

export async function purchaseFeature(userId: string, featureId: string) {
  return { success: true, message: 'Feature purchased' };
}

export async function getUserFeatures(userId: string) {
  return [];
}

export async function processAdReward(userId: string, durationSeconds: number) {
  return { success: true, message: `Earned ${durationSeconds === 15 ? 5 : 3} NGC!` };
}

export async function getDailyAdStats(userId: string) {
  return { ads_watched: 0, max_ads: 20, ngc_earned: 0, max_ngc: 100 };
}