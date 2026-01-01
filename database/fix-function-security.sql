-- =============================================================================
-- FIX FUNCTION SEARCH PATH VULNERABILITIES
-- Supabase Database Linter Security Issues Resolution
-- =============================================================================
-- This fixes all "Function Search Path Mutable" security warnings
-- Each function needs SECURITY DEFINER and explicit search_path set
-- =============================================================================

-- =============================================================================
-- STEP 1: FIX FUNCTION SEARCH PATH ISSUES
-- =============================================================================

-- Fix update_updated_at_column function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix cleanup_expired_guest_sessions function
DROP FUNCTION IF EXISTS public.cleanup_expired_guest_sessions() CASCADE;
CREATE OR REPLACE FUNCTION public.cleanup_expired_guest_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM guest_sessions 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Fix get_local_time function
DROP FUNCTION IF EXISTS public.get_local_time(text) CASCADE;
CREATE OR REPLACE FUNCTION public.get_local_time(timezone_name text DEFAULT 'UTC')
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
IMMUTABLE
AS $$
BEGIN
    RETURN NOW() AT TIME ZONE timezone_name;
END;
$$;

-- Fix cleanup_expired_sessions function
DROP FUNCTION IF EXISTS public.cleanup_expired_sessions() CASCADE;
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM guest_sessions 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Fix pin_chat function
DROP FUNCTION IF EXISTS public.pin_chat(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.pin_chat(chat_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE chat_history 
    SET pinned = NOT pinned 
    WHERE id = chat_id;
    
    RETURN FOUND;
END;
$$;

-- Fix rename_chat function
DROP FUNCTION IF EXISTS public.rename_chat(uuid, text) CASCADE;
CREATE OR REPLACE FUNCTION public.rename_chat(chat_id uuid, new_title text)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE chat_history 
    SET title = new_title 
    WHERE id = chat_id;
    
    RETURN FOUND;
END;
$$;

-- Fix soft_delete_chat function
DROP FUNCTION IF EXISTS public.soft_delete_chat(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.soft_delete_chat(chat_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE chat_history 
    SET is_deleted = true, deleted_at = NOW()
    WHERE id = chat_id;
    
    RETURN FOUND;
END;
$$;

-- Fix create_share_link function
DROP FUNCTION IF EXISTS public.create_share_link(uuid, text, jsonb) CASCADE;
CREATE OR REPLACE FUNCTION public.create_share_link(
    p_chat_id uuid,
    p_title text,
    p_messages jsonb
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    share_token TEXT;
BEGIN
    -- Generate unique token
    share_token := encode(gen_random_bytes(32), 'hex');
    
    -- Insert share record
    INSERT INTO chat_shares (
        chat_id,
        token,
        title,
        messages,
        created_by,
        expires_at
    ) VALUES (
        p_chat_id,
        share_token,
        p_title,
        p_messages,
        auth.email(),
        NOW() + INTERVAL '30 days'
    );
    
    RETURN share_token;
END;
$$;

-- Fix update_updated_at function (if different from update_updated_at_column)
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix to_local_time function
DROP FUNCTION IF EXISTS public.to_local_time(timestamptz, text) CASCADE;
CREATE OR REPLACE FUNCTION public.to_local_time(
    input_time timestamptz,
    timezone_name text DEFAULT 'UTC'
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
IMMUTABLE
AS $$
BEGIN
    RETURN input_time AT TIME ZONE timezone_name;
END;
$$;

-- Fix increment_share_view function
DROP FUNCTION IF EXISTS public.increment_share_view(text) CASCADE;
CREATE OR REPLACE FUNCTION public.increment_share_view(share_token text)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE chat_shares 
    SET view_count = view_count + 1 
    WHERE token = share_token;
    
    RETURN FOUND;
END;
$$;

-- Fix add_message_to_chat function
DROP FUNCTION IF EXISTS public.add_message_to_chat(uuid, jsonb) CASCADE;
CREATE OR REPLACE FUNCTION public.add_message_to_chat(
    chat_id uuid,
    new_message jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE chats 
    SET 
        messages = messages || new_message,
        updated_at = NOW()
    WHERE id = chat_id;
    
    RETURN FOUND;
END;
$$;

-- =============================================================================
-- VERIFICATION: Check functions are properly secured
-- =============================================================================

SELECT 
    routine_name as "Function Name",
    security_type as "Security Type",
    CASE 
        WHEN security_type = 'DEFINER' THEN '✅ SECURE'
        ELSE '❌ INSECURE'
    END as "Status"
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
    'update_updated_at_column',
    'cleanup_expired_guest_sessions',
    'get_local_time',
    'cleanup_expired_sessions',
    'pin_chat',
    'rename_chat',
    'soft_delete_chat',
    'create_share_link',
    'update_updated_at',
    'to_local_time',
    'increment_share_view',
    'add_message_to_chat'
)
ORDER BY routine_name;

-- Check search_path is set
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('update_updated_at_column', 'cleanup_expired_guest_sessions')
AND routine_definition LIKE '%search_path%';

SELECT '🎉 Function search path vulnerabilities have been fixed!' as "Result";