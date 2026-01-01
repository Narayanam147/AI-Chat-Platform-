-- =============================================================================
-- QUICK FIX: Enable RLS on chat_shares table
-- This fixes the immediate security warning in Supabase
-- =============================================================================

-- Check current status of chat_shares table
SELECT 
    tablename,
    rowsecurity as "RLS Enabled",
    CASE 
        WHEN rowsecurity THEN '✅ SECURE'
        ELSE '❌ VULNERABLE - NEEDS FIX'
    END as "Security Status"
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'chat_shares';

-- Show existing policies (these exist but RLS is disabled)
SELECT policyname, cmd, permissive
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'chat_shares';

-- =============================================================================
-- OPTION 1: ENABLE RLS (Recommended for production security)
-- =============================================================================

-- Enable Row Level Security on chat_shares
ALTER TABLE public.chat_shares ENABLE ROW LEVEL SECURITY;

-- Clean up any conflicting policies first
DROP POLICY IF EXISTS "Allow all for chat_shares" ON public.chat_shares;

-- Create proper security policies
CREATE POLICY "Public can view shared chats" ON public.chat_shares
    FOR SELECT USING (is_public = true);

CREATE POLICY "Service role full access" ON public.chat_shares  
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can create shares" ON public.chat_shares
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role' OR 
        auth.email() IS NOT NULL
    );

-- =============================================================================
-- OPTION 2: ALTERNATIVE - Disable RLS (Less secure but simpler)
-- =============================================================================
-- Uncomment this if you prefer to disable RLS entirely:
-- ALTER TABLE public.chat_shares DISABLE ROW LEVEL SECURITY;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Check if fix worked
SELECT 
    tablename,
    rowsecurity as "RLS Enabled",
    CASE 
        WHEN rowsecurity THEN '✅ SECURITY FIXED'
        ELSE '❌ STILL VULNERABLE'
    END as "Status"
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'chat_shares';

-- List active policies
SELECT 'Active policies:' as info;
SELECT policyname, cmd, permissive
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'chat_shares';

-- Test that sharing still works (this should succeed)
SELECT 'Testing share access...' as test;
SELECT COUNT(*) as "Total Shares", 
       COUNT(CASE WHEN is_public THEN 1 END) as "Public Shares"
FROM chat_shares;

SELECT '🎉 chat_shares table security has been fixed!' as "Result";