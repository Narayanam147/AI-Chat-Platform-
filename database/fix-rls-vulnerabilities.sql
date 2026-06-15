-- ============================================
-- FIX RLS VULNERABILITIES
-- Enable Row Level Security on public tables
-- ============================================
-- This script fixes the security vulnerabilities:
-- - RLS Disabled in Public (public.departments)
-- - RLS Disabled in Public (public.courses)

-- ============================================
-- 1. ENABLE RLS ON DEPARTMENTS TABLE
-- ============================================

-- Enable Row Level Security
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view departments
CREATE POLICY "Allow authenticated users to view departments" 
  ON public.departments 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated admin to manage departments
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

-- ============================================
-- 2. ENABLE RLS ON COURSES TABLE
-- ============================================

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view courses
CREATE POLICY "Allow authenticated users to view courses" 
  ON public.courses 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated admin to manage courses
CREATE POLICY "Allow admin to manage courses" 
  ON public.courses 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify RLS is enabled
-- ============================================

-- Check if RLS is enabled on departments
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables 
-- WHERE tablename = 'departments';

-- Check if RLS is enabled on courses
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables 
-- WHERE tablename = 'courses';

-- List all policies on departments
-- SELECT schemaname, tablename, policyname FROM pg_policies 
-- WHERE tablename = 'departments';

-- List all policies on courses
-- SELECT schemaname, tablename, policyname FROM pg_policies 
-- WHERE tablename = 'courses';
