-- Add pinned column to chats table to support pinning functionality
ALTER TABLE public.chats 
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE;

-- Create index for faster filtering of pinned chats
CREATE INDEX IF NOT EXISTS idx_chats_pinned ON public.chats(pinned) WHERE pinned = TRUE;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'chats' 
  AND column_name = 'pinned';
