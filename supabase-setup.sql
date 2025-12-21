-- ============================================
-- Supabase Database Setup for AI Chat Platform
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (if you need a fresh start)
-- ============================================
-- Uncomment these lines if you want to start fresh:
-- DROP TABLE IF EXISTS feedback CASCADE;
-- DROP TABLE IF EXISTS chat_history CASCADE;
-- DROP TABLE IF EXISTS chat_shares CASCADE;
-- DROP TABLE IF EXISTS chats CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- CREATE USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT,
  image TEXT,
  provider TEXT DEFAULT 'credentials',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE CHAT_HISTORY TABLE (Main Table)
-- Stores individual chat conversations with prompt/response pairs
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  title TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback TEXT NOT NULL,
  user_email TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE CHAT_SHARES TABLE (for sharing chats)
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_by TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Chat_history table indexes
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_is_deleted ON public.chat_history(is_deleted);
CREATE INDEX IF NOT EXISTS idx_chat_history_pinned ON public.chat_history(pinned DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_updated_at ON public.chat_history(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON public.chat_history(created_at DESC);

-- Feedback table indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user_email ON public.feedback(user_email);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- Chat_shares table indexes
CREATE INDEX IF NOT EXISTS idx_chat_shares_chat_id ON public.chat_shares(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_shares_token ON public.chat_shares(token);

-- ============================================
-- AUTO-UPDATE TIMESTAMP FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CREATE TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================
-- Trigger for users table
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Trigger for chat_history table
DROP TRIGGER IF EXISTS set_chat_history_updated_at ON public.chat_history;
CREATE TRIGGER set_chat_history_updated_at
  BEFORE UPDATE ON public.chat_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_shares ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP EXISTING POLICIES (if any)
-- ============================================
DROP POLICY IF EXISTS "Allow all for users" ON public.users;
DROP POLICY IF EXISTS "Allow all for chat_history" ON public.chat_history;
DROP POLICY IF EXISTS "Allow all for feedback" ON public.feedback;
DROP POLICY IF EXISTS "Allow all for chat_shares" ON public.chat_shares;

-- ============================================
-- CREATE RLS POLICIES (PERMISSIVE FOR NOW)
-- ============================================
-- Users table - allow all operations
CREATE POLICY "Allow all for users"
  ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Chat_history table - allow all operations
CREATE POLICY "Allow all for chat_history"
  ON public.chat_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Feedback table - allow all operations
CREATE POLICY "Allow all for feedback"
  ON public.feedback
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Chat_shares table - allow all operations
CREATE POLICY "Allow all for chat_shares"
  ON public.chat_shares
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- VERIFY TABLES WERE CREATED
-- ============================================
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'chat_history', 'feedback', 'chat_shares')
ORDER BY table_name;

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- You should see 4 tables: users, chat_history, feedback, chat_shares
-- chat_shares enables sharing chat conversations via unique links

