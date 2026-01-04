import { Listing } from './listing';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
    id: string;
    created_at: string;
    listing_id: string;
    user_id: string;
    start_date: string;
    end_date: string;
    total_price: number;
    status: BookingStatus;
}

export interface BookingWithListing extends Booking {
    listing: Listing;
}

export interface BookingWithDetails extends Booking {
    listing: Listing;
    guest_email?: string;
}
