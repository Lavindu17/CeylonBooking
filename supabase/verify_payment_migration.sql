-- Check if payment_submitted status is in the bookings constraint
-- Run this in Supabase SQL Editor to verify the migration was applied

SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'bookings_status_check';

-- Expected result should show:
-- CHECK (status IN ('pending', 'payment_submitted', 'confirmed', 'cancelled'))

-- If it only shows ('pending', 'confirmed', 'cancelled'), 
-- then you need to run schema_payment_verification.sql first
