-- ============================================================================
-- PAYMENT VERIFICATION FLOW - DATABASE SCHEMA
-- ============================================================================
-- This migration adds support for Sri Lankan payment verification flow
-- where guests submit 25% advance payment receipts for host verification

-- ============================================================================
-- 1. UPDATE BOOKINGS TABLE
-- ============================================================================

-- Add payment-related columns to bookings table
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS payment_receipt_url text,
  ADD COLUMN IF NOT EXISTS advance_payment_amount numeric,
  ADD COLUMN IF NOT EXISTS payment_submitted_at timestamp with time zone;

-- Update status constraint to include new payment states
ALTER TABLE public.bookings 
  DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings 
  ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'payment_submitted', 'confirmed', 'cancelled'));

-- Add comment for documentation
COMMENT ON COLUMN public.bookings.payment_receipt_url IS 'URL to uploaded payment receipt in storage';
COMMENT ON COLUMN public.bookings.advance_payment_amount IS '25% advance payment amount calculated at booking time';
COMMENT ON COLUMN public.bookings.payment_submitted_at IS 'Timestamp when guest uploaded payment receipt';


-- ============================================================================
-- 2. CREATE USER PROFILES TABLE (for bank account details)
-- ============================================================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Bank account details for hosts
  bank_name text,
  account_number text,
  account_holder text,
  branch text,
  
  -- Additional profile info (for future use)
  phone text,
  bio text,
  profile_image_url text
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- 3. CREATE STORAGE BUCKET FOR PAYMENT RECEIPTS
-- ============================================================================

-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for payment receipts storage

-- Users can upload their own receipts
-- Path format: {user_id}/{booking_id}_{timestamp}.jpg
CREATE POLICY "Users can upload their own receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-receipts' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own receipts
CREATE POLICY "Users can view their own receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-receipts' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Hosts can view receipts for bookings of their listings
CREATE POLICY "Hosts can view receipts for their bookings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-receipts'
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.listings l ON l.id = b.listing_id
      WHERE l.host_id = auth.uid()
      AND b.user_id::text = (storage.foldername(name))[1]
    )
  );


-- ============================================================================
-- 4. HELPER FUNCTION: Get Host Bank Details for Booking
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_host_bank_details(p_listing_id uuid)
RETURNS TABLE (
  bank_name text,
  account_number text,
  account_holder text,
  branch text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.bank_name,
    p.account_number,
    p.account_holder,
    p.branch
  FROM public.listings l
  JOIN public.profiles p ON p.id = l.host_id
  WHERE l.id = p_listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 5. UPDATE EXISTING BOOKINGS (if any)
-- ============================================================================

-- Set advance_payment_amount for existing bookings (25% of total)
UPDATE public.bookings
SET advance_payment_amount = ROUND(total_price * 0.25)
WHERE advance_payment_amount IS NULL;


-- ============================================================================
-- NOTES
-- ============================================================================
-- After running this migration:
-- 1. Hosts need to add bank details in profile settings
-- 2. New bookings will calculate 25% advance payment
-- 3. Guests upload receipts to 'payment-receipts' bucket
-- 4. Hosts verify receipts before confirming bookings
-- ============================================================================
