# Guest Chat Not Saving - Debug Guide

## Issue
Guest users can chat locally, but their chats are not being saved to the database.

## Quick Debug Steps

### Step 1: Check Browser Console
Open your browser console (F12) and look for these logs when sending a message:

```
✅ GOOD SIGNS:
🔑 Guest session initialized with token: abc123...
📤 Sending to /api/chat: { hasGuestToken: true, guestTokenPreview: 'abc123...' }
✅ Found guest session ID: uuid-here
💾 Attempting to save chat: { hasGuestSessionId: true }
✅ New chat created: uuid (guest)

❌ BAD SIGNS:
📤 Sending to /api/chat: { hasGuestToken: false }
⚠️ No guest session found for token
⚠️ Skipping save - no userId or guestSessionId provided
```

### Step 2: Verify Guest Token in localStorage
In browser console, run:
```javascript
localStorage.getItem('guest_session_token')
```

**Expected:** Should return a long hex string (64 characters)
**If null:** Guest session not created

### Step 3: Check Database
Go to Supabase → Table Editor → `guest_sessions`

**Look for:**
- Recent entries (created in last few minutes)
- `session_token` column should match localStorage token
- `chat_title` should update when you send messages

### Step 4: Check Chats Table
Go to Supabase → Table Editor → `chats`

**Look for:**
- Entries with `guest_session_id` (not null)
- `user_id` should be null for guest chats
- `messages` should contain your conversation

### Step 5: Check chat_history Table
Go to Supabase → Table Editor → `chat_history`

**Look for:**
- Entries with `guest_session_id` (not null)
- Each prompt/response pair
- Should match your conversation

## Common Issues & Fixes

### Issue 1: No Guest Token Created
**Symptoms:** localStorage shows null, no guest_sessions entry

**Fix:**
1. Check browser console for errors when page loads
2. Verify `/api/guest/create` endpoint works:
   ```bash
   curl -X POST http://localhost:3002/api/guest/create
   ```
3. Should return: `{"token":"...", "id":"...", "expires_at":"..."}`

### Issue 2: Token Created But Not Passed to Chat API
**Symptoms:** Token in localStorage, but API logs show `hasGuestToken: false`

**Fix:** Check [app/chat/ChatClientPage.tsx](app/chat/ChatClientPage.tsx#L1125):
```typescript
const currentGuestToken = guestToken || localStorage.getItem('guest_session_token');
```

This should fetch the token before sending message.

### Issue 3: Token Passed But Session Not Found
**Symptoms:** API logs show `No guest session found for token`

**Fix:**
1. Verify token in localStorage matches database:
   ```sql
   SELECT * FROM guest_sessions 
   WHERE session_token = 'your-token-here';
   ```
2. Check if session expired
3. Clear token and create new one:
   ```javascript
   localStorage.removeItem('guest_session_token');
   // Refresh page
   ```

### Issue 4: Session Found But Chat Not Saved
**Symptoms:** API logs show session ID but no chat created

**Fix:** Check Supabase permissions:
1. Go to Authentication → Policies
2. Ensure RLS is enabled for `chats` table
3. Policy should allow inserts with `guest_session_id`

## Manual Test

### Test Guest Session Creation
```javascript
// In browser console
fetch('/api/guest/create', { method: 'POST' })
  .then(r => r.json())
  .then(data => {
    console.log('Guest session:', data);
    localStorage.setItem('guest_session_token', data.token);
  });
```

### Test Chat Message
```javascript
// After creating session
const token = localStorage.getItem('guest_session_token');
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'test message',
    guestToken: token
  })
}).then(r => r.json()).then(console.log);
```

### Check Result in Database
```sql
-- Check guest session
SELECT * FROM guest_sessions 
ORDER BY created_at DESC LIMIT 1;

-- Check chats for that session
SELECT c.* FROM chats c
JOIN guest_sessions g ON c.guest_session_id = g.id
ORDER BY c.created_at DESC LIMIT 1;
```

## Environment Variables Check

Ensure these are set in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-key
```

## SQL to Verify Schema

Run in Supabase SQL Editor:
```sql
-- Check if guest_sessions table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'guest_sessions';

-- Check if chats has guest_session_id column
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'chats' AND column_name = 'guest_session_id';

-- Check if chat_history has guest_session_id column
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'chat_history' AND column_name = 'guest_session_id';
```

All should return results. If not, run `fix-guest-search-database.sql`.

## Still Not Working?

1. **Open browser DevTools (F12)**
2. **Go to Network tab**
3. **Send a test message**
4. **Click on the `/api/chat` request**
5. **Check:**
   - Request Payload → Should have `guestToken` field
   - Response → Should have `chatId` field
6. **Take screenshot and share for further debugging**

## Success Indicators

✅ Guest token in localStorage  
✅ Guest session in database  
✅ Chat saved with guest_session_id  
✅ Messages visible after refresh  
✅ Can see chat history in sidebar  

If all ✅, guest chat is working!
