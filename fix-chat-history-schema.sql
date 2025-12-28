-- ============================================
-- FIX CHAT_HISTORY TABLE - ADD GUEST SUPPORT
-- Run this in Supabase SQL Editor
-- ============================================

-- Add guest_session_id column to chat_history table
ALTER TABLE public.chat_history 
ADD COLUMN IF NOT EXISTS guest_session_id UUID REFERENCES public.guest_sessions(id) ON DELETE CASCADE;

-- Create index for guest sessions
CREATE INDEX IF NOT EXISTS idx_chat_history_guest_session ON public.chat_history(guest_session_id);

-- Add constraint to ensure either user_id or guest_session_id is set
ALTER TABLE public.chat_history 
DROP CONSTRAINT IF EXISTS chat_history_user_or_guest_check;

ALTER TABLE public.chat_history 
ADD CONSTRAINT chat_history_user_or_guest_check 
CHECK (user_id IS NOT NULL OR guest_session_id IS NOT NULL);

-- ============================================
-- MIGRATE EXISTING CHATS TO CHAT_HISTORY
-- This will create individual chat_history entries from chats messages
-- ============================================

-- Insert all messages from chats table into chat_history table
INSERT INTO public.chat_history (user_id, guest_session_id, prompt, response, title, created_at, updated_at)
SELECT 
  c.user_id,
  c.guest_session_id,
  -- Extract user message text
  (msg->>'text')::TEXT as prompt,
  -- Extract AI response text (next message in array)
  (SELECT (msg2->>'text')::TEXT 
   FROM jsonb_array_elements(c.messages) WITH ORDINALITY AS t2(msg2, idx2) 
   WHERE t2.idx2 = t.idx + 1 AND (msg2->>'sender') = 'ai'
  ) as response,
  c.title,
  (msg->>'timestamp')::TIMESTAMPTZ as created_at,
  (msg->>'timestamp')::TIMESTAMPTZ as updated_at
FROM 
  public.chats c,
  jsonb_array_elements(c.messages) WITH ORDINALITY AS t(msg, idx)
WHERE 
  (msg->>'sender') = 'user'
  AND NOT c.is_deleted
  -- Only insert if we don't already have this entry
  AND NOT EXISTS (
    SELECT 1 FROM public.chat_history ch
    WHERE ch.user_id = c.user_id 
    AND ch.prompt = (msg->>'text')::TEXT
    AND ch.created_at = (msg->>'timestamp')::TIMESTAMPTZ
  )
ON CONFLICT DO NOTHING;

-- Verify the migration
SELECT 
  COUNT(*) as total_chat_history_records,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT guest_session_id) as unique_guests
FROM public.chat_history;

-- Show sample records
SELECT 
  id,
  user_id,
  guest_session_id,
  LEFT(prompt, 50) as prompt_preview,
  LEFT(response, 50) as response_preview,
  created_at
FROM public.chat_history
ORDER BY created_at DESC
LIMIT 10;
