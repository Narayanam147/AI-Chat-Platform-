# Quick Fix Guide - Guest User Search

## Problem
Guest users cannot search or retrieve their chat history because the database queries don't support `guest_session_id`.

## Solution (3 Steps)

### Step 1: Run Database Migration
1. Open [Supabase SQL Editor](https://supabase.com/dashboard)
2. Copy and paste the contents of `fix-guest-search-database.sql`
3. Click "Run" to execute the SQL script
4. Verify the output shows successful table alterations

### Step 2: Verify Database Setup
After running the script, check the verification queries at the bottom show:
- ✅ `guest_session_id` column exists in `chat_history` table
- ✅ Indexes are created (idx_chat_history_guest_session_id)
- ✅ Constraint `chat_history_user_or_guest_check` exists
- ✅ RLS policy "Allow all for chat_history" is active

### Step 3: Test the Application
1. Open the app as a guest (not logged in)
2. Start a new chat and send some messages
3. Refresh the page - your chat should still be there
4. Create another chat - both should be visible
5. Log in - your guest chats should migrate to your account

## What Was Fixed

### Code Changes (Already Done)
- ✅ `lib/chatHistoryClient.ts` - Added guest_session_id support
- ✅ `lib/history.ts` - Added guest_session_id support
- ✅ Both files now properly query by guest session ID

### Database Changes (Need to Run SQL)
- ⏳ Add/verify `guest_session_id` column
- ⏳ Create indexes for performance
- ⏳ Set up constraints
- ⏳ Configure RLS policies

## Files to Run
```bash
# In Supabase SQL Editor, run this file:
fix-guest-search-database.sql
```

## Expected Results
After the fix:
- Guest users can save chats with their session
- Guest users can retrieve their own chats
- Guest users cannot see other guests' chats
- Chat history persists across page refreshes for guests
- Guest data migrates when user signs up

## Troubleshooting

### If guest chats don't appear:
1. Check browser console for errors
2. Verify guest token exists in localStorage (key: `guestToken`)
3. Check Supabase dashboard for guest_sessions table entries
4. Verify chat_history entries have guest_session_id populated

### If migration fails:
1. Check database constraints are in place
2. Verify RLS policies allow guest access
3. Check API endpoint `/api/guest/migrate` is working

## Support
See `GUEST_SEARCH_FIX_SUMMARY.md` for detailed technical information.
