-- =============================================================================
-- PRODUCTION DATABASE FIX SCRIPT
-- Run this in your Supabase SQL Editor to fix pin and share functionality
-- =============================================================================

-- ============================================
-- FIX 1: Add pinned column to chats table
-- This fixes the 500 error on PATCH /api/history/:id
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chats' 
        AND column_name = 'pinned'
    ) THEN
        ALTER TABLE public.chats ADD COLUMN pinned BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added pinned column to chats table';
    ELSE
        RAISE NOTICE 'pinned column already exists in chats table';
    END IF;
END $$;

-- Create index for faster queries on pinned chats
CREATE INDEX IF NOT EXISTS idx_chats_pinned ON public.chats(pinned) WHERE pinned = TRUE;

-- ============================================
-- FIX 2: Ensure chat_shares table has correct schema
-- This fixes the 400 error on POST /api/share
-- ============================================

-- Check if chat_shares table exists, create if not
CREATE TABLE IF NOT EXISTS public.chat_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID,
    token TEXT UNIQUE NOT NULL,
    title TEXT DEFAULT 'Shared Chat',
    messages JSONB,
    created_by TEXT,
    expires_at TIMESTAMPTZ,
    is_public BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add messages column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chat_shares' 
        AND column_name = 'messages'
    ) THEN
        ALTER TABLE public.chat_shares ADD COLUMN messages JSONB;
        RAISE NOTICE 'Added messages column to chat_shares table';
    END IF;
    
    -- Add title column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chat_shares' 
        AND column_name = 'title'
    ) THEN
        ALTER TABLE public.chat_shares ADD COLUMN title TEXT DEFAULT 'Shared Chat';
        RAISE NOTICE 'Added title column to chat_shares table';
    END IF;
    
    -- Add is_public column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chat_shares' 
        AND column_name = 'is_public'
    ) THEN
        ALTER TABLE public.chat_shares ADD COLUMN is_public BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added is_public column to chat_shares table';
    END IF;
    
    -- Add view_count column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chat_shares' 
        AND column_name = 'view_count'
    ) THEN
        ALTER TABLE public.chat_shares ADD COLUMN view_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added view_count column to chat_shares table';
    END IF;
    
    -- Add created_by column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chat_shares' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.chat_shares ADD COLUMN created_by TEXT;
        RAISE NOTICE 'Added created_by column to chat_shares table';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_shares_token ON public.chat_shares(token);
CREATE INDEX IF NOT EXISTS idx_chat_shares_created_by ON public.chat_shares(created_by);

-- ============================================
-- FIX 3: Enable RLS policies for chat_shares
-- ============================================

-- Enable RLS
ALTER TABLE public.chat_shares ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate clean)
DROP POLICY IF EXISTS "Anyone can view public shares" ON public.chat_shares;
DROP POLICY IF EXISTS "Users can create shares" ON public.chat_shares;
DROP POLICY IF EXISTS "Service role full access to chat_shares" ON public.chat_shares;

-- Policy: Anyone can view public shares (for viewing shared links)
CREATE POLICY "Anyone can view public shares" ON public.chat_shares
    FOR SELECT
    USING (is_public = TRUE OR created_by = auth.jwt() ->> 'email');

-- Policy: Authenticated users can create shares
CREATE POLICY "Users can create shares" ON public.chat_shares
    FOR INSERT
    WITH CHECK (TRUE);

-- Policy: Service role has full access (for API operations)
CREATE POLICY "Service role full access to chat_shares" ON public.chat_shares
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- VERIFICATION: Check the current schema
-- ============================================

-- Verify chats table columns
SELECT 'CHATS TABLE COLUMNS:' as info;
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'chats'
ORDER BY ordinal_position;

-- Verify chat_shares table columns
SELECT 'CHAT_SHARES TABLE COLUMNS:' as info;
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'chat_shares'
ORDER BY ordinal_position;

-- Check if everything is in place
SELECT 'VERIFICATION SUMMARY:' as info;
SELECT 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'chats' AND column_name = 'pinned') > 0 as chats_has_pinned,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'chat_shares' AND column_name = 'messages') > 0 as chat_shares_has_messages,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'chat_shares' AND column_name = 'title') > 0 as chat_shares_has_title,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'chat_shares' AND column_name = 'is_public') > 0 as chat_shares_has_is_public;
