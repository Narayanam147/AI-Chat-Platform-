-- ============================================
-- Guest User Support for AI Chat Platform
-- Run this SQL in Supabase SQL Editor after supabase-setup.sql
-- ============================================

-- ============================================
-- CREATE GUEST_SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.guest_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_guest_sessions_token ON public.guest_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_expires ON public.guest_sessions(expires_at);

-- ============================================
-- MODIFY CHATS TABLE TO SUPPORT GUEST USERS
-- ============================================
-- Add guest_session_id column if not exists
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS guest_session_id UUID REFERENCES public.guest_sessions(id) ON DELETE CASCADE;

-- Update user_id to allow null (for guest users)
ALTER TABLE public.chats ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint: either user_id or guest_session_id must be set
ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_user_or_guest_check;
ALTER TABLE public.chats ADD CONSTRAINT chats_user_or_guest_check 
  CHECK (user_id IS NOT NULL OR guest_session_id IS NOT NULL);

-- Add index for guest sessions
CREATE INDEX IF NOT EXISTS idx_chats_guest_session ON public.chats(guest_session_id);

-- ============================================
-- UPDATE CHAT_SHARES TABLE FOR PUBLIC ACCESS
-- ============================================
-- Add is_public flag to allow viewing without authentication
ALTER TABLE public.chat_shares ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE public.chat_shares ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add index
CREATE INDEX IF NOT EXISTS idx_chat_shares_public ON public.chat_shares(is_public);

-- ============================================
-- ENABLE RLS FOR GUEST_SESSIONS
-- ============================================
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if any
DROP POLICY IF EXISTS "Allow all for guest_sessions" ON public.guest_sessions;

-- Create permissive policy for guest sessions
CREATE POLICY "Allow all for guest_sessions"
  ON public.guest_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- UPDATE EXISTING POLICIES FOR CHATS
-- ============================================
-- Drop and recreate to include guest access
DROP POLICY IF EXISTS "Allow all for chats" ON public.chats;

CREATE POLICY "Allow all for chats"
  ON public.chats
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ENABLE RLS FOR CHAT_SHARES
-- ============================================
ALTER TABLE public.chat_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for chat_shares" ON public.chat_shares;

-- Create policy for public read access on shared chats
CREATE POLICY "Allow all for chat_shares"
  ON public.chat_shares
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- CLEANUP FUNCTION FOR EXPIRED GUEST SESSIONS
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_guest_sessions()
RETURNS void AS $$
BEGIN
  -- Delete expired guest sessions (cascades to chats)
  DELETE FROM public.guest_sessions 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CREATE SCHEDULED JOB (Optional - Supabase Edge Functions)
-- Note: You may need to set this up via Supabase dashboard
-- or use a cron job service
-- ============================================
-- This would typically be done via Supabase Edge Functions
-- or an external cron service

-- ============================================
-- VERIFY NEW SCHEMA
-- ============================================
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('guest_sessions', 'chats', 'chat_shares')
ORDER BY table_name;

-- Show guest_sessions columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'guest_sessions'
ORDER BY ordinal_position;

-- Show updated chats columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'chats'
ORDER BY ordinal_position;
