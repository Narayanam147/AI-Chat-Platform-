-- ============================================
-- Verify Guest Session Data
-- Run this query to check if guest sessions are being created properly
-- ============================================

-- 1. Check all guest sessions with their data
SELECT 
  id,
  session_token,
  user_agent,
  created_at,
  expires_at,
  last_activity,
  CASE 
    WHEN expires_at > NOW() THEN '✅ Active'
    ELSE '⚠️ Expired'
  END as status,
  EXTRACT(EPOCH FROM (expires_at - NOW()))/86400 as days_until_expiry
FROM public.guest_sessions
ORDER BY created_at DESC
LIMIT 10;

-- 2. Count total guest sessions
SELECT 
  COUNT(*) as total_guest_sessions,
  COUNT(*) FILTER (WHERE expires_at > NOW()) as active_sessions,
  COUNT(*) FILTER (WHERE expires_at <= NOW()) as expired_sessions
FROM public.guest_sessions;

-- 3. Check chats associated with guest sessions
SELECT 
  gs.id as guest_session_id,
  gs.session_token,
  gs.user_agent,
  COUNT(c.id) as chat_count,
  MAX(c.updated_at) as last_chat_update
FROM public.guest_sessions gs
LEFT JOIN public.chats c ON c.guest_session_id = gs.id
GROUP BY gs.id, gs.session_token, gs.user_agent
ORDER BY last_chat_update DESC NULLS LAST
LIMIT 10;

-- 4. Sample guest session details
SELECT 
  gs.id,
  LEFT(gs.session_token, 10) || '...' as token_preview,
  gs.user_agent,
  gs.created_at,
  gs.expires_at,
  gs.last_activity,
  COALESCE(
    json_agg(
      json_build_object(
        'chat_id', c.id,
        'title', c.title,
        'message_count', jsonb_array_length(COALESCE(c.messages, '[]'::jsonb))
      )
    ) FILTER (WHERE c.id IS NOT NULL),
    '[]'::json
  ) as chats
FROM public.guest_sessions gs
LEFT JOIN public.chats c ON c.guest_session_id = gs.id
WHERE gs.expires_at > NOW()
GROUP BY gs.id, gs.session_token, gs.user_agent, gs.created_at, gs.expires_at, gs.last_activity
ORDER BY gs.created_at DESC
LIMIT 5;

-- 5. Check for any data issues
SELECT 
  'Missing user_agent' as issue_type,
  COUNT(*) as count
FROM public.guest_sessions
WHERE user_agent IS NULL OR user_agent = ''
UNION ALL
SELECT 
  'Expired sessions',
  COUNT(*)
FROM public.guest_sessions
WHERE expires_at <= NOW()
UNION ALL
SELECT 
  'Sessions without chats',
  COUNT(*)
FROM public.guest_sessions gs
LEFT JOIN public.chats c ON c.guest_session_id = gs.id
WHERE c.id IS NULL AND gs.expires_at > NOW();
