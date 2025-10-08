-- Check RLS policies for user_preferences and user_profiles

-- 1. Check if RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_preferences', 'user_profiles', 'user_favorites');

-- 2. Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('user_preferences', 'user_profiles', 'user_favorites');
