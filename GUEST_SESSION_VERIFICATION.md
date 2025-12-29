# Guest Session Database Verification

## Overview
Your AI Chat Platform now supports guest sessions (like Google Gemini) where users can chat without signing in, and their conversations are automatically saved to the database.

## Database Schema

The `guest_sessions` table has the following structure:

```sql
CREATE TABLE public.guest_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);
```

### Field Descriptions:

- **id**: Unique UUID identifier for the guest session
- **session_token**: A unique 64-character hex token used to identify the guest user
- **user_agent**: Browser/client information from the request headers
- **created_at**: Timestamp when the session was created (auto-generated)
- **expires_at**: Session expiration date (default: 30 days from creation)
- **last_activity**: Last time the session was used (updated on verification)

## Setup Instructions

### 1. Update Your Database Schema

Run the migration script in your Supabase SQL Editor:

```bash
# In Supabase Dashboard > SQL Editor, run:
update-guest-sessions-schema.sql
```

This will:
- Add `user_agent` column if missing
- Add `last_activity` column if missing
- Verify all columns are present

### 2. Verify Guest Session Creation

**Test Flow:**
1. Open your app in incognito/private mode (not signed in)
2. Start a chat conversation
3. Check the browser console logs for:
   - `✅ Guest session initialized with token:...`
4. Run the verification query in Supabase:

```sql
-- In Supabase SQL Editor, run:
SELECT * FROM public.guest_sessions ORDER BY created_at DESC LIMIT 5;
```

You should see:
- ✅ A new guest session record
- ✅ `session_token` populated (64-char hex string)
- ✅ `user_agent` populated (browser info)
- ✅ `created_at` with current timestamp
- ✅ `expires_at` set to 30 days from now
- ✅ `last_activity` with current timestamp

### 3. Verify Chat Storage

Check that guest chats are being saved:

```sql
SELECT 
  gs.session_token,
  c.title,
  jsonb_array_length(c.messages) as message_count
FROM guest_sessions gs
JOIN chats c ON c.guest_session_id = gs.id
ORDER BY c.created_at DESC;
```

## How It Works

### 1. Guest Session Creation
When a user visits without signing in:
- Client calls `/api/guest/create`
- Server generates a unique token
- Session stored in database with all fields
- Token saved in browser's localStorage

### 2. Chat Storage
When guest sends a message:
- Token sent with request to `/api/chat`
- Server looks up guest session ID
- Chat saved with `guest_session_id` reference
- All messages stored in database

### 3. Sign-in Migration
When guest signs in:
- `/api/guest/migrate` transfers all guest chats
- Chats updated: `guest_session_id` → `user_id`
- Guest can see their previous conversations

## Verification Queries

### Quick Health Check
```sql
-- Run: verify-guest-sessions.sql
-- This shows:
-- - All guest sessions
-- - Active vs expired sessions
-- - Chats per guest session
-- - Data quality issues
```

### Check Recent Guest Activity
```sql
SELECT 
  id,
  LEFT(session_token, 10) || '...' as token,
  user_agent,
  created_at,
  ROUND(EXTRACT(EPOCH FROM (NOW() - created_at))/60) as minutes_ago
FROM guest_sessions
ORDER BY created_at DESC
LIMIT 5;
```

### Check Guest Chats
```sql
SELECT 
  c.title,
  jsonb_array_length(c.messages) as msg_count,
  c.created_at
FROM chats c
WHERE c.guest_session_id IS NOT NULL
ORDER BY c.created_at DESC
LIMIT 10;
```

## Troubleshooting

### Issue: Guest session not created
**Check:**
1. Supabase connection configured (`.env.local`)
2. `guest_sessions` table exists
3. RLS policies allow insert (see `PRODUCTION_READY_DATABASE.sql`)
4. Browser console for error messages

### Issue: Chats not saving
**Check:**
1. Guest session created successfully
2. Token in localStorage: `localStorage.getItem('guest_session_token')`
3. `/api/chat` receiving `guestToken` in request body
4. Database logs in Supabase

### Issue: Missing user_agent
**Fix:**
```sql
-- Run the update script
\i update-guest-sessions-schema.sql
```

## Files
- `update-guest-sessions-schema.sql` - Migration to add missing columns
- `verify-guest-sessions.sql` - Health check queries
- `supabase-guest-support.sql` - Complete guest setup (updated)
- `PRODUCTION_READY_DATABASE.sql` - Full database schema (updated)
