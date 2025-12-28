-- Add chat_id column to chat_history to link back to parent chats table
ALTER TABLE public.chat_history 
ADD COLUMN IF NOT EXISTS chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_history_chat_id ON public.chat_history(chat_id);

-- Update existing chat_history records to link them to their parent chat
-- This matches based on user_id, guest_session_id, and timestamp proximity
UPDATE public.chat_history ch
SET chat_id = (
  SELECT c.id
  FROM public.chats c,
       jsonb_array_elements(c.messages) WITH ORDINALITY AS t(msg, idx)
  WHERE 
    -- Match user/guest
    ((c.user_id = ch.user_id AND c.user_id IS NOT NULL) 
     OR (c.guest_session_id = ch.guest_session_id AND c.guest_session_id IS NOT NULL))
    -- Match prompt text
    AND (msg->>'text')::TEXT = ch.prompt
    AND (msg->>'sender') = 'user'
    -- Match timestamp (within 1 second tolerance)
    AND ABS(EXTRACT(EPOCH FROM ((msg->>'timestamp')::TIMESTAMPTZ - ch.created_at))) < 1
  ORDER BY c.created_at DESC
  LIMIT 1
)
WHERE ch.chat_id IS NULL;

-- Verify the update
SELECT 
  COUNT(*) as total_entries,
  COUNT(chat_id) as entries_with_chat_id,
  COUNT(*) - COUNT(chat_id) as entries_without_chat_id
FROM public.chat_history;
