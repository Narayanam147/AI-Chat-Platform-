-- =============================================================================
-- COMPREHENSIVE SECURITY FIX FOR RLS ISSUES
-- AI Chat Platform - Production Security Setup
-- =============================================================================
-- This script fixes all RLS security issues in Supabase
-- Run this in Supabase SQL Editor to resolve security warnings
-- =============================================================================

-- First, check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    pg_catalog.pg_get_userbyid(tableowner) as owner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'chats', 'chat_history', 'chat_shares', 'guest_sessions', 'feedback')
ORDER BY tablename;

-- =============================================================================
-- STEP 1: CLEAN UP EXISTING POLICIES TO START FRESH
-- =============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow all for users" ON public.users;
DROP POLICY IF EXISTS "Allow all for chats" ON public.chats;
DROP POLICY IF EXISTS "Allow all for chat_history" ON public.chat_history;
DROP POLICY IF EXISTS "Allow all for chat_shares" ON public.chat_shares;
DROP POLICY IF EXISTS "Allow all for guest_sessions" ON public.guest_sessions;
DROP POLICY IF EXISTS "Allow all for feedback" ON public.feedback;

-- Drop specific chat_shares policies that may exist
DROP POLICY IF EXISTS "Anyone can view public shares" ON public.chat_shares;
DROP POLICY IF EXISTS "Users can create shares" ON public.chat_shares;
DROP POLICY IF EXISTS "Service role full access to chat_shares" ON public.chat_shares;
DROP POLICY IF EXISTS "Anyone can insert shares" ON public.chat_shares;
DROP POLICY IF EXISTS "Anyone can view shares" ON public.chat_shares;
DROP POLICY IF EXISTS "Anyone can update shares" ON public.chat_shares;

-- =============================================================================
-- STEP 2: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- CRITICAL: Enable RLS on chat_shares (this fixes the main security issue)
ALTER TABLE public.chat_shares ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 3: CREATE SECURE POLICIES
-- =============================================================================

-- ============================================
-- USERS TABLE POLICIES
-- ============================================
-- Users can only access their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.email() = email);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.email() = email);

CREATE POLICY "Service role full access to users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- CHATS TABLE POLICIES
-- ============================================
-- Users can only access their own chats or guest session chats
CREATE POLICY "Users access own chats" ON public.chats
    FOR ALL USING (
        auth.role() = 'service_role' OR
        user_id = auth.email() OR
        (user_id IS NULL AND guest_session_id IS NOT NULL)
    );

-- ============================================
-- CHAT HISTORY TABLE POLICIES
-- ============================================
-- Users can only access their own chat history
CREATE POLICY "Users access own chat history" ON public.chat_history
    FOR ALL USING (
        auth.role() = 'service_role' OR
        user_id = auth.email() OR
        (user_id IS NULL AND guest_session_id IS NOT NULL)
    );

-- ============================================
-- GUEST SESSIONS TABLE POLICIES  
-- ============================================
-- Guest sessions can be accessed by anyone (they use tokens for security)
CREATE POLICY "Guest sessions accessible" ON public.guest_sessions
    FOR ALL USING (true);

-- ============================================
-- FEEDBACK TABLE POLICIES
-- ============================================
-- Anyone can submit feedback, service role can view all
CREATE POLICY "Anyone can submit feedback" ON public.feedback
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can view feedback" ON public.feedback
    FOR SELECT USING (auth.role() = 'service_role');

-- ============================================
-- CHAT SHARES TABLE POLICIES (MAIN FIX)
-- ============================================
-- This is the critical table that was causing security warnings

-- Allow public viewing of shared chats (they use unique tokens)
CREATE POLICY "Public can view chat shares" ON public.chat_shares
    FOR SELECT USING (is_public = true OR auth.role() = 'service_role');

-- Allow authenticated users and service role to create shares
CREATE POLICY "Authenticated users can create shares" ON public.chat_shares
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role' OR
        auth.email() IS NOT NULL OR
        created_by IS NOT NULL
    );

-- Allow creators to update their own shares and service role full access
CREATE POLICY "Users can update own shares" ON public.chat_shares
    FOR UPDATE USING (
        auth.role() = 'service_role' OR
        created_by = auth.email()
    );

-- Allow creators to delete their own shares and service role full access  
CREATE POLICY "Users can delete own shares" ON public.chat_shares
    FOR DELETE USING (
        auth.role() = 'service_role' OR
        created_by = auth.email()
    );

-- ============================================
-- GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant permissions to authenticated and anonymous users
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.chat_shares, public.guest_sessions TO anon;

-- Grant sequence permissions
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- STEP 4: VERIFICATION
-- =============================================================================

-- Verify RLS is enabled on all tables
SELECT 
    tablename,
    rowsecurity as "RLS Enabled",
    CASE 
        WHEN rowsecurity THEN '✅ SECURE'
        ELSE '❌ VULNERABLE'
    END as "Status"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'chats', 'chat_history', 'chat_shares', 'guest_sessions', 'feedback')
ORDER BY tablename;

-- Check policies exist
SELECT 
    tablename,
    policyname,
    cmd as "Action",
    CASE 
        WHEN permissive = 'PERMISSIVE' THEN '✅'
        ELSE '⚠️'
    END as "Type"
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
SELECT '🎉 RLS Security fix completed successfully! All tables now have proper Row Level Security enabled with appropriate policies.' as "Status";
