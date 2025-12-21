# Database Migration Guide

## Overview
This guide explains how to migrate from the old database structure (conversations, messages, chat_history) to the new simplified structure (chats only).

## Changes Made

### 1. Database Schema
- **Removed tables**: `conversations`, `messages`, `chat_history`
- **Consolidated into**: `chats` table with JSONB messages field
- **Kept separate**: `users`, `feedback` tables

### 2. New Chats Table Structure
```sql
CREATE TABLE public.chats (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  messages JSONB DEFAULT '[]'::jsonb,  -- Array of message objects
  pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Message Format (JSONB)
Each message in the `messages` array has this structure:
```json
{
  "text": "Message content",
  "sender": "user" | "ai",
  "timestamp": "2025-12-21T10:30:00.000Z",
  "attachments": ["file1.pdf"] // optional
}
```

## Migration Steps

### Step 1: Run the Updated SQL Script
Execute the updated `supabase-setup.sql` file in your Supabase SQL editor:

```bash
# The script will:
# 1. Create the new chats table (if not exists)
# 2. Set up indexes for performance
# 3. Enable Row Level Security (RLS)
# 4. Create triggers for updated_at timestamp
```

### Step 2: Migrate Existing Data (Optional)

If you have existing data in `chat_history`, `conversations`, or `messages` tables, run this migration script:

```sql
-- Migrate from chat_history to chats
INSERT INTO public.chats (id, user_id, title, messages, pinned, is_deleted, created_at, updated_at)
SELECT 
  id,
  user_id,
  title,
  jsonb_build_array(
    jsonb_build_object('text', prompt, 'sender', 'user', 'timestamp', created_at),
    jsonb_build_object('text', response, 'sender', 'ai', 'timestamp', created_at)
  ) as messages,
  pinned,
  is_deleted,
  created_at,
  created_at as updated_at
FROM public.chat_history
WHERE NOT EXISTS (
  SELECT 1 FROM public.chats WHERE chats.id = chat_history.id
);

-- Migrate from conversations + messages to chats (if you used those tables)
INSERT INTO public.chats (id, user_id, title, messages, pinned, is_deleted, created_at, updated_at)
SELECT 
  c.id,
  c.user_id,
  c.title,
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'text', m.content,
          'sender', m.role,
          'timestamp', m.created_at
        ) ORDER BY m.created_at ASC
      )
      FROM public.messages m
      WHERE m.conversation_id = c.id
    ),
    '[]'::jsonb
  ) as messages,
  c.pinned,
  c.is_deleted,
  c.created_at,
  c.updated_at
FROM public.conversations c
WHERE NOT EXISTS (
  SELECT 1 FROM public.chats WHERE chats.id = c.id
);
```

### Step 3: Drop Old Tables (After Verification)

**IMPORTANT**: Only do this after verifying your data has been migrated successfully!

```sql
-- Verify data first:
SELECT COUNT(*) FROM public.chats;
SELECT * FROM public.chats LIMIT 5;

-- Then drop old tables:
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.chat_history CASCADE;
```

## Code Changes Summary

### Updated Files:
1. ✅ `supabase-setup.sql` - New database schema
2. ✅ `app/api/history/route.ts` - Uses ChatModel now
3. ✅ `app/api/history/[id]/route.ts` - Uses ChatModel now
4. ✅ `app/api/chat/route.ts` - Already using ChatModel
5. ✅ `models/Chat.ts` - Already configured for chats table
6. ✅ `components/Layout/MainLayout.tsx` - Fixed mobile sidebar issues

### Key Benefits:
- ✨ **Simpler structure**: One table for all chat data
- 🚀 **Better performance**: Fewer JOINs, JSONB is indexed
- 📱 **Fixed mobile issues**: Sidebar now works properly on mobile
- ⚙️ **Settings visible**: Settings button always visible in sidebar
- 🔄 **Easier to maintain**: Less complex queries and relationships

## Testing Checklist

After migration, test these features:

- [ ] Create new chat
- [ ] View chat history
- [ ] Pin/unpin chats
- [ ] Rename chats
- [ ] Delete chats (soft delete)
- [ ] Share chats
- [ ] Search chats
- [ ] Mobile: Open/close sidebar
- [ ] Mobile: Access Settings
- [ ] Mobile: Create new chat
- [ ] Desktop: Sidebar toggle
- [ ] Desktop: Settings button visible

## Rollback Plan

If you need to rollback:

1. Keep backups of your old tables before dropping them
2. The old API code is commented out in the SQL file
3. You can recreate old tables from the git history if needed

## Support

If you encounter issues:
1. Check Supabase logs for errors
2. Verify RLS policies are correct
3. Check that indexes are created
4. Ensure environment variables are set correctly (.env.local)
