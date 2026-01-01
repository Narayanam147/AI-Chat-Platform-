-- Migrate existing chats to chat_history table
-- This will extract prompt/response pairs from chats.messages and insert into chat_history

-- Delete existing duplicates to avoid conflicts
DELETE FROM public.chat_history 
WHERE (user_id, prompt, created_at) IN (
  SELECT 
    c.user_id,
    (msg->>'text')::TEXT,
    (msg->>'timestamp')::TIMESTAMPTZ
  FROM 
    public.chats c,
    jsonb_array_elements(c.messages) WITH ORDINALITY AS t(msg, idx)
  WHERE 
    (msg->>'sender') = 'user'
    AND NOT c.is_deleted
);

-- Insert all user prompts with their AI responses
INSERT INTO public.chat_history (chat_id, user_id, guest_session_id, prompt, response, title, created_at, updated_at)
SELECT 
  c.id as chat_id,  -- Link to parent chat
  c.user_id,
  c.guest_session_id,
  -- Extract user message text (prompt)
  (msg->>'text')::TEXT as prompt,
  -- Extract AI response text (next message in array)
  (SELECT (msg2->>'text')::TEXT 
   FROM jsonb_array_elements(c.messages) WITH ORDINALITY AS t2(msg2, idx2) 
   WHERE t2.idx2 = t.idx + 1 AND (msg2->>'sender') = 'ai'
   LIMIT 1
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
  -- Only get pairs where AI response exists
  AND EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(c.messages) WITH ORDINALITY AS t3(msg3, idx3) 
    WHERE t3.idx3 = t.idx + 1 AND (msg3->>'sender') = 'ai'
  )
ON CONFLICT DO NOTHING;

-- Verify the migration
SELECT 
  COUNT(*) as total_entries,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT guest_session_id) as unique_guests,
  MIN(created_at) as oldest_entry,
  MAX(created_at) as newest_entry
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
