-- QUICK FIX: Update RLS policy to properly handle auth context
-- Run this in your Supabase SQL Editor

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can create listings" ON public.listings;

-- Recreate the policy to use the JWT claims
CREATE POLICY "Users can create listings"
  ON public.listings 
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- If the above still doesn't work, try this alternative that checks the JWT role
-- DROP POLICY IF EXISTS "Users can create listings" ON public.listings;
-- CREATE POLICY "Users can create listings"
--   ON public.listings 
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (true);

-- Then verify the policy was created
SELECT tablename, policyname, permissive, roles, cmd, with_check
FROM pg_policies
WHERE tablename = 'listings' AND policyname = 'Users can create listings';
