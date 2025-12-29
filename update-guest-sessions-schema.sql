-- ============================================
-- Update guest_sessions table schema
-- Adds missing columns to match API expectations
-- Run this in Supabase SQL Editor
-- ============================================

-- Add user_agent column if it doesn't exist
ALTER TABLE public.guest_sessions 
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Add last_activity column if it doesn't exist
ALTER TABLE public.guest_sessions 
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW();

-- Verify the schema
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'guest_sessions'
ORDER BY ordinal_position;

-- Expected columns:
-- 1. id (UUID) - PRIMARY KEY
-- 2. session_token (TEXT) - UNIQUE NOT NULL
-- 3. user_agent (TEXT) - NULL
-- 4. created_at (TIMESTAMPTZ) - DEFAULT NOW()
-- 5. expires_at (TIMESTAMPTZ) - DEFAULT (NOW() + INTERVAL '30 days')
-- 6. last_activity (TIMESTAMPTZ) - DEFAULT NOW()

COMMENT ON TABLE public.guest_sessions IS 'Stores guest user sessions for unauthenticated chat access';
COMMENT ON COLUMN public.guest_sessions.id IS 'Unique identifier for guest session';
COMMENT ON COLUMN public.guest_sessions.session_token IS 'Unique token used to identify guest user';
COMMENT ON COLUMN public.guest_sessions.user_agent IS 'Browser user agent string for session tracking';
COMMENT ON COLUMN public.guest_sessions.created_at IS 'When the guest session was created';
COMMENT ON COLUMN public.guest_sessions.expires_at IS 'When the session expires (default 30 days)';
COMMENT ON COLUMN public.guest_sessions.last_activity IS 'Last activity timestamp for session cleanup';
