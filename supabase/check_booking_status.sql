-- Check if the booking was actually updated in the database
-- Replace 'YOUR_BOOKING_ID' with the actual booking ID

SELECT 
    id,
    status,
    payment_receipt_url,
    payment_submitted_at,
    advance_payment_amount,
    created_at
FROM bookings 
WHERE id = 'YOUR_BOOKING_ID';

-- This will show you the current state of the booking in the database
-- Expected: status should be 'payment_submitted', payment_receipt_url should have a value
