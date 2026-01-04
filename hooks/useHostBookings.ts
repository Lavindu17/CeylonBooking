import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { BookingWithDetails } from '@/types/booking';
import { useEffect, useState } from 'react';

export function useHostBookings() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setBookings([]);
            setLoading(false);
            return;
        }

        fetchBookings();

        // Set up real-time subscription
        const subscription = supabase
            .channel('host-bookings')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                },
                () => {
                    fetchBookings();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    const fetchBookings = async () => {
        if (!user) return;

        try {
            setLoading(true);

            // First, get all listings owned by the current user
            const { data: userListings, error: listingsError } = await supabase
                .from('listings')
                .select('id')
                .eq('host_id', user.id);

            if (listingsError) throw listingsError;

            if (!userListings || userListings.length === 0) {
                setBookings([]);
                setLoading(false);
                return;
            }

            const listingIds = userListings.map(l => l.id);

            // Then fetch bookings for those listings
            const { data, error: fetchError } = await supabase
                .from('bookings')
                .select(`
          *,
          listing:listings(*)
        `)
                .in('listing_id', listingIds)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Fetch guest emails separately (need to join with auth.users)
            const bookingsWithEmails = await Promise.all(
                (data || []).map(async (booking) => {
                    const { data: userData } = await supabase.auth.admin.getUserById(booking.user_id);
                    return {
                        ...booking,
                        guest_email: userData?.user?.email,
                    } as BookingWithDetails;
                })
            );

            setBookings(bookingsWithEmails);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
        try {
            const { error: updateError } = await supabase
                .from('bookings')
                .update({ status })
                .eq('id', bookingId);

            if (updateError) throw updateError;

            // Refresh bookings
            await fetchBookings();
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Failed to update booking',
            };
        }
    };

    return { bookings, loading, error, refetch: fetchBookings, updateBookingStatus };
}
