# Sharing and Chat History Troubleshooting Guide

## Issues Identified

### 1. Share Table is Empty
**Problem**: When trying to access a share link, the share table has no records.

**Root Cause**: 
- Shares are not being created automatically
- Users must click the "Share" button to create a share link
- The URL format `https://ai-chat.engineer/chat?chatId={id}` is NOT a share link

**Solution**:
1. Share links must be created via the Share button in the chat interface
2. Proper share link format: `https://ai-chat.engineer/shared/{shareId}?t={token}`
3. To create a share:
   - Open the chat you want to share
   - Click the Share button (three dots menu → Share)
   - The system will create a share entry and copy the link

**Manual Fix** (if needed):
```sql
-- Run this in Supabase SQL Editor to manually create a share
INSERT INTO public.chat_shares (chat_id, token, created_by, is_public, expires_at)
VALUES (
  'YOUR_CHAT_ID_HERE',
  encode(gen_random_bytes(16), 'hex'),
  'user@example.com',
  true,
  NOW() + INTERVAL '30 days'
)
RETURNING 
  id,
  token,
  'https://ai-chat.engineer/shared/' || id || '?t=' || token as share_link;
```

### 2. Chat History Table Not Updating
**Problem**: New chats are saved to `chats` table but not to `chat_history` table.

**Root Cause**: 
- The `chat_history` table was missing the `guest_session_id` column
- This caused inserts to fail for guest users
- The code tries to insert but fails silently

**Solution**:
Run the schema fix SQL file: `fix-chat-history-schema.sql`

```bash
# Open Supabase Dashboard → SQL Editor → paste contents of fix-chat-history-schema.sql
```

This will:
- Add `guest_session_id` column to `chat_history` table
- Add proper constraints and indexes
- Migrate existing chat data from `chats` to `chat_history`

### 3. Guest User Chats Not Working
**Problem**: Non-authenticated users can't save chats properly.

**Root Cause**: 
- Missing guest_session_id field in chat_history
- Constraint required either user_id OR guest_session_id

**Solution**: 
The schema fix (above) resolves this by:
- Adding guest_session_id to chat_history
- Adding constraint: `CHECK (user_id IS NOT NULL OR guest_session_id IS NOT NULL)`

## Step-by-Step Fix Process

### Step 1: Fix Database Schema
```sql
-- Run fix-chat-history-schema.sql in Supabase SQL Editor
-- This adds guest_session_id and migrates existing data
```

### Step 2: Verify Schema Changes
```sql
-- Run debug-sharing-issues.sql to verify everything is correct
-- Check that:
-- 1. chat_history has guest_session_id column
-- 2. chat_shares table exists and has correct structure
-- 3. Constraints are properly set
```

### Step 3: Test Chat Creation
1. Start a new chat (as authenticated user)
2. Send a message
3. Verify in Supabase:
   ```sql
   SELECT * FROM public.chats 
   WHERE user_id = 'your@email.com' 
   ORDER BY created_at DESC LIMIT 1;
   
   SELECT * FROM public.chat_history 
   WHERE user_id = 'your@email.com' 
   ORDER BY created_at DESC LIMIT 1;
   ```
4. Both tables should have the new chat

### Step 4: Test Guest Chat Creation
1. Open incognito/private window
2. Start a chat without logging in
3. Send a message
4. Verify in Supabase:
   ```sql
   SELECT 
     c.id,
     c.guest_session_id,
     gs.session_token,
     jsonb_array_length(c.messages) as message_count
   FROM public.chats c
   JOIN public.guest_sessions gs ON c.guest_session_id = gs.id
   ORDER BY c.created_at DESC LIMIT 1;
   ```

### Step 5: Test Share Functionality
1. Login and open an existing chat
2. Click the three dots menu (⋮) in the chat header
3. Click "Share"
4. Copy the generated link
5. Open link in incognito window
6. Verify the chat loads correctly

## Database Schema Reference

### chats table (current storage)
```sql
CREATE TABLE public.chats (
  id UUID PRIMARY KEY,
  user_id TEXT,
  guest_session_id UUID REFERENCES guest_sessions(id),
  messages JSONB NOT NULL,  -- Array of message objects
  title TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chats_user_or_guest_check 
    CHECK (user_id IS NOT NULL OR guest_session_id IS NOT NULL)
);
```

### chat_history table (individual messages)
```sql
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY,
  user_id TEXT,
  guest_session_id UUID REFERENCES guest_sessions(id),  -- NEW!
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  title TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chat_history_user_or_guest_check  -- NEW!
    CHECK (user_id IS NOT NULL OR guest_session_id IS NOT NULL)
);
```

### chat_shares table
```sql
CREATE TABLE public.chat_shares (
  id UUID PRIMARY KEY,
  chat_id UUID NOT NULL,              -- References chats.id
  token TEXT NOT NULL,                -- Random token for URL
  created_by TEXT,                    -- User who created the share
  is_public BOOLEAN DEFAULT TRUE,     -- Public or private share
  view_count INTEGER DEFAULT 0,       -- Track views
  expires_at TIMESTAMPTZ,            -- Expiration date
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Common Issues and Solutions

### Issue: "Chat not found" when opening share link
**Solution**: 
- Verify the chat exists: `SELECT * FROM chats WHERE id = 'chat-id';`
- Verify the share exists: `SELECT * FROM chat_shares WHERE chat_id = 'chat-id';`
- Check if chat is deleted: `is_deleted = false`

### Issue: Chat history showing wrong data
**Solution**:
- Run migration script to populate chat_history from chats
- The migration in `fix-chat-history-schema.sql` extracts individual messages

### Issue: Guest chats disappearing
**Solution**:
- Verify guest_sessions table has the session
- Check that guest_session_id is being passed from frontend
- Verify RLS policies allow guest access

### Issue: Share link expired
**Solution**:
- Shares expire after 30 days by default
- Create a new share link
- Or update expires_at: 
  ```sql
  UPDATE chat_shares 
  SET expires_at = NOW() + INTERVAL '30 days'
  WHERE id = 'share-id';
  ```

## Verification Queries

### Check chat data consistency
```sql
-- Find chats that exist in chats but not in chat_history
SELECT 
  c.id,
  c.user_id,
  c.title,
  jsonb_array_length(c.messages) as message_count,
  (SELECT COUNT(*) FROM chat_history ch 
   WHERE ch.user_id = c.user_id 
   AND ch.created_at >= c.created_at
   AND ch.created_at <= c.updated_at) as history_count
FROM chats c
WHERE NOT c.is_deleted
HAVING message_count > 0 AND history_count = 0;
```

### Check share links
```sql
-- List all active shares
SELECT 
  cs.id,
  cs.chat_id,
  c.title,
  cs.created_by,
  cs.view_count,
  cs.expires_at,
  CASE 
    WHEN cs.expires_at < NOW() THEN 'Expired'
    ELSE 'Active'
  END as status,
  '/shared/' || cs.id || '?t=' || cs.token as share_url
FROM chat_shares cs
JOIN chats c ON cs.chat_id = c.id
ORDER BY cs.created_at DESC;
```

### Check guest sessions
```sql
-- List active guest sessions
SELECT 
  gs.id,
  gs.session_token,
  gs.created_at,
  gs.last_activity,
  COUNT(c.id) as chat_count
FROM guest_sessions gs
LEFT JOIN chats c ON c.guest_session_id = gs.id
WHERE gs.expires_at > NOW()
GROUP BY gs.id
ORDER BY gs.last_activity DESC;
```

## Next Steps

1. Run `fix-chat-history-schema.sql` to fix the schema
2. Run `debug-sharing-issues.sql` to verify everything works
3. Test creating new chats (both authenticated and guest)
4. Test sharing functionality
5. Verify data is being saved to both tables

## Files Reference

- `fix-chat-history-schema.sql` - Schema fixes and data migration
- `debug-sharing-issues.sql` - Verification and debugging queries
- `complete-database-setup.sql` - Full database schema (reference only)
- API Routes:
  - `/api/chat` - Chat creation and AI responses
  - `/api/share` - Create share links (POST)
  - `/api/share/[id]` - Access shared chat (GET)
  - `/api/history` - Chat history management
