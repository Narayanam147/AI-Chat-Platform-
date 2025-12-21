-- ============================================
-- Migration: Copy data from chats table to chat_history table
-- This converts JSONB messages array into prompt/response rows
-- ============================================

-- First, verify the chats table exists and has data
SELECT 
  'chats table' as table_name,
  COUNT(*) as record_count
FROM public.chats;

-- ============================================
-- STEP 1: Migrate data from chats to chat_history
-- ============================================
-- This extracts the first user message as prompt and first AI message as response
INSERT INTO public.chat_history (
  id,
  user_id,
  prompt,
  response,
  title,
  pinned,
  is_deleted,
  deleted_at,
  created_at,
  updated_at
)
SELECT 
  c.id,
  c.user_id,
  -- Extract first user message as prompt
  COALESCE(
    (SELECT m->>'text' 
     FROM jsonb_array_elements(c.messages) m 
     WHERE m->>'sender' = 'user' 
     LIMIT 1),
    'No prompt found'
  ) as prompt,
  -- Extract first AI message as response
  COALESCE(
    (SELECT m->>'text' 
     FROM jsonb_array_elements(c.messages) m 
     WHERE m->>'sender' = 'ai' 
     LIMIT 1),
    'No response found'
  ) as response,
  c.title,
  c.pinned,
  c.is_deleted,
  c.deleted_at,
  c.created_at,
  c.updated_at
FROM public.chats c
ON CONFLICT (id) DO UPDATE SET
  prompt = EXCLUDED.prompt,
  response = EXCLUDED.response,
  title = EXCLUDED.title,
  pinned = EXCLUDED.pinned,
  is_deleted = EXCLUDED.is_deleted,
  deleted_at = EXCLUDED.deleted_at,
  updated_at = EXCLUDED.updated_at;

-- ============================================
-- STEP 2: Verify migration
-- ============================================
SELECT 
  'Migration Summary' as status,
  (SELECT COUNT(*) FROM public.chats) as chats_count,
  (SELECT COUNT(*) FROM public.chat_history) as chat_history_count;

-- Show sample of migrated data
SELECT 
  id,
  user_id,
  LEFT(prompt, 50) as prompt_preview,
  LEFT(response, 50) as response_preview,
  title,
  created_at
FROM public.chat_history
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- OPTIONAL: Drop chats table after successful migration
-- ============================================
-- ONLY run this after verifying the migration was successful!
-- Uncomment the line below to drop the old chats table:
-- DROP TABLE IF EXISTS public.chats CASCADE;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Your data has been migrated from chats to chat_history table
-- The app will now use chat_history table for all operations
