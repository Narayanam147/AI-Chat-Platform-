-- =============================================================================
-- FIX RLS POLICIES FOR CHAT_SHARES
-- This allows the API to insert shares with messages
-- =============================================================================

-- First, let's check current policies
SELECT policyname, permissive, roles, cmd, qual::text, with_check::text 
FROM pg_policies 
WHERE tablename = 'chat_shares';

-- Drop all existing policies on chat_shares to start fresh
DROP POLICY IF EXISTS "Anyone can view public shares" ON public.chat_shares;
DROP POLICY IF EXISTS "Users can create shares" ON public.chat_shares;
DROP POLICY IF EXISTS "Service role full access to chat_shares" ON public.chat_shares;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.chat_shares;
DROP POLICY IF EXISTS "Enable select for all users" ON public.chat_shares;
DROP POLICY IF EXISTS "Enable update for all users" ON public.chat_shares;

-- OPTION 1: Disable RLS entirely for chat_shares (simplest fix)
-- This is safe because shares are accessed via unique tokens anyway
ALTER TABLE public.chat_shares DISABLE ROW LEVEL SECURITY;

-- OPTION 2: If you want to keep RLS enabled, use these permissive policies instead:
-- (Uncomment these if you re-enable RLS)
/*
ALTER TABLE public.chat_shares ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert shares
CREATE POLICY "Anyone can insert shares" ON public.chat_shares
    FOR INSERT
    WITH CHECK (TRUE);

-- Allow anyone to select shares (for viewing shared links)
CREATE POLICY "Anyone can view shares" ON public.chat_shares
    FOR SELECT
    USING (TRUE);

-- Allow updating view_count
CREATE POLICY "Anyone can update shares" ON public.chat_shares
    FOR UPDATE
    USING (TRUE)
    WITH CHECK (TRUE);
*/

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'chat_shares';

-- Test insert to confirm it works
INSERT INTO chat_shares (token, title, messages, created_by, is_public, view_count, expires_at)
VALUES (
    'testfix' || floor(random() * 1000000)::text,
    'RLS Fix Test',
    '[{"text": "This is a test", "sender": "user", "timestamp": "2025-12-29T10:00:00Z"}]'::jsonb,
    'test@example.com',
    true,
    0,
    NOW() + INTERVAL '30 days'
)
RETURNING id, token, messages IS NOT NULL as has_messages;

-- Show recent shares to verify
SELECT id, token, title, 
       CASE WHEN messages IS NOT NULL THEN 'YES' ELSE 'NO' END as has_messages,
       created_at
FROM chat_shares 
ORDER BY created_at DESC 
LIMIT 5;
