-- =============================================================================
-- SECURITY AUDIT: Check RLS Status Across All Tables
-- Use this to identify all security issues in your Supabase database
-- =============================================================================

-- Check RLS status for all public tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS_Enabled",
    CASE 
        WHEN rowsecurity THEN '✅ SECURE'
        ELSE '❌ VULNERABLE'
    END as "Security_Status",
    pg_catalog.pg_get_userbyid(tableowner) as "Owner"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY 
    CASE WHEN rowsecurity THEN 1 ELSE 0 END,  -- Show vulnerable tables first
    tablename;

-- =============================================================================
-- Check which tables have policies but RLS disabled (main security issue)
-- =============================================================================
WITH rls_status AS (
    SELECT tablename, rowsecurity
    FROM pg_tables 
    WHERE schemaname = 'public'
),
policy_count AS (
    SELECT tablename, COUNT(*) as policy_count
    FROM pg_policies 
    WHERE schemaname = 'public'
    GROUP BY tablename
)
SELECT 
    r.tablename,
    r.rowsecurity as "RLS_Enabled",
    COALESCE(p.policy_count, 0) as "Policy_Count",
    CASE 
        WHEN r.rowsecurity = false AND COALESCE(p.policy_count, 0) > 0 
        THEN '🚨 CRITICAL: Has policies but RLS disabled'
        WHEN r.rowsecurity = false AND COALESCE(p.policy_count, 0) = 0 
        THEN '⚠️ WARNING: No RLS and no policies'
        WHEN r.rowsecurity = true AND COALESCE(p.policy_count, 0) = 0 
        THEN '⚠️ WARNING: RLS enabled but no policies'
        WHEN r.rowsecurity = true AND COALESCE(p.policy_count, 0) > 0 
        THEN '✅ SECURE: RLS enabled with policies'
        ELSE '❓ UNKNOWN STATUS'
    END as "Security_Analysis"
FROM rls_status r
LEFT JOIN policy_count p ON r.tablename = p.tablename
WHERE r.tablename IN ('users', 'chats', 'chat_history', 'chat_shares', 'guest_sessions', 'feedback')
ORDER BY 
    CASE 
        WHEN r.rowsecurity = false AND COALESCE(p.policy_count, 0) > 0 THEN 1  -- Critical first
        WHEN r.rowsecurity = false THEN 2  -- Warning next
        ELSE 3  -- Secure last
    END,
    r.tablename;

-- =============================================================================
-- Show all existing policies
-- =============================================================================
SELECT 
    '📋 CURRENT POLICIES:' as "Info";

SELECT 
    tablename,
    policyname,
    cmd as "Action",
    permissive,
    roles::text as "Roles"
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================================================
-- Specific security recommendations
-- =============================================================================
SELECT 
    '🔧 SECURITY RECOMMENDATIONS:' as "Recommendations";

-- Find tables that need immediate attention
WITH security_issues AS (
    SELECT 
        t.tablename,
        t.rowsecurity,
        COALESCE(COUNT(p.policyname), 0) as policy_count
    FROM pg_tables t
    LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
    WHERE t.schemaname = 'public'
    AND t.tablename IN ('users', 'chats', 'chat_history', 'chat_shares', 'guest_sessions', 'feedback')
    GROUP BY t.tablename, t.rowsecurity
)
SELECT 
    tablename,
    CASE 
        WHEN NOT rowsecurity AND policy_count > 0 
        THEN 'Run: ALTER TABLE public.' || tablename || ' ENABLE ROW LEVEL SECURITY;'
        WHEN NOT rowsecurity AND policy_count = 0 
        THEN 'Add RLS policies and then enable RLS for ' || tablename
        WHEN rowsecurity AND policy_count = 0 
        THEN 'Add security policies for ' || tablename || ' (RLS enabled but no policies)'
        ELSE 'Table ' || tablename || ' appears to be secure'
    END as "Action_Required"
FROM security_issues
ORDER BY 
    CASE 
        WHEN NOT rowsecurity AND policy_count > 0 THEN 1
        WHEN NOT rowsecurity THEN 2  
        WHEN policy_count = 0 THEN 3
        ELSE 4
    END;

-- =============================================================================
-- Quick fix commands for immediate issues
-- =============================================================================
SELECT 
    '⚡ QUICK FIX COMMANDS:' as "Quick_Fix";

-- Generate fix commands for tables with policies but RLS disabled
WITH fix_needed AS (
    SELECT DISTINCT p.tablename
    FROM pg_policies p
    JOIN pg_tables t ON p.tablename = t.tablename AND p.schemaname = t.schemaname
    WHERE t.schemaname = 'public' 
    AND NOT t.rowsecurity
    AND t.tablename IN ('users', 'chats', 'chat_history', 'chat_shares', 'guest_sessions', 'feedback')
)
SELECT 
    'ALTER TABLE public.' || tablename || ' ENABLE ROW LEVEL SECURITY;' as "SQL_Command"
FROM fix_needed;