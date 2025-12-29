-- ============================================
-- FIX GUEST USER SEARCH - DATABASE CONFIGURATION
-- Run this in Supabase SQL Editor to ensure guest search works properly
-- ============================================

-- Ensure chat_history table has guest_session_id column
ALTER TABLE public.chat_history 
ADD COLUMN IF NOT EXISTS guest_session_id UUID REFERENCES public.guest_sessions(id) ON DELETE CASCADE;

-- Create index for guest sessions in chat_history
CREATE INDEX IF NOT EXISTS idx_chat_history_guest_session_id ON public.chat_history(guest_session_id);

-- Add constraint to ensure either user_id or guest_session_id is set
ALTER TABLE public.chat_history 
DROP CONSTRAINT IF EXISTS chat_history_user_or_guest_check;

ALTER TABLE public.chat_history 
ADD CONSTRAINT chat_history_user_or_guest_check 
CHECK (user_id IS NOT NULL OR guest_session_id IS NOT NULL);

-- Enable RLS for chat_history if not already enabled
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all for chat_history" ON public.chat_history;
DROP POLICY IF EXISTS "Users can view their own chat history" ON public.chat_history;
DROP POLICY IF EXISTS "Guests can view their own chat history" ON public.chat_history;

-- Create permissive policy for chat_history (allows all operations)
-- This is simplified for ease of use. In production, you might want more restrictive policies.
CREATE POLICY "Allow all for chat_history"
  ON public.chat_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify the schema
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'chat_history'
ORDER BY ordinal_position;

-- Verify indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'chat_history';

-- Verify constraints
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.chat_history'::regclass;

-- Test guest session lookup
SELECT 
  id, 
  session_token, 
  created_at,
  expires_at,
  last_activity
FROM public.guest_sessions
ORDER BY created_at DESC
LIMIT 5;

-- Count chat_history entries by type
SELECT 
  CASE 
    WHEN user_id IS NOT NULL THEN 'Authenticated User'
    WHEN guest_session_id IS NOT NULL THEN 'Guest User'
    ELSE 'Orphaned'
  END AS user_type,
  COUNT(*) as count
FROM public.chat_history
WHERE is_deleted = false
GROUP BY 
  CASE 
    WHEN user_id IS NOT NULL THEN 'Authenticated User'
    WHEN guest_session_id IS NOT NULL THEN 'Guest User'
    ELSE 'Orphaned'
  END;
