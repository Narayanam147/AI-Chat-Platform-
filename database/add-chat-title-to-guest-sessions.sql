-- ============================================
-- Add chat_title column to guest_sessions table
-- Run this in Supabase SQL Editor
-- ============================================

-- Add chat_title column to store the guest's current/last chat title
ALTER TABLE public.guest_sessions 
ADD COLUMN IF NOT EXISTS chat_title TEXT;

-- Add an index for searching by chat title (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_guest_sessions_chat_title 
ON public.guest_sessions(chat_title);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'guest_sessions'
ORDER BY ordinal_position;
