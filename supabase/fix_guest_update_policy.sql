-- Fix RLS policy to allow users to update their own bookings with payment receipt
-- This allows guests to upload payment receipts and update the booking status

-- Add policy for users to update their own bookings (for payment receipt submission)
CREATE POLICY "Users can update own bookings for payment"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- IMPORTANT: This policy allows users to update ONLY their own bookings
-- It works alongside the existing "Hosts can update booking status" policy
-- which allows hosts to update bookings for their listings

COMMENT ON POLICY "Users can update own bookings for payment" ON public.bookings IS 
  'Allows guests to update their own bookings to submit payment receipts';
