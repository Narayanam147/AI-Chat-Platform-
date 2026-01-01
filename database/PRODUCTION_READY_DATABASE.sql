-- ============================================
-- PRODUCTION-READY DATABASE SETUP
-- AI Chat Platform - Complete Schema
-- ============================================
-- This SQL will create all tables with proper relationships
-- Paste this ENTIRE script into Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in correct order (children first)
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS chat_shares CASCADE;
DROP TABLE IF EXISTS chat_history CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS guest_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT,
  image TEXT,
  provider TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GUEST SESSIONS TABLE
-- ============================================
CREATE TABLE public.guest_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHATS TABLE
-- Stores full chat conversations with messages array
-- ============================================
CREATE TABLE public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,  -- Stores email (string) for compatibility with current code
  guest_session_id UUID,
  messages JSONB DEFAULT '[]'::jsonb NOT NULL,
  title TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (guest_session_id) REFERENCES public.guest_sessions(id) ON DELETE CASCADE,
  CHECK ((user_id IS NOT NULL AND guest_session_id IS NULL) OR (user_id IS NULL AND guest_session_id IS NOT NULL))
);

-- ============================================
-- CHAT HISTORY TABLE
-- Stores individual chat entries (legacy support)
-- ============================================
CREATE TABLE public.chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,  -- Stores email (string)
  guest_session_id UUID,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  title TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (guest_session_id) REFERENCES public.guest_sessions(id) ON DELETE CASCADE,
  CHECK ((user_id IS NOT NULL AND guest_session_id IS NULL) OR (user_id IS NULL AND guest_session_id IS NOT NULL))
);

-- ============================================
-- CHAT SHARES TABLE
-- For shareable chat links (snapshot approach - like Gemini)
-- ============================================
CREATE TABLE public.chat_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID,  -- Optional: legacy support for linking to chats table
  token TEXT UNIQUE NOT NULL,
  title TEXT DEFAULT 'Shared Chat',
  messages JSONB,  -- Embedded messages snapshot
  created_by TEXT,  -- Email of creator
  expires_at TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE
);

-- ============================================
-- FEEDBACK TABLE
-- User feedback and support tickets
-- ============================================
CREATE TABLE public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback TEXT NOT NULL,
  user_email TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_guest_session_id ON public.chats(guest_session_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON public.chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_is_deleted ON public.chats(is_deleted);
CREATE INDEX IF NOT EXISTS idx_feedback_user_email ON public.feedback(user_email);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_guest_session_id ON public.chat_history(guest_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON public.chat_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_is_deleted ON public.chat_history(is_deleted);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_token ON public.guest_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_chat_shares_chat_id ON public.chat_shares(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_shares_token ON public.chat_shares(token);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_chats ON public.chats;
CREATE TRIGGER set_updated_at_chats
  BEFORE UPDATE ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_chat_history ON public.chat_history;
CREATE TRIGGER set_updated_at_chat_history
  BEFORE UPDATE ON public.chat_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_shares ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all for users" ON public.users;
DROP POLICY IF EXISTS "Allow all for chats" ON public.chats;
DROP POLICY IF EXISTS "Allow all for chat_history" ON public.chat_history;
DROP POLICY IF EXISTS "Allow all for feedback" ON public.feedback;
DROP POLICY IF EXISTS "Allow all for guest_sessions" ON public.guest_sessions;
DROP POLICY IF EXISTS "Allow all for chat_shares" ON public.chat_shares;

-- Create permissive policies (adjust based on your security needs)
CREATE POLICY "Allow all for users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for chats" ON public.chats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for chat_history" ON public.chat_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for feedback" ON public.feedback FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for guest_sessions" ON public.guest_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for chat_shares" ON public.chat_shares FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
SELECT 'Database setup complete! All tables created successfully.' as status;

-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'chats', 'chat_history', 'chat_shares', 'guest_sessions', 'feedback')
ORDER BY table_name;
