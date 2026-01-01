-- ============================================
-- QUICK VERIFICATION SCRIPT
-- Run this after supabase-guest-support.sql
-- ============================================

-- 1. Check all required tables exist
SELECT 
  CASE 
    WHEN COUNT(*) = 4 THEN '✅ All tables exist'
    ELSE '❌ Missing tables: ' || (4 - COUNT(*))::text
  END as table_check
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('guest_sessions', 'chats', 'chat_shares', 'chat_history');

-- 2. Check guest_sessions columns
SELECT 
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ guest_sessions has all columns'
    ELSE '❌ Missing columns in guest_sessions'
  END as column_check
FROM information_schema.columns
WHERE table_name = 'guest_sessions'
  AND column_name IN ('id', 'session_token', 'created_at', 'expires_at', 'last_activity');

-- 3. Check chats has guest_session_id
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'chats' AND column_name = 'guest_session_id'
    ) THEN '✅ chats.guest_session_id exists'
    ELSE '❌ chats.guest_session_id missing'
  END as guest_column_check;

-- 4. Check chat_shares has new columns
SELECT 
  CASE 
    WHEN COUNT(*) = 2 THEN '✅ chat_shares has is_public and view_count'
    ELSE '❌ Missing columns in chat_shares'
  END as shares_column_check
FROM information_schema.columns
WHERE table_name = 'chat_shares'
  AND column_name IN ('is_public', 'view_count');

-- 5. Check indexes exist
SELECT 
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ Guest session indexes exist'
    ELSE '⚠️ Some indexes might be missing'
  END as index_check
FROM pg_indexes
WHERE tablename = 'guest_sessions';

-- 6. Check RLS is enabled
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Enabled'
    ELSE '❌ RLS Disabled'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('guest_sessions', 'chats', 'chat_shares', 'chat_history')
ORDER BY tablename;

-- 7. Check policies exist
SELECT 
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Has policies'
    ELSE '❌ No policies'
  END as policy_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('guest_sessions', 'chats', 'chat_shares', 'chat_history')
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- SUMMARY
-- ============================================
SELECT '✅ Setup verification complete!' as status;
SELECT 'Next steps:' as instruction;
SELECT '1. Deploy your Next.js application' as step_1;
SELECT '2. Test guest user functionality' as step_2;
SELECT '3. Test chat sharing' as step_3;
SELECT '4. Check GUEST_USER_SHARING_GUIDE.md for details' as step_4;
