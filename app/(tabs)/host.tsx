import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types/listing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HostScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchMyListings();
    }, [user]);

    async function fetchMyListings() {
        setLoading(true);
        const { data, error } = await supabase
            .from('listings')
            .select(`
                *,
                listing_images (
                    id,
                    url,
                    order
                )
            `)
            .eq('host_id', user?.id);

        if (error) {
            console.error('Error fetching listings:', error);
        } else {
            const listingsWithImages = (data || []).map((listing: any) => ({
                ...listing,
                images: listing.listing_images?.sort((a: any, b: any) => a.order - b.order) || []
            }));
            setListings(listingsWithImages);
        }
        setLoading(false);
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <ThemedText type="title">Host Dashboard</ThemedText>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => router.push('/host/create-listing')}
                >
                    <Ionicons name="add-circle" size={24} color="#FF385C" />
                    <ThemedText style={styles.createButtonText}>Create Listing</ThemedText>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#FF385C" style={{ marginTop: 50 }} />
                ) : listings.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="home-outline" size={64} color="#ccc" />
                        <ThemedText type="subtitle" style={styles.emptyTitle}>No Listings Yet</ThemedText>
                        <ThemedText style={styles.emptyText}>Create your first listing to start hosting!</ThemedText>
                    </View>
                ) : (
                    <FlatList
                        data={listings}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.listingCard}
                                onPress={() => router.push(`/listing/${item.id}`)}
                            >
                                <View style={styles.listingInfo}>
                                    <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                                    <ThemedText style={styles.listingLocation}>{item.location}</ThemedText>
                                    <ThemedText style={styles.listingPrice}>LKR {item.price.toLocaleString()}/night</ThemedText>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#666" />
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#FF385C',
        alignSelf: 'flex-start',
    },
    createButtonText: {
        color: '#FF385C',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
    },
    listContent: {
        padding: 24,
    },
    listingCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f7f7f7',
        borderRadius: 12,
        marginBottom: 12,
    },
    listingInfo: {
        flex: 1,
    },
    listingLocation: {
        color: '#666',
        marginTop: 4,
    },
    listingPrice: {
        color: '#FF385C',
        fontWeight: '600',
        marginTop: 4,
    },
});
