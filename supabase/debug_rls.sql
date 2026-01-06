-- Debug script to check RLS policy and auth context

-- 1. Check if your user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE id = '2fcf7cb4-0562-46ad-bd18-cb78caf18566';

-- 2. Check what auth.uid() returns (run this while logged in)
SELECT auth.uid() as current_user_id;

-- 3. Check existing RLS policies on listings table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'listings';

-- 4. Test insert with explicit host_id (this should fail if RLS is working correctly)
-- Don't run this, just for reference
-- INSERT INTO listings (host_id, title, price, location, beds, baths) 
-- VALUES ('2fcf7cb4-0562-46ad-bd18-cb78caf18566', 'Test', 1000, 'Test', 1, 1);

-- 5. If auth.uid() returns NULL, the issue is with the auth context
-- Solution: Drop and recreate the INSERT policy with better checking

-- First, drop the existing insert policy
DROP POLICY IF EXISTS "Users can create listings" ON public.listings;

-- Recreate with debugging
CREATE POLICY "Users can create listings"
  ON public.listings 
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = host_id
  );

-- Alternative: If you want to allow inserts and just log the issue
-- CREATE POLICY "Users can create listings"
--   ON public.listings 
--   FOR INSERT
--   WITH CHECK (host_id IS NOT NULL);
