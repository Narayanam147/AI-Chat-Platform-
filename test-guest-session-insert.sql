-- ============================================
-- Test Guest Session Creation
-- This script simulates what the API does
-- ============================================

-- Insert a test guest session
INSERT INTO public.guest_sessions (
  session_token,
  user_agent,
  expires_at
) VALUES (
  'test_token_' || gen_random_uuid()::text,
  'Mozilla/5.0 (Test Browser)',
  NOW() + INTERVAL '30 days'
)
RETURNING 
  id,
  session_token,
  user_agent,
  created_at,
  expires_at,
  last_activity;

-- Verify it was created
SELECT 
  id,
  LEFT(session_token, 20) || '...' as token_preview,
  user_agent,
  created_at,
  expires_at,
  last_activity,
  EXTRACT(EPOCH FROM (expires_at - NOW()))/86400 as days_remaining
FROM public.guest_sessions
ORDER BY created_at DESC
LIMIT 1;

-- Clean up test data (optional - comment out to keep test data)
-- DELETE FROM public.guest_sessions 
-- WHERE session_token LIKE 'test_token_%';
