# Security Vulnerability Fix Guide

## Vulnerabilities Identified

From the Supabase Security Advisor, the following RLS (Row Level Security) vulnerabilities were detected:

1. **RLS Disabled in Public** - `public.departments` table
2. **RLS Disabled in Public** - `public.courses` table

## Why This Matters

When Row Level Security (RLS) is disabled on public tables, it means:
- Any authenticated user can view, insert, update, or delete ALL records
- No tenant isolation or data protection
- Potential data breaches if sensitive course/department information is exposed
- Non-compliance with security best practices

## Solution Overview

### What is Row Level Security (RLS)?

RLS is a PostgreSQL security feature that controls which rows users can access based on policies defined by administrators. Each policy specifies:
- **Who**: Which users or roles
- **What**: Which operations (SELECT, INSERT, UPDATE, DELETE)
- **Which rows**: What data they can access

### Implementation Steps

#### Step 1: Enable RLS
```sql
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
```

#### Step 2: Create Security Policies

**For viewing (SELECT):**
- Allow authenticated users to view departments/courses
- Optionally restrict by department or owner

**For management (INSERT, UPDATE, DELETE):**
- Only allow admin users to make changes
- Verify admin role in policies

#### Step 3: Verify Implementation
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('departments', 'courses');

-- Should return: rowsecurity = true
```

## How to Apply the Fix

### Option 1: Using Supabase Dashboard
1. Go to **SQL Editor**
2. Copy the SQL from `fix-rls-vulnerabilities.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Verify in **Security Advisor** that issues are resolved

### Option 2: Using Supabase CLI
```bash
supabase db push
```

## Security Policies Explained

### READ Policy (SELECT)
```sql
CREATE POLICY "Allow authenticated users to view departments" 
  ON public.departments 
  FOR SELECT 
  USING (auth.role() = 'authenticated');
```
- Only authenticated (logged-in) users can view departments
- Anonymous users are denied

### ADMIN Policy (INSERT, UPDATE, DELETE)
```sql
CREATE POLICY "Allow admin to manage departments" 
  ON public.departments 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
```
- Only users with 'admin' role can modify data
- Provides administrative control

## Additional Security Recommendations

### 1. Audit Logging
Consider adding audit tables to track who made what changes:

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Rate Limiting
Implement rate limiting on API endpoints to prevent abuse.

### 3. Data Validation
Add CHECK constraints and NOT NULL constraints:

```sql
ALTER TABLE public.departments 
  ADD CONSTRAINT check_dept_name NOT NULL;
```

### 4. Encryption
For sensitive data, use Supabase encryption:

```sql
ALTER TABLE public.courses 
  ADD COLUMN encrypted_data bytea;
```

### 5. Regular Security Audits
- Run Supabase Security Advisor regularly
- Review access patterns
- Monitor failed authentication attempts

## Testing the Fix

### Test 1: Verify RLS is Enabled
```sql
SELECT schemaname, tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('departments', 'courses');
```
Expected result: `rowsecurity = true`

### Test 2: Test Read Access
```sql
-- As authenticated user
SELECT * FROM public.departments;  -- Should work
SELECT * FROM public.courses;       -- Should work

-- As anonymous user (not authenticated)
SELECT * FROM public.departments;  -- Should fail or return no rows
```

### Test 3: Test Write Access
```sql
-- As non-admin user
UPDATE public.departments SET name = 'Test' WHERE id = 1;  -- Should fail

-- As admin user
UPDATE public.departments SET name = 'Updated' WHERE id = 1;  -- Should succeed
```

## Verification Checklist

- [ ] Applied SQL script to database
- [ ] Checked that both tables show `rowsecurity = true`
- [ ] Verified policies are created and active
- [ ] Tested authenticated user access (should work)
- [ ] Tested unauthorized access (should be denied)
- [ ] Ran Security Advisor to confirm vulnerabilities are resolved
- [ ] All tests pass
- [ ] Updated team on new security policies

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/database/postgres/security)

## Questions?

If you encounter any issues:
1. Check Supabase documentation
2. Review the SQL syntax
3. Ensure you're authenticated as admin
4. Verify policies are in the correct order
