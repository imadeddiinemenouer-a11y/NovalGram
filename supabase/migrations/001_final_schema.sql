-- ============================================================
-- NOVELGRAM v3.0 - FINAL SCHEMA
-- Features: Multilingual, BSC Payments, Ad Rewards, Premium Chapters, Direct Support
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (Users)
-- ============================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'reader' CHECK (role IN ('reader', 'author', 'admin')),
    interface_language TEXT DEFAULT 'en',
    content_languages TEXT[] DEFAULT '{"en"}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- NOVELS (With language support)
-- ============================================================
CREATE TABLE novels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'hiatus', 'dropped')),
    genre TEXT[] DEFAULT '{}',
    language TEXT DEFAULT 'en',
    word_count INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- CHAPTERS (With premium pricing)
-- ============================================================
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    chapter_number INTEGER NOT NULL,
    word_count INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    price_ngc INTEGER DEFAULT 0 CHECK (price_ngc >= 0 AND price_ngc <= 8),
    is_premium BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(novel_id, chapter_number)
);

-- ============================================================
-- LIBRARY
-- ============================================================
CREATE TABLE library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'reading' CHECK (status IN ('reading', 'completed', 'dropped', 'planned')),
    last_chapter_read INTEGER DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, novel_id)
);

-- ============================================================
-- BOOKMARKS
-- ============================================================
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
    page_position INTEGER DEFAULT 0,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- RATINGS
-- ============================================================
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, novel_id)
);

-- ============================================================
-- FOLLOWS
-- ============================================================
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (following_id IS NOT NULL AND novel_id IS NULL) OR
        (following_id IS NULL AND novel_id IS NOT NULL)
    )
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('new_chapter', 'comment', 'follow', 'mention', 'like', 'donation', 'ad_reward')),
    title TEXT NOT NULL,
    message TEXT,
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- USER BALANCES (NGC + USDT)
-- ============================================================
CREATE TABLE user_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    ngc_balance DECIMAL(20,2) DEFAULT 0 NOT NULL,
    usdt_balance DECIMAL(20,8) DEFAULT 0 NOT NULL,
    total_deposited DECIMAL(20,8) DEFAULT 0,
    total_withdrawn DECIMAL(20,8) DEFAULT 0,
    total_spent DECIMAL(20,2) DEFAULT 0,
    total_earned_ads DECIMAL(20,2) DEFAULT 0,
    total_earned_donations DECIMAL(20,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================
-- COIN TRANSACTIONS
-- ============================================================
CREATE TABLE coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'ad_reward', 'purchase', 'spend', 'withdraw', 'refund', 'bonus', 'direct_support', 'premium_chapter')),
    amount DECIMAL(20,2) NOT NULL,
    usdt_equivalent DECIMAL(20,8),
    description TEXT,
    payment_tx_id UUID,
    related_novel_id UUID REFERENCES novels(id),
    related_chapter_id UUID REFERENCES chapters(id),
    related_user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- PAYMENT TRANSACTIONS (BSC)
-- ============================================================
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    tx_hash TEXT UNIQUE NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    token_symbol TEXT DEFAULT 'USDT',
    token_contract TEXT DEFAULT '0x55d398326f99059fF775485246999027B3197955',
    chain TEXT DEFAULT 'bsc',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirming', 'confirmed', 'failed', 'refunded')),
    confirmations INTEGER DEFAULT 0,
    required_confirmations INTEGER DEFAULT 12,
    block_number BIGINT,
    gas_fee DECIMAL(20,18),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- WITHDRAWAL REQUESTS
-- ============================================================
CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    to_address TEXT NOT NULL,
    chain TEXT DEFAULT 'bsc',
    token_symbol TEXT DEFAULT 'USDT',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    tx_hash TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- AD REWARDS (Google AdSense)
-- ============================================================
CREATE TABLE ad_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    ad_type TEXT DEFAULT 'google_adsense' CHECK (ad_type IN ('google_adsense')),
    duration_seconds INTEGER DEFAULT 15,
    ngc_reward INTEGER DEFAULT 5,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    device_info TEXT,
    is_valid BOOLEAN DEFAULT true,
    UNIQUE(user_id, watched_at)
);

-- ============================================================
-- DAILY AD LIMITS
-- ============================================================
CREATE TABLE daily_ad_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    ads_watched INTEGER DEFAULT 0,
    ngc_earned INTEGER DEFAULT 0,
    max_ads INTEGER DEFAULT 20,
    max_ngc INTEGER DEFAULT 100,
    UNIQUE(user_id, date)
);

-- ============================================================
-- DIRECT SUPPORTS (Reader to Author)
-- ============================================================
CREATE TABLE direct_supports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    amount_ngc INTEGER NOT NULL CHECK (amount_ngc >= 10),
    message TEXT,
    platform_fee_percent DECIMAL(5,2) DEFAULT 5.00,
    platform_fee_ngc DECIMAL(20,2) DEFAULT 0,
    author_earns_ngc DECIMAL(20,2) DEFAULT 0,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- PREMIUM CHAPTER PURCHASES
-- ============================================================
CREATE TABLE premium_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    price_paid INTEGER NOT NULL,
    platform_fee_percent DECIMAL(5,2) DEFAULT 5.00,
    platform_fee_ngc DECIMAL(20,2) DEFAULT 0,
    author_earns_ngc DECIMAL(20,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- AUTHOR EARNINGS
-- ============================================================
CREATE TABLE author_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('ads', 'direct_support', 'premium_chapter', 'bonus', 'platform_reward')),
    amount_ngc DECIMAL(20,2) NOT NULL,
    amount_usdt DECIMAL(20,8),
    novel_id UUID REFERENCES novels(id),
    chapter_id UUID REFERENCES chapters(id),
    reader_id UUID REFERENCES profiles(id),
    description TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('pending', 'available', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- FEATURE STORE ITEMS
-- ============================================================
CREATE TABLE feature_store_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    price_ngc DECIMAL(20,2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('profile', 'comment', 'reading', 'novel', 'special')),
    duration_days INTEGER,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- USER FEATURES
-- ============================================================
CREATE TABLE user_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    feature_id UUID REFERENCES feature_store_items(id) ON DELETE CASCADE NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, feature_id)
);

-- ============================================================
-- LANGUAGE STATS
-- ============================================================
CREATE TABLE language_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    novel_count INTEGER DEFAULT 0,
    chapter_count INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_authors INTEGER DEFAULT 0,
    UNIQUE(language, date)
);

-- ============================================================
-- NOVEL TRANSLATIONS
-- ============================================================
CREATE TABLE novel_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    language TEXT NOT NULL,
    title TEXT,
    description TEXT,
    is_published BOOLEAN DEFAULT false,
    translator_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(novel_id, language)
);

-- ============================================================
-- USER LANGUAGE PREFERENCES
-- ============================================================
CREATE TABLE user_language_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    interface_language TEXT DEFAULT 'en',
    content_languages TEXT[] DEFAULT '{"en"}',
    auto_translate BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================
-- VERIFICATION LOGS
-- ============================================================
CREATE TABLE verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_hash TEXT NOT NULL,
    status TEXT NOT NULL,
    response_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_novels_author ON novels(author_id);
CREATE INDEX idx_novels_status ON novels(status);
CREATE INDEX idx_novels_genre ON novels USING GIN(genre);
CREATE INDEX idx_novels_language ON novels(language);
CREATE INDEX idx_chapters_novel ON chapters(novel_id);
CREATE INDEX idx_chapters_premium ON chapters(is_premium) WHERE is_premium = true;
CREATE INDEX idx_library_user ON library(user_id);
CREATE INDEX idx_comments_novel ON comments(novel_id);
CREATE INDEX idx_comments_chapter ON comments(chapter_id);
CREATE INDEX idx_ratings_novel ON ratings(novel_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_user_balances_user ON user_balances(user_id);
CREATE INDEX idx_coin_tx_user ON coin_transactions(user_id);
CREATE INDEX idx_coin_tx_type ON coin_transactions(type);
CREATE INDEX idx_payment_tx_hash ON payment_transactions(tx_hash);
CREATE INDEX idx_payment_user ON payment_transactions(user_id);
CREATE INDEX idx_ad_rewards_user ON ad_rewards(user_id);
CREATE INDEX idx_daily_limits_user ON daily_ad_limits(user_id);
CREATE INDEX idx_direct_supports_author ON direct_supports(author_id);
CREATE INDEX idx_direct_supports_supporter ON direct_supports(supporter_id);
CREATE INDEX idx_premium_purchases_user ON premium_purchases(user_id);
CREATE INDEX idx_premium_purchases_chapter ON premium_purchases(chapter_id);
CREATE INDEX idx_author_earnings_author ON author_earnings(author_id);
CREATE INDEX idx_user_features_user ON user_features(user_id);
CREATE INDEX idx_novel_translations_novel ON novel_translations(novel_id);
CREATE INDEX idx_novel_translations_lang ON novel_translations(language);
CREATE INDEX idx_language_stats_lang ON language_stats(language);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Update novel rating
CREATE OR REPLACE FUNCTION update_novel_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE novels
    SET rating = (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM ratings
        WHERE novel_id = NEW.novel_id
    ),
    total_ratings = (
        SELECT COUNT(*)
        FROM ratings
        WHERE novel_id = NEW.novel_id
    )
    WHERE id = NEW.novel_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_after_insert
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_novel_rating();

-- Update word count
CREATE OR REPLACE FUNCTION update_word_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE novels
    SET word_count = (
        SELECT COALESCE(SUM(word_count), 0)
        FROM chapters
        WHERE novel_id = NEW.novel_id AND is_published = true
    )
    WHERE id = NEW.novel_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_word_count_after_chapter_change
AFTER INSERT OR UPDATE OR DELETE ON chapters
FOR EACH ROW
EXECUTE FUNCTION update_word_count();

-- Calculate direct support fees
CREATE OR REPLACE FUNCTION calculate_support_fees()
RETURNS TRIGGER AS $$
BEGIN
    NEW.platform_fee_ngc := NEW.amount_ngc * NEW.platform_fee_percent / 100;
    NEW.author_earns_ngc := NEW.amount_ngc - NEW.platform_fee_ngc;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_support_fees_trigger
BEFORE INSERT ON direct_supports
FOR EACH ROW
EXECUTE FUNCTION calculate_support_fees();

-- Calculate premium purchase fees
CREATE OR REPLACE FUNCTION calculate_premium_fees()
RETURNS TRIGGER AS $$
BEGIN
    NEW.platform_fee_ngc := NEW.price_paid * NEW.platform_fee_percent / 100;
    NEW.author_earns_ngc := NEW.price_paid - NEW.platform_fee_ngc;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_premium_fees_trigger
BEFORE INSERT ON premium_purchases
FOR EACH ROW
EXECUTE FUNCTION calculate_premium_fees();

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE library ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_ad_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_supports ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE novel_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_language_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Novels
CREATE POLICY "Novels are viewable by everyone"
ON novels FOR SELECT USING (is_published = true OR auth.uid() = author_id);
CREATE POLICY "Authors can create novels"
ON novels FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own novels"
ON novels FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own novels"
ON novels FOR DELETE USING (auth.uid() = author_id);

-- Chapters
CREATE POLICY "Chapters are viewable by everyone"
ON chapters FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM novels WHERE novels.id = chapters.novel_id 
        AND (novels.is_published = true OR novels.author_id = auth.uid())
    )
);
CREATE POLICY "Authors can manage chapters"
ON chapters FOR ALL USING (
    EXISTS (
        SELECT 1 FROM novels WHERE novels.id = chapters.novel_id AND novels.author_id = auth.uid()
    )
);

-- Library
CREATE POLICY "Users can view own library"
ON library FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own library"
ON library FOR ALL USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "Comments are viewable by everyone"
ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments"
ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments"
ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE USING (auth.uid() = user_id);

-- Ratings
CREATE POLICY "Ratings are viewable by everyone"
ON ratings FOR SELECT USING (true);
CREATE POLICY "Users can manage own ratings"
ON ratings FOR ALL USING (auth.uid() = user_id);

-- Follows
CREATE POLICY "Follows are viewable by everyone"
ON follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows"
ON follows FOR ALL USING (auth.uid() = follower_id);

-- Notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- User Balances
CREATE POLICY "Users can view own balance"
ON user_balances FOR SELECT USING (auth.uid() = user_id);

-- Coin Transactions
CREATE POLICY "Users can view own transactions"
ON coin_transactions FOR SELECT USING (auth.uid() = user_id);

-- Payment Transactions
CREATE POLICY "Users can view own payments"
ON payment_transactions FOR SELECT USING (auth.uid() = user_id);

-- Withdrawal Requests
CREATE POLICY "Users can view own withdrawals"
ON withdrawal_requests FOR SELECT USING (auth.uid() = user_id);

-- Ad Rewards
CREATE POLICY "Users can view own ad rewards"
ON ad_rewards FOR SELECT USING (auth.uid() = user_id);

-- Daily Ad Limits
CREATE POLICY "Users can view own limits"
ON daily_ad_limits FOR SELECT USING (auth.uid() = user_id);

-- Direct Supports
CREATE POLICY "Users can view own supports"
ON direct_supports FOR SELECT USING (auth.uid() = supporter_id OR auth.uid() = author_id);

-- Premium Purchases
CREATE POLICY "Users can view own purchases"
ON premium_purchases FOR SELECT USING (auth.uid() = user_id);

-- Author Earnings
CREATE POLICY "Authors can view own earnings"
ON author_earnings FOR SELECT USING (auth.uid() = author_id);

-- Feature Store Items
CREATE POLICY "Feature store items are viewable by everyone"
ON feature_store_items FOR SELECT USING (is_active = true);

-- User Features
CREATE POLICY "Users can view own features"
ON user_features FOR SELECT USING (auth.uid() = user_id);

-- Language Stats
CREATE POLICY "Language stats are viewable by everyone"
ON language_stats FOR SELECT USING (true);

-- Novel Translations
CREATE POLICY "Novel translations are viewable by everyone"
ON novel_translations FOR SELECT USING (true);

-- User Language Preferences
CREATE POLICY "Users can manage own language preferences"
ON user_language_preferences FOR ALL USING (auth.uid() = user_id);

-- Verification Logs
CREATE POLICY "Verification logs are viewable by everyone"
ON verification_logs FOR SELECT USING (true);

-- ============================================================
-- DEFAULT DATA
-- ============================================================

-- Insert default feature store items
INSERT INTO feature_store_items (name, description, icon, price_ngc, category, duration_days, sort_order) VALUES
('Username Color', 'Change your username color to stand out', 'Palette', 500, 'profile', NULL, 1),
('VIP Badge', 'Show everyone you are a VIP supporter', 'Crown', 2000, 'profile', NULL, 2),
('Animated Avatar', 'Add animation effects to your avatar', 'Sparkles', 1500, 'profile', NULL, 3),
('Comment Highlight', 'Make your comments stand out with special styling', 'MessageSquare', 300, 'comment', NULL, 4),
('Early Access', 'Read new chapters 24 hours before everyone else', 'Clock', 500, 'reading', NULL, 5),
('Novel Badge', 'Special badge displayed on your novel', 'BookOpen', 1000, 'novel', NULL, 6),
('Custom Theme', 'Unlock custom reading themes', 'Paintbrush', 800, 'reading', NULL, 7),
('Supporter Star', 'Show your support with a special star badge', 'Star', 100, 'profile', 30, 8);
