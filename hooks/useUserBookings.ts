import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { BookingWithListing } from '@/types/booking';
import { useEffect, useState } from 'react';

export function useUserBookings() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<BookingWithListing[]>([]);
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
            .channel('user-bookings')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `user_id=eq.${user.id}`,
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
            const { data, error: fetchError } = await supabase
                .from('bookings')
                .select(`
          *,
          listing:listings(*)
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setBookings(data as BookingWithListing[]);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    return { bookings, loading, error, refetch: fetchBookings };
}
