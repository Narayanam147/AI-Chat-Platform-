# Quick Start Guide - AI Chat Platform

## 🚀 Get Started in 5 Minutes

### Step 1: Database Setup
1. Open [Supabase Dashboard](https://app.supabase.com/)
2. Go to **SQL Editor**
3. Copy and paste entire content of `supabase-setup.sql`
4. Click **Run** (▶️)
5. Verify output shows 4 tables created: `users`, `chat_history`, `feedback`, `chat_shares`

### Step 2: Environment Variables
Create/update `.env.local` file:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# AI Provider (Groq)
GROQ_API_KEY=your-groq-api-key

# Optional: News & Weather APIs
NEWS_API_KEY=your-newsapi-key
GOOGLE_API_KEY=your-google-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id
```

### Step 3: Install & Run
```bash
npm install
npm run dev
```

### Step 4: Test Functionality
Open http://localhost:3000

#### ✅ Test Checklist (2 minutes)
1. **Sign Up**: Click "Sign Up", enter email & password
2. **Send Message**: Type "Hello" → Click Send → See AI response
3. **Pin Chat**: Click ⋮ menu on chat → Click "Pin" → Chat moves to top
4. **Rename**: Click ⋮ → "Rename" → Type "My First Chat" → Press Enter
5. **Delete**: Click ⋮ → "Delete" → Confirm → Chat disappears
6. **Mobile**: Open DevTools (F12) → Toggle mobile view → Test sidebar

---

## 📊 Verify Database

Run this in Supabase SQL Editor:
```sql
-- Check if tables exist
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns c 
        WHERE c.table_name = t.table_name AND c.table_schema = 'public') as columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'chat_history', 'feedback', 'chat_shares')
ORDER BY table_name;
```

**Expected Output:**
```
chat_history | 10
chat_shares  | 6
feedback     | 6
users        | 8
```

---

## 🔧 Troubleshooting

### Issue: "Relation 'chats' does not exist"
**Fix:** Old code references. Run SQL setup again:
```sql
DROP TABLE IF EXISTS chats CASCADE;
```
Then run full `supabase-setup.sql`

### Issue: No chat history showing
**Fix:** Check API response:
```bash
# In browser console
fetch('/api/history').then(r => r.json()).then(console.log)
```

### Issue: Cannot sign up/login
**Fix:** Check `.env.local` has `NEXTAUTH_SECRET` and `NEXTAUTH_URL`

### Issue: AI not responding
**Fix:** Verify `GROQ_API_KEY` in `.env.local`

---

## 📝 Common Tasks

### View All Chats
```sql
SELECT id, user_id, title, prompt, response, pinned, created_at 
FROM chat_history 
WHERE is_deleted = false 
ORDER BY pinned DESC, created_at DESC;
```

### View Pinned Chats Only
```sql
SELECT * FROM chat_history WHERE pinned = true AND is_deleted = false;
```

### View Deleted Chats (Soft Deleted)
```sql
SELECT * FROM chat_history WHERE is_deleted = true;
```

### Restore Deleted Chat
```sql
UPDATE chat_history 
SET is_deleted = false, deleted_at = NULL 
WHERE id = 'your-chat-id';
```

### View Share Links
```sql
SELECT s.id, s.token, s.chat_id, h.title, s.expires_at, s.created_at
FROM chat_shares s
JOIN chat_history h ON s.chat_id = h.id
ORDER BY s.created_at DESC;
```

### Hard Delete (Permanent)
```sql
-- ⚠️ WARNING: This permanently deletes data
DELETE FROM chat_history WHERE id = 'your-chat-id';
```

---

## 🎯 Feature Guide

### Pin/Unpin Chat
- **Where**: Sidebar chat item → ⋮ menu → "Pin"/"Unpin"
- **Database**: Sets `pinned = true/false`
- **UI**: Pinned chats appear at top of sidebar

### Rename Chat
- **Where**: Click on chat → ⋮ menu in header → "Rename"
- **Database**: Updates `title` column
- **Shortcut**: Click title directly to edit inline

### Share Chat
- **Where**: ⋮ menu → "Share"
- **Result**: Creates link like `http://localhost:3000/chat?chatId=abc&t=token`
- **Database**: Creates entry in `chat_shares` table
- **Expiry**: Default 7 days (configurable)

### Delete Chat
- **Where**: ⋮ menu → "Delete" → Confirm
- **Type**: Soft delete (data preserved)
- **Database**: Sets `is_deleted = true`, `deleted_at = NOW()`
- **Recovery**: Can be restored via SQL

---

## 🔒 Security Features

✅ **Row Level Security (RLS)** enabled on all tables  
✅ **User ownership** verified for all operations  
✅ **Soft delete** prevents accidental data loss  
✅ **Share tokens** are cryptographically secure  
✅ **Expired shares** automatically rejected  
✅ **Password hashing** with bcrypt  

---

## 📱 Mobile Features

✅ Responsive sidebar (slides in from left)  
✅ Hamburger menu always accessible  
✅ Touch-optimized buttons  
✅ Overlay prevents accidental clicks  
✅ Settings button visible at bottom  

---

## 🚀 Production Deployment

### Environment Variables (Vercel/Production)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=random-secure-string
GROQ_API_KEY=your-groq-api-key
```

### Build & Deploy
```bash
npm run build
npm start
```

### Performance Tips
1. Enable Supabase connection pooling
2. Add CDN for static assets
3. Enable Next.js Image Optimization
4. Use environment-specific API keys

---

## 📚 Documentation

- **Full Implementation**: See `IMPLEMENTATION_SUMMARY.md`
- **Detailed Tests**: See `TEST_INSTRUCTIONS.md`
- **Database Schema**: See `supabase-setup.sql`

---

## 💡 Tips

### Keyboard Shortcuts (In Chat)
- `Enter` - Send message
- `Shift + Enter` - New line
- `Esc` - Cancel rename
- `/help` - Show command shortcuts

### Command Shortcuts
- `/sum` - Summarize conversation
- `/tldr` - Brief summary
- `/code` - Get code examples
- `/explain` - Simpler explanation

---

## ✨ You're Ready!

Your AI Chat Platform is now fully configured with:
✅ Chat history (prompt/response pairs)  
✅ Pin functionality  
✅ Rename functionality  
✅ Share functionality  
✅ Delete functionality (soft delete)  
✅ Mobile-responsive sidebar  
✅ Real-time AI responses  

**Next**: Start chatting and test all features! 🎉
