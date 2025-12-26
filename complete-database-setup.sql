-- ============================================
-- COMPLETE DATABASE SETUP WITH GUEST USER SUPPORT
-- AI Chat Platform - Run this ONCE in Supabase SQL Editor
-- This combines base setup + guest user features
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PART 1: DROP EXISTING TABLES (Fresh Start)
-- ============================================
DROP TABLE IF EXISTS public.chat_shares CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.chat_history CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.guest_sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- PART 2: CREATE BASE TABLES
-- ============================================

-- 1. USERS TABLE
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT,
  image TEXT,
  provider TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GUEST_SESSIONS TABLE (Create BEFORE chats for foreign key)
CREATE TABLE public.guest_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CHAT_HISTORY TABLE (Main table for chats)
CREATE TABLE public.chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  title TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CHATS TABLE (With guest support from the start)
CREATE TABLE public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  guest_session_id UUID REFERENCES public.guest_sessions(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]'::jsonb NOT NULL,
  title TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Constraint: either user_id or guest_session_id must be set
  CONSTRAINT chats_user_or_guest_check 
    CHECK (user_id IS NOT NULL OR guest_session_id IS NOT NULL)
);

-- 5. FEEDBACK TABLE
CREATE TABLE public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback TEXT NOT NULL,
  user_email TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CHAT_SHARES TABLE (With public sharing support)
CREATE TABLE public.chat_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL,
  token TEXT NOT NULL,
  created_by TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);

-- Guest sessions indexes
CREATE INDEX idx_guest_sessions_token ON public.guest_sessions(session_token);
CREATE INDEX idx_guest_sessions_expires ON public.guest_sessions(expires_at);

-- Chat history indexes
CREATE INDEX idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX idx_chat_history_created_at ON public.chat_history(created_at DESC);
CREATE INDEX idx_chat_history_is_deleted ON public.chat_history(is_deleted);

-- Chats indexes
CREATE INDEX idx_chats_user_id ON public.chats(user_id);
CREATE INDEX idx_chats_guest_session ON public.chats(guest_session_id);
CREATE INDEX idx_chats_updated_at ON public.chats(updated_at DESC);

-- Feedback indexes
CREATE INDEX idx_feedback_user_email ON public.feedback(user_email);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);

-- Chat shares indexes
CREATE INDEX idx_chat_shares_chat_id ON public.chat_shares(chat_id);
CREATE INDEX idx_chat_shares_token ON public.chat_shares(token);
CREATE INDEX idx_chat_shares_public ON public.chat_shares(is_public) WHERE is_public = true;

-- ============================================
-- PART 4: AUTO-UPDATE TIMESTAMP FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 5: CREATE TRIGGERS
-- ============================================
CREATE TRIGGER set_updated_at_chats
  BEFORE UPDATE ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_chat_history
  BEFORE UPDATE ON public.chat_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- PART 6: ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_shares ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 7: CREATE RLS POLICIES
-- ============================================

-- Users policies
CREATE POLICY "Allow all for users" 
  ON public.users 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Guest sessions policies
CREATE POLICY "Allow all for guest_sessions"
  ON public.guest_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Chat history policies
CREATE POLICY "Allow all for chat_history" 
  ON public.chat_history 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Chats policies (supports both authenticated and guest users)
CREATE POLICY "Allow all for chats"
  ON public.chats
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Feedback policies
CREATE POLICY "Allow all for feedback" 
  ON public.feedback 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Chat shares policies (allows public viewing)
CREATE POLICY "Allow all for chat_shares"
  ON public.chat_shares
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PART 8: UTILITY FUNCTIONS
-- ============================================

-- Timezone conversion function (for IST display)
CREATE OR REPLACE FUNCTION to_local_time(utc_time TIMESTAMPTZ)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN utc_time AT TIME ZONE 'Asia/Kolkata';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Cleanup expired guest sessions
CREATE OR REPLACE FUNCTION cleanup_expired_guest_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.guest_sessions 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 9: VERIFICATION
-- ============================================

-- Verify all tables were created
SELECT 
  'Tables Created' as check_type,
  table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns c 
   WHERE c.table_name = t.table_name AND c.table_schema = 'public') as columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'guest_sessions', 'chat_history', 'chats', 'feedback', 'chat_shares')
ORDER BY table_name;

-- Verify chats table structure
SELECT 
  'Chats Table Structure' as check_type,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'chats'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify guest_sessions table structure
SELECT 
  'Guest Sessions Structure' as check_type,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'guest_sessions'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify constraints
SELECT 
  'Constraints' as check_type,
  constraint_name,
  table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND constraint_name IN ('chats_user_or_guest_check', 'chats_guest_session_id_fkey')
ORDER BY table_name, constraint_name;

-- Verify indexes
SELECT 
  'Indexes' as check_type,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('chats', 'guest_sessions', 'chat_shares')
ORDER BY tablename, indexname;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 
  '✅ DATABASE SETUP COMPLETE!' as status,
  'All 6 tables created with guest user support' as details,
  NOW() as completed_at;

-- ============================================
-- NEXT STEPS
-- ============================================
SELECT 'NEXT STEPS:' as step, '1. Deploy your Next.js application' as action
UNION ALL
SELECT 'NEXT STEPS:', '2. Test guest user functionality (no login)'
UNION ALL
SELECT 'NEXT STEPS:', '3. Test chat sharing with generated links'
UNION ALL
SELECT 'NEXT STEPS:', '4. Test guest-to-user migration on signup'
UNION ALL
SELECT 'NEXT STEPS:', '5. Check QUICK_START_GUEST.md for details';

-- ============================================
-- OPTIONAL: Insert test data (uncomment if needed)
-- ============================================
/*
-- Test guest session
INSERT INTO guest_sessions (session_token) 
VALUES ('test-guest-token-123');

-- Test user
INSERT INTO users (email, name) 
VALUES ('test@example.com', 'Test User');

-- Test guest chat
INSERT INTO chats (guest_session_id, messages, title)
SELECT id, '[{"text":"Hello","sender":"user","timestamp":"2025-01-01T00:00:00Z"}]'::jsonb, 'Test Guest Chat'
FROM guest_sessions WHERE session_token = 'test-guest-token-123';

SELECT 'Test data inserted!' as status;
*/
