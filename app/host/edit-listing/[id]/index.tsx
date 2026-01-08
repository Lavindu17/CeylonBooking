import LoadingScreen from '@/components/LoadingScreen';
import { useListingCreation } from '@/contexts/ListingCreationContext';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types/listing';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export default function EditListingEntry() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { loadListing } = useListingCreation();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchListing() {
            if (!id) {
                Alert.alert('Error', 'No listing ID provided');
                router.back();
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('listings')
                    .select(`
                        *,
                        listing_images (
                            id,
                            storage_path,
                            url,
                            order
                        )
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (!data) {
                    Alert.alert('Error', 'Listing not found');
                    router.back();
                    return;
                }

                // Sort images by order
                if (data.listing_images) {
                    data.listing_images.sort((a: any, b: any) => a.order - b.order);
                }

                const listing: Listing = {
                    ...data,
                    images: data.listing_images || [],
                };

                loadListing(listing);

                // Navigate to first step
                router.replace(`/host/edit-listing/${id}/location`);
            } catch (error: any) {
                console.error('Error fetching listing:', error);
                Alert.alert('Error', error.message || 'Failed to load listing');
                router.back();
            } finally {
                setLoading(false);
            }
        }

        fetchListing();
    }, [id]);

    if (loading) {
        return <LoadingScreen />;
    }

    return null;
}
