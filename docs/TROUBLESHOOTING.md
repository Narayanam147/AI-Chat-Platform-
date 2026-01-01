# Chat History Not Displaying - Troubleshooting Guide

## Issue Fixed ✅
The API was trying to read from the old `chat_history` table, but the database now uses the `chats` table.

## Changes Made:
1. ✅ Updated `/api/history` route to use `ChatModel` and `chats` table
2. ✅ Updated `/api/history/[id]` route to use `ChatModel` and `chats` table  
3. ✅ Added missing fields (`pinned`, `is_deleted`, `deleted_at`) to Chat interface
4. ✅ Fixed ordering in `findByUserId` to show pinned chats first

## Verify Database Setup

### Step 1: Check if `chats` table exists
Run this in Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'chats';
```

**Expected result:** Should return one row with `chats`

### Step 2: Check table structure
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chats' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

**Expected columns:**
- id (uuid)
- user_id (text)
- title (text)
- messages (jsonb)
- pinned (boolean)
- is_deleted (boolean)
- deleted_at (timestamp with time zone)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)

### Step 3: Check if you have any data
```sql
SELECT 
  id,
  user_id,
  title,
  jsonb_array_length(messages) as message_count,
  is_deleted,
  created_at
FROM public.chats
ORDER BY created_at DESC
LIMIT 10;
```

**If this returns 0 rows:** You need to create some test data or wait for new chats to be created.

### Step 4: Create test data (if needed)
```sql
-- Insert a test chat for your user email
INSERT INTO public.chats (user_id, title, messages, pinned, is_deleted)
VALUES (
  'your-email@example.com',  -- Replace with your actual email
  'Test Chat',
  '[
    {"text": "Hello", "sender": "user", "timestamp": "2025-12-21T10:00:00.000Z"},
    {"text": "Hi! How can I help you?", "sender": "ai", "timestamp": "2025-12-21T10:00:01.000Z"}
  ]'::jsonb,
  false,
  false
);
```

## Test the API

### Test 1: Check API endpoint directly
Open browser DevTools Console and run:

```javascript
fetch('/api/history')
  .then(r => r.json())
  .then(d => console.log('History:', d))
  .catch(e => console.error('Error:', e));
```

**Expected:** Should return an array of chat objects

### Test 2: Check browser console
1. Open the app in browser
2. Open DevTools (F12)
3. Go to Console tab
4. Look for these logs:
   - "Fetching chats for userId: [your-email]"
   - "Fetched chats: X chats"
   - "Returning X formatted chats"

### Test 3: Check Network tab
1. Open DevTools → Network tab
2. Refresh the page
3. Look for `/api/history` request
4. Check the response - should be JSON array

## Common Issues

### Issue 1: Empty array returned
**Cause:** No data in `chats` table for your user
**Solution:** Create a new chat or insert test data (see Step 4 above)

### Issue 2: "Table 'chats' does not exist"
**Cause:** Database migration not run
**Solution:** Run the updated `supabase-setup.sql` in Supabase SQL Editor

### Issue 3: "Column 'messages' does not exist" 
**Cause:** Old table structure
**Solution:** Drop old tables and run migration:
```sql
DROP TABLE IF EXISTS public.chats CASCADE;
-- Then run supabase-setup.sql
```

### Issue 4: Authentication issues
**Cause:** Not logged in or session expired
**Solution:** 
1. Log out and log back in
2. Check that `NEXTAUTH_SECRET` is set in `.env.local`

## Verify Environment Variables

Check your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

## Next Steps

1. ✅ Run the SQL verification queries above
2. ✅ Check if data exists in `chats` table
3. ✅ Create a test chat to verify the system works
4. ✅ Check browser console for errors
5. ✅ Verify API responses in Network tab

## Still Not Working?

If chat history still doesn't display:

1. **Check server logs:** Look for errors in terminal where `npm run dev` is running
2. **Clear browser cache:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check Supabase logs:** Go to Supabase Dashboard → Logs
4. **Restart dev server:** Stop and restart `npm run dev`

## Success Indicators

✅ You should see:
- Chats appear in the sidebar
- Can click on a chat to view messages
- Can create new chats
- Can delete/pin/rename chats
- Settings button visible at bottom of sidebar
