-- Simple timezone fix for chat_history
-- Run this in Supabase SQL Editor

-- Step 1: Check current timestamps (they are in UTC +00)
SELECT id, title, created_at, updated_at 
FROM chat_history 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 2: Convert to IST (Asia/Kolkata is UTC+5:30) in the query
-- This shows what the times would look like in your local timezone
SELECT 
  id, 
  title, 
  created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' as local_created_at,
  updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' as local_updated_at
FROM chat_history 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 3: Create a function to convert any timestamp to local time
-- This makes it easy to convert timestamps in your application
CREATE OR REPLACE FUNCTION to_local_time(utc_time TIMESTAMPTZ)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN utc_time AT TIME ZONE 'Asia/Kolkata';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Test the function
SELECT 
  id,
  title,
  to_local_time(created_at) as local_created_at,
  to_local_time(updated_at) as local_updated_at
FROM chat_history 
ORDER BY created_at DESC 
LIMIT 5;

-- Expected result: Times should be 5 hours 30 minutes ahead of UTC
-- For example: 2025-12-21 10:33:45+00 becomes 2025-12-21 16:03:45+05:30
