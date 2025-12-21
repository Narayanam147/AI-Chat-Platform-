CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT,
  image TEXT,
  provider TEXT DEFAULT 'credentials',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table: stores chat metadata
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table: stores individual messages within conversations
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keep old table for backward compatibility (can be migrated later)
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  title TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback TEXT NOT NULL,
  user_email TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- New indexes for conversations and messages
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_is_deleted ON public.conversations(is_deleted);
CREATE INDEX IF NOT EXISTS idx_conversations_pinned ON public.conversations(pinned DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- Old indexes (keep for backward compatibility)
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_is_deleted ON public.chat_history(is_deleted);
CREATE INDEX IF NOT EXISTS idx_chat_history_pinned ON public.chat_history(pinned DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON public.chat_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_user_email ON public.feedback(user_email);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for users" ON public.users;
CREATE POLICY "Allow all for users" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for conversations" ON public.conversations;
CREATE POLICY "Allow all for conversations" ON public.conversations
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for messages" ON public.messages;
CREATE POLICY "Allow all for messages" ON public.messages
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for chat_history" ON public.chat_history;
CREATE POLICY "Allow all for chat_history" ON public.chat_history
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for feedback" ON public.feedback;
CREATE POLICY "Allow all for feedback" ON public.feedback
  FOR ALL USING (true) WITH CHECK (true);

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') as columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

