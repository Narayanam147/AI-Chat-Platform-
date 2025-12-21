# Test Instructions for Chat Platform

## Prerequisites
1. Run the SQL setup file in Supabase SQL Editor: `supabase-setup.sql`
2. Ensure `.env.local` has correct Supabase credentials
3. Start the development server: `npm run dev`

## Database Schema
The platform now uses `chat_history` table with the following structure:
- Each row represents ONE prompt/response pair
- Columns: `id`, `user_id`, `prompt`, `response`, `title`, `pinned`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`

## Test Cases

### 1. **Create New Chat**
**Steps:**
1. Log in with your credentials
2. Type a message in the chat input: "Hello, how are you?"
3. Click Send
4. Wait for AI response

**Expected Results:**
- ✅ User message appears in chat
- ✅ AI response appears in chat
- ✅ New entry created in `chat_history` table with prompt and response
- ✅ Chat appears in sidebar history

**Verification Query:**
```sql
SELECT id, user_id, prompt, response, title, created_at 
FROM chat_history 
WHERE user_id = 'your_email@example.com' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

### 2. **Pin Chat**
**Steps:**
1. Hover over a chat in the sidebar
2. Click the three-dot menu (⋮)
3. Click "Pin"

**Expected Results:**
- ✅ Chat moves to top of sidebar
- ✅ Pin icon appears next to chat
- ✅ Database updated: `pinned = true`

**Verification Query:**
```sql
SELECT id, title, pinned FROM chat_history WHERE user_id = 'your_email@example.com' AND pinned = true;
```

---

### 3. **Rename Chat**
**Steps:**
1. Click on a chat to open it
2. Click the three-dot menu in the chat header
3. Click "Rename"
4. Type new title: "My Test Chat"
5. Press Enter or click outside

**Expected Results:**
- ✅ Title updates in sidebar
- ✅ Title updates in chat header
- ✅ Database updated with new title

**Verification Query:**
```sql
SELECT id, title FROM chat_history WHERE user_id = 'your_email@example.com' AND title = 'My Test Chat';
```

---

### 4. **Share Chat**
**Steps:**
1. Click on a chat
2. Click three-dot menu in header
3. Click "Share"
4. Link copied to clipboard

**Expected Results:**
- ✅ Share link copied notification appears
- ✅ New entry created in `chat_shares` table
- ✅ Link contains chat ID and token
- ✅ Link format: `http://localhost:3000/chat?chatId=<id>`

**Verification Query:**
```sql
SELECT id, chat_id, token, created_by, expires_at 
FROM chat_shares 
ORDER BY created_at DESC 
LIMIT 5;
```

**Test Shared Link:**
1. Open shared link in incognito/private browser
2. Should display the chat content

---

### 5. **Delete Chat (Soft Delete)**
**Steps:**
1. Hover over a chat in sidebar
2. Click three-dot menu
3. Click "Delete"
4. Confirm deletion

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Chat removed from sidebar
- ✅ Database: `is_deleted = true`, `deleted_at` timestamp set
- ✅ Chat not visible in UI but still in database

**Verification Query:**
```sql
-- Check soft-deleted chats
SELECT id, title, is_deleted, deleted_at 
FROM chat_history 
WHERE user_id = 'your_email@example.com' AND is_deleted = true;
```

---

### 6. **Unpin Chat**
**Steps:**
1. Find a pinned chat
2. Click three-dot menu
3. Click "Unpin"

**Expected Results:**
- ✅ Chat moves down in sidebar (sorted by date)
- ✅ Pin icon disappears
- ✅ Database: `pinned = false`

---

### 7. **Mobile Sidebar Test**
**Steps:**
1. Open browser DevTools (F12)
2. Toggle device toolbar (responsive mode)
3. Select mobile device (e.g., iPhone 12)
4. Test sidebar functionality

**Expected Results:**
- ✅ Hamburger menu visible and clickable
- ✅ Sidebar slides in from left
- ✅ Overlay covers chat area when sidebar open
- ✅ Click outside sidebar or hamburger closes sidebar
- ✅ Settings button visible at bottom
- ✅ All chat operations work on mobile

---

### 8. **Search Chat History**
**Steps:**
1. Open sidebar
2. Type in search box at top
3. Search for keyword from previous chats

**Expected Results:**
- ✅ Chats filtered in real-time
- ✅ Only matching chats displayed
- ✅ Clear search shows all chats

---

### 9. **Load Existing Chat**
**Steps:**
1. Click on a chat from history
2. Wait for messages to load

**Expected Results:**
- ✅ Chat selected/highlighted in sidebar
- ✅ Messages display in chat area
- ✅ Prompt and response shown correctly

---

### 10. **New Chat Button**
**Steps:**
1. While viewing a chat, click "New Chat" button
2. Start typing new message

**Expected Results:**
- ✅ Chat area clears
- ✅ "New Chat" or greeting message appears
- ✅ Previous chat deselected in sidebar
- ✅ Ready to start fresh conversation

---

## API Endpoints to Test

### GET /api/history
```bash
curl -X GET "http://localhost:3000/api/history" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```
**Expected:** Array of chat_history entries

### PATCH /api/history/[id]
```bash
curl -X PATCH "http://localhost:3000/api/history/CHAT_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"title":"Updated Title","pinned":true}'
```
**Expected:** Updated chat object

### DELETE /api/history/[id]
```bash
curl -X DELETE "http://localhost:3000/api/history/CHAT_ID" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```
**Expected:** `{"success": true}`

### POST /api/share
```bash
curl -X POST "http://localhost:3000/api/share" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"id":"CHAT_ID","expiresDays":7}'
```
**Expected:** `{"id":"...", "token":"...", "expires_at":"..."}`

---

## Common Issues & Solutions

### Issue: Chat history not loading
**Solution:** 
- Check Supabase connection in `.env.local`
- Verify RLS policies are set correctly
- Check browser console for errors

### Issue: "Table does not exist" error
**Solution:**
- Run `supabase-setup.sql` in Supabase SQL Editor
- Ensure using correct project URL and anon key

### Issue: Pin/Rename/Delete not working
**Solution:**
- Check user is authenticated
- Verify `user_id` matches between session and database
- Check API responses in Network tab

### Issue: Mobile sidebar not working
**Solution:**
- Clear browser cache
- Check z-index values in DevTools
- Verify overlay click handler is working

---

## Success Criteria
- ✅ All CRUD operations work (Create, Read, Update, Delete)
- ✅ Pin/Unpin functionality works
- ✅ Rename functionality works
- ✅ Share functionality creates valid links
- ✅ Soft delete marks chats as deleted without removing from DB
- ✅ Mobile sidebar functions correctly
- ✅ Search filters chat history
- ✅ All API endpoints return expected responses
- ✅ Database queries show correct data

---

## Next Steps After Testing
1. Test with multiple users
2. Test concurrent sessions
3. Test with large chat histories (100+ entries)
4. Performance testing
5. Security testing (try accessing other users' chats)
6. Test expired share links
7. Test RLS policies
