-- ============================================
-- Fix Timezone Display in chat_history table
-- Convert UTC timestamps to your local timezone
-- ============================================

-- First, check your current timezone setting
SHOW timezone;

-- Set your timezone (example for India Standard Time)
-- Change 'Asia/Kolkata' to your timezone
-- Common timezones: 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Asia/Kolkata'
SET timezone = 'Asia/Kolkata';

-- Verify timestamps are converting correctly
SELECT 
  id,
  title,
  created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' as local_time,
  created_at as utc_time,
  updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' as local_updated
FROM chat_history
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- OPTION 1: Create a view with local timezone
-- ============================================
CREATE OR REPLACE VIEW chat_history_local AS
SELECT 
  id,
  user_id,
  prompt,
  response,
  title,
  pinned,
  is_deleted,
  deleted_at,
  created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' as created_at,
  updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' as updated_at
FROM chat_history;

-- Now query from the view to get local time
SELECT * FROM chat_history_local ORDER BY created_at DESC LIMIT 5;

-- ============================================
-- OPTION 2: Create function to get local time
-- ============================================
CREATE OR REPLACE FUNCTION get_local_time(utc_time TIMESTAMPTZ, tz TEXT DEFAULT 'Asia/Kolkata')
RETURNS TIMESTAMP AS $$
BEGIN
  RETURN utc_time AT TIME ZONE 'UTC' AT TIME ZONE tz;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT 
  id,
  title,
  get_local_time(created_at) as local_created_at,
  created_at as utc_created_at
FROM chat_history
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- OPTION 3: Update default timezone for session
-- ============================================
-- Add this to your connection or run at start of each query
ALTER DATABASE postgres SET timezone TO 'Asia/Kolkata';

-- ============================================
-- Check common timezones
-- ============================================
-- India: 'Asia/Kolkata' (IST, UTC+5:30)
-- USA East: 'America/New_York' (EST/EDT, UTC-5/-4)
-- USA West: 'America/Los_Angeles' (PST/PDT, UTC-8/-7)
-- UK: 'Europe/London' (GMT/BST, UTC+0/+1)
-- China: 'Asia/Shanghai' (CST, UTC+8)
-- Australia: 'Australia/Sydney' (AEDT, UTC+11)

-- To verify your correct timezone, check system time:
SELECT NOW() as utc_now, NOW() AT TIME ZONE 'Asia/Kolkata' as ist_now;
