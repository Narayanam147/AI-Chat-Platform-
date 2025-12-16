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
  provider TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE CHATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb NOT NULL,
  title TEXT,
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
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON public.chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_user_email ON public.feedback(user_email);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

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
-- CREATE TRIGGER FOR CHATS
-- ============================================
DROP TRIGGER IF EXISTS set_updated_at ON public.chats;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP EXISTING POLICIES (if any)
-- ============================================
DROP POLICY IF EXISTS "Allow all for users" ON public.users;
DROP POLICY IF EXISTS "Allow all for chats" ON public.chats;
DROP POLICY IF EXISTS "Allow all for feedback" ON public.feedback;

-- ============================================
-- CREATE RLS POLICIES (PERMISSIVE FOR NOW)
-- ============================================
-- Users table - allow all operations
CREATE POLICY "Allow all for users"
  ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Chats table - allow all operations
CREATE POLICY "Allow all for chats"
  ON public.chats
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Feedback table - allow all operations
CREATE POLICY "Allow all for feedback"
  ON public.feedback
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- VERIFY TABLES WERE CREATED
-- ============================================
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'chats', 'feedback')
ORDER BY table_name;
