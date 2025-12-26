# 🚀 Quick Start: Guest Users & Live Sharing

## ⚡ 3-Step Setup

### Step 1: Database Setup (5 minutes)
```bash
# In Supabase Dashboard > SQL Editor:
1. Run: supabase-guest-support.sql
2. Run: verify-guest-setup.sql (to verify)
```

**Expected Result**: All checks should show ✅

### Step 2: Deploy Application (2 minutes)
```bash
# Push changes to GitHub (triggers Vercel deployment)
git add .
git commit -m "Add guest user support and live chat sharing"
git push origin master
```

**Or deploy locally:**
```bash
npm run build
npm run dev
```

### Step 3: Test Features (5 minutes)

#### Test Guest User:
1. Open your app in **incognito mode**
2. Start chatting (no login required)
3. Chat history should save automatically
4. Close and reopen - history should persist

#### Test Sharing:
1. In regular browser (logged in or as guest)
2. Select any chat
3. Click share button (top-right or menu)
4. Copy the link (format: `/shared/{id}?t={token}`)
5. Open link in **different browser/device**
6. ✅ Chat should be visible without login

#### Test Migration:
1. Use app as guest (create some chats)
2. Sign up or login
3. ✅ All guest chats should now appear in your account

## 🎉 You're Done!

### What Users Can Now Do:

**Guest Users (Not Logged In):**
- ✅ Chat immediately without signup
- ✅ Full AI capabilities
- ✅ History saved locally + database
- ✅ Share their chats
- ✅ Data migrates on signup

**Authenticated Users:**
- ✅ All guest features +
- ✅ Sync across devices
- ✅ Permanent account
- ✅ Access to admin features (if admin)

**Anyone with a Share Link:**
- ✅ View shared chats instantly
- ✅ No login required
- ✅ Works on any device
- ✅ Clean, read-only view

## 📱 Share Link Example

When user clicks "Share":
```
https://your-app.com/shared/abc123?t=def456
```

This link:
- ✅ Works for anyone (logged in or not)
- ✅ Expires in 30 days (configurable)
- ✅ Tracks view count
- ✅ Can be shared via social media, email, etc.

## 🔍 Troubleshooting

### "Guest session not created"
- Clear browser cache/localStorage
- Check console for errors
- Verify `/api/guest/create` returns 200

### "Share link doesn't work"
- Check URL has both `id` and `t` parameters
- Verify link hasn't expired
- Check Supabase `chat_shares` table

### "Guest data not migrating"
- Check localStorage has `guest_session_token`
- Verify user is logged in during migration
- Check console for migration logs

## 📊 Monitor Usage

### Check Guest Sessions:
```sql
SELECT COUNT(*) as active_guest_sessions
FROM guest_sessions
WHERE expires_at > NOW();
```

### Check Share Link Usage:
```sql
SELECT 
  id,
  view_count,
  created_at,
  expires_at
FROM chat_shares
ORDER BY view_count DESC
LIMIT 10;
```

### Check Data Migration:
```sql
SELECT COUNT(*) as migrated_chats
FROM chats
WHERE user_id IS NOT NULL 
  AND guest_session_id IS NULL;
```

## 🎯 Next Steps

1. **Customize share messages** in `ChatClientPage.tsx`
2. **Adjust expiration times** in API routes
3. **Add analytics** to track sharing behavior
4. **Set up cleanup cron job** for expired sessions
5. **Add rich previews** for shared links (Open Graph tags)

## 💡 Tips

- Guest sessions last 30 days by default
- Share links expire in 7 days by default (adjustable 1-365 days)
- No personal data is collected from guests
- Guest chats are automatically deleted when session expires
- Migration happens automatically on first login after guest usage

## ✅ Success Criteria

You know it's working when:
- [ ] You can chat without logging in
- [ ] Guest chats persist after page reload
- [ ] Share link can be opened in incognito mode
- [ ] Guest data appears after signup
- [ ] Share view count increments

---

**Need Help?** Check [GUEST_USER_SHARING_GUIDE.md](./GUEST_USER_SHARING_GUIDE.md) for detailed documentation.
