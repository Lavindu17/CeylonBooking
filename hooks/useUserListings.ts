import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types/listing';
import { useEffect, useState } from 'react';

export function useUserListings() {
    const { user } = useAuth();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setListings([]);
            setLoading(false);
            return;
        }

        fetchListings();

        // Set up real-time subscription
        const subscription = supabase
            .channel('user-listings')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'listings',
                    filter: `host_id=eq.${user.id}`,
                },
                () => {
                    fetchListings();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    const fetchListings = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('listings')
                .select('*')
                .eq('host_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setListings(data || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch listings');
        } finally {
            setLoading(false);
        }
    };

    const deleteListing = async (listingId: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('listings')
                .delete()
                .eq('id', listingId);

            if (deleteError) throw deleteError;

            // Refresh listings
            await fetchListings();
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Failed to delete listing',
            };
        }
    };

    return { listings, loading, error, refetch: fetchListings, deleteListing };
}
