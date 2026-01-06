# RLS Policy Fix Guide

## Problem
You're getting an RLS policy violation error when creating listings, even though the user is authenticated and the `host_id` is being set correctly.

## Root Cause
The RLS policy is checking `auth.uid() = host_id`, but the auth context may not be properly passed from the Supabase client to the database.

## Solution

### Option 1: Update RLS Policy (Recommended)

Run this in your **Supabase SQL Editor**:

```sql
-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can create listings" ON public.listings;

-- Recreate with explicit TO authenticated clause
CREATE POLICY "Users can create listings"
  ON public.listings 
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);
```

### Option 2: Verify Auth Session

The issue might be that the auth session isn't being sent with requests. Check if you're properly authenticated:

1. In your app, add this debug code in `review.tsx`:

```typescript
// Before handlePublish
const session = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User ID:', user?.id);
```

2. If session is null, you need to log out and log back in.

### Option 3: Temporary Workaround (For Testing Only)

If you just want to test the feature quickly, temporarily use this policy:

```sql
DROP POLICY IF EXISTS "Users can create listings" ON public.listings;

CREATE POLICY "Users can create listings"
  ON public.listings 
  FOR INSERT
  TO authenticated
  WITH CHECK (host_id IS NOT NULL);
```

⚠️ **Warning**: This allows any authenticated user to create listings for any host_id. Only use for testing, then revert to the secure policy.

### Option 4: Check Supabase Service Role

Make sure you're using the correct Supabase keys:
- Using **anon key** for client ✅
- NOT using service role key in client ❌

## Steps to Apply Fix

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to your project → **SQL Editor**
3. Copy one of the SQL commands above
4. Paste and click **Run**
5. Try creating a listing again

## Verify It Worked

After applying the fix, test:
1. Create a new listing in your app
2. If successful, verify in Supabase:
   - Go to **Table Editor** → **listings**
   - Check the new listing has the correct `host_id`

## Still Not Working?

If the issue persists, run this diagnostic query:

```sql
-- Check what auth.uid() returns
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role,
  current_user;
```

If `auth.uid()` returns `NULL`, the auth session isn't being passed properly. In that case:

1. Log out of the app completely
2. Clear app data/cache
3. Log back in
4. Try again
