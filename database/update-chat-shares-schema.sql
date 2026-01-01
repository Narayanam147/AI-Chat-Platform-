-- Update chat_shares table to support snapshot approach (like Gemini)
-- Messages are now stored directly in the share instead of referencing chats table

-- Add messages column to store the conversation snapshot
ALTER TABLE chat_shares 
ADD COLUMN IF NOT EXISTS messages JSONB;

-- Add title column for the shared chat
ALTER TABLE chat_shares 
ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Shared Chat';

-- Make chat_id optional (no longer required)
ALTER TABLE chat_shares 
ALTER COLUMN chat_id DROP NOT NULL;

-- Add an index on messages for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_shares_messages ON chat_shares USING GIN (messages);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_shares'
ORDER BY ordinal_position;
