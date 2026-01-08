import { Listing } from './listing';

export type BookingStatus =
    | 'pending'              // Booking request sent, awaiting payment
    | 'payment_submitted'    // Guest uploaded receipt, awaiting host verification
    | 'confirmed'            // Host verified payment and confirmed booking
    | 'cancelled';           // Booking rejected or cancelled

export interface Booking {
    id: string;
    created_at: string;
    listing_id: string;
    user_id: string;
    start_date: string;
    end_date: string;
    total_price: number;
    status: BookingStatus;

    // Payment verification fields
    payment_receipt_url?: string;
    advance_payment_amount?: number;
    payment_submitted_at?: string;
}

export interface BookingWithListing extends Booking {
    listing: Listing;
}

export interface BookingWithDetails extends Booking {
    listing: Listing;
    guest_email?: string;
}

