# Guest Session Not Creating - Debugging Guide

## Problem
Guest sessions table is empty even after testing without login.

## Step-by-Step Debugging

### 1. Check if You're Already Logged In

**In browser console (F12):**
```javascript
// Check authentication status
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

**Expected:** `{}` (empty object if not logged in)
**If you see user data:** You're logged in! Sign out first or use incognito mode.

### 2. Sign Out Properly

**Option A: Use the Sign Out button in the app**
- Click your profile icon → Sign out

**Option B: Clear session in console**
```javascript
// Clear NextAuth session
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
// Clear guest token
localStorage.clear();
// Reload
location.reload();
```

**Option C: Use Incognito/Private Mode**
- Open `http://localhost:3002/chat` in incognito
- This ensures no existing session

### 3. Verify Guest Session API Works

**Test the API directly (in browser console):**
```javascript
// Paste this in browser console on http://localhost:3002/chat
fetch('/api/guest/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Response:', data);
  if (data.token) {
    console.log('✅ Guest session created!');
    console.log('Token:', data.token.substring(0, 20) + '...');
    console.log('ID:', data.id);
  } else {
    console.log('❌ No token returned:', data);
  }
})
.catch(err => console.error('❌ Error:', err));
```

**Expected Response:**
```json
{
  "token": "abc123...64-char-hex-string...",
  "id": "uuid-here",
  "expires_at": "2025-01-28T..."
}
```

### 4. Check Server Logs

**In your terminal running `npm run dev`, look for:**
```
🆕 POST /api/guest/create - Creating new guest session...
🔍 Supabase Admin client available: true
🔑 Generated token: abc123...
✅ Guest session created: uuid-here
```

**If you see:**
- `❌ Supabase admin not configured` → Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
- `❌ Failed to create guest session` → Check Supabase connection and RLS policies

### 5. Check Database

**In Supabase SQL Editor:**
```sql
-- Check if table exists
SELECT * FROM guest_sessions LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'guest_sessions';

-- Try manual insert (to test permissions)
INSERT INTO guest_sessions (session_token, user_agent)
VALUES ('test_' || gen_random_uuid()::text, 'Manual Test')
RETURNING *;
```

### 6. Check Browser Console

**Open DevTools (F12) and check Console tab for:**
```
🔍 Guest session init: { status: 'unauthenticated', hasSession: false }
🔑 Creating guest session...
🔑 Guest session result: { hasToken: true, tokenPreview: 'abc123...' }
✅ Guest session initialized with token: abc123...
```

**If you don't see these logs:**
- The `useEffect` for guest session might not be running
- You might be logged in (check step 1)

### 7. Force Guest Session Creation

**Run this in browser console (when not logged in):**
```javascript
// Copy from test-guest-session.js or paste inline:
console.log('🧪 Testing Guest Session Creation...');

fetch('/api/auth/session')
  .then(r => r.json())
  .then(session => {
    console.log('Session:', session);
    if (session?.user) {
      console.log('⚠️ Logged in as:', session.user.email);
      console.log('Sign out first!');
    } else {
      console.log('✅ Not logged in');
      
      fetch('/api/guest/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(r => r.json())
      .then(data => {
        console.log('✅ Response:', data);
        if (data.token) {
          localStorage.setItem('guest_session_token', data.token);
          console.log('✅ Saved to localStorage');
        }
      })
      .catch(err => console.error('❌ Error:', err));
    }
  });
```

### 8. Verify in Database

**After creating a guest session, check Supabase:**
```sql
SELECT 
  id,
  LEFT(session_token, 20) || '...' as token,
  user_agent,
  created_at,
  expires_at
FROM guest_sessions 
ORDER BY created_at DESC 
LIMIT 5;
```

## Common Issues & Solutions

### Issue 1: "Server misconfiguration"
**Cause:** Missing `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
**Fix:** 
1. Go to Supabase Dashboard → Settings → API
2. Copy "service_role" key
3. Add to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=your-key-here`
4. Restart dev server: `npm run dev`

### Issue 2: "Permission denied for table guest_sessions"
**Cause:** RLS policies not set up
**Fix:** Run in Supabase SQL Editor:
\`\`\`sql
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for guest_sessions" ON guest_sessions;

CREATE POLICY "Allow all for guest_sessions"
  ON guest_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);
\`\`\`

### Issue 3: Already logged in
**Cause:** You're testing while authenticated
**Fix:** 
- Sign out using the app
- OR use incognito/private mode
- OR clear cookies and localStorage

### Issue 4: useEffect not running
**Cause:** React strict mode or page not mounted
**Fix:** Check browser console for React warnings. The effect should run when status changes from 'loading' to 'unauthenticated'.

### Issue 5: Fetch fails silently
**Cause:** CORS or network issue
**Fix:** Check Network tab in DevTools (F12) for failed requests

## Quick Test Commands

```bash
# In terminal - check server logs
npm run dev

# In browser console - test API
fetch('/api/guest/create', {method: 'POST'}).then(r => r.json()).then(console.log)

# In Supabase SQL Editor - check data
SELECT * FROM guest_sessions ORDER BY created_at DESC LIMIT 5;
```

## Expected Flow

1. User visits `/chat` without being logged in
2. `useEffect` in ChatClientPage runs
3. `getOrCreateGuestSession()` is called
4. Checks localStorage for existing token → none found
5. Calls `/api/guest/create`
6. API creates row in `guest_sessions` table
7. Returns token to client
8. Token saved in localStorage
9. Now ready to chat (chats will be saved with `guest_session_id`)

## Still Not Working?

1. **Check all console logs** (both browser and server)
2. **Verify Supabase connection** in `.env.local`
3. **Run the test script** from `test-guest-session.js`
4. **Check database permissions** with manual INSERT test
5. **Share error messages** from console/server logs
