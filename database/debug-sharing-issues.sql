-- ============================================
-- VERIFY AND DEBUG SHARING ISSUES
-- Run these queries in Supabase SQL Editor
-- ============================================

-- 1. Check if chat_shares table exists and has correct schema
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'chat_shares'
ORDER BY ordinal_position;

-- 2. Check if there are any shares created
SELECT 
  id,
  chat_id,
  token,
  created_by,
  is_public,
  view_count,
  expires_at,
  created_at
FROM public.chat_shares
ORDER BY created_at DESC
LIMIT 10;

-- 3. Verify the specific chat exists in chats table
SELECT 
  id,
  user_id,
  guest_session_id,
  title,
  is_deleted,
  created_at,
  jsonb_array_length(messages) as message_count
FROM public.chats
WHERE id = '1381c6a4-63c2-4c9b-81b8-67b3acd87481';

-- 4. Check RLS policies on chat_shares table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'chat_shares';

-- 5. Manually create a test share for the chat (for testing)
-- Replace the UUID with your actual chat ID
INSERT INTO public.chat_shares (chat_id, token, created_by, is_public, expires_at)
VALUES (
  '1381c6a4-63c2-4c9b-81b8-67b3acd87481',
  encode(gen_random_bytes(16), 'hex'),
  'sarvanmdubey@gmail.com',
  true,
  NOW() + INTERVAL '30 days'
)
RETURNING 
  id,
  token,
  '/shared/' || id || '?t=' || token as share_link;

-- 6. Verify chat_history table has guest_session_id column
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'chat_history'
ORDER BY ordinal_position;

-- 7. Count records in chat_history vs chats
SELECT 
  'chats' as table_name,
  COUNT(*) as record_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT guest_session_id) as unique_guests
FROM public.chats
WHERE NOT is_deleted

UNION ALL

SELECT 
  'chat_history' as table_name,
  COUNT(*) as record_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT guest_session_id) as unique_guests
FROM public.chat_history
WHERE NOT is_deleted;

-- 8. Check if there are any orphaned chats (no messages)
SELECT 
  id,
  user_id,
  title,
  jsonb_array_length(messages) as message_count,
  created_at
FROM public.chats
WHERE jsonb_array_length(messages) = 0
  AND NOT is_deleted
ORDER BY created_at DESC
LIMIT 10;
