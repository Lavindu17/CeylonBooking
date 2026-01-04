import { BookingModal } from '@/components/BookingModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types/listing';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ListingDetails() {
    const { id } = useLocalSearchParams();
    const [listing, setListing] = useState<Listing | null>(null);
    const [isBookingModalVisible, setBookingModalVisible] = useState(false);

    useEffect(() => {
        if (id) fetchListing();
    }, [id]);

    async function fetchListing() {
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) console.error(error);
        else setListing(data);
    }

    if (!listing) return <ThemedView style={styles.loading}><ThemedText>Loading...</ThemedText></ThemedView>;

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: '', headerTransparent: true, headerTintColor: '#fff' }} />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <Image source={{ uri: listing.image_url ?? undefined }} style={styles.image} />

                <View style={styles.content}>
                    <ThemedText type="title">{listing.title}</ThemedText>
                    <ThemedText style={styles.location}>{listing.location}</ThemedText>

                    <View style={styles.stats}>
                        <ThemedText>{listing.beds} beds • {listing.baths} baths</ThemedText>
                        <View style={styles.rating}>
                            <Ionicons name="star" size={16} color="#000" />
                            <ThemedText>4.8 (120 reviews)</ThemedText>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <ThemedText type="subtitle">About this place</ThemedText>
                    <ThemedText style={styles.description}>{listing.description}</ThemedText>

                    <View style={styles.divider} />

                    <ThemedText type="subtitle">What this place offers</ThemedText>
                    <View style={styles.facilities}>
                        {listing.facilities?.map((fac, index) => (
                            <View key={index} style={styles.facilityItem}>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
                                <ThemedText>{fac}</ThemedText>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View>
                    <ThemedText type="defaultSemiBold">LKR {listing.price.toLocaleString()}</ThemedText>
                    <ThemedText>night</ThemedText>
                </View>
                <TouchableOpacity style={styles.bookButton} onPress={() => setBookingModalVisible(true)}>
                    <ThemedText style={styles.bookButtonText}>Book Now</ThemedText>
                </TouchableOpacity>
            </View>

            <BookingModal
                visible={isBookingModalVisible}
                onClose={() => setBookingModalVisible(false)}
                listing={listing}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 300,
    },
    content: {
        padding: 24,
    },
    location: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    rating: {
        flexDirection: 'row',
        gap: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 24,
    },
    description: {
        marginTop: 8,
        lineHeight: 22,
        color: '#444',
    },
    facilities: {
        marginTop: 12,
        gap: 8,
    },
    facilityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bookButton: {
        backgroundColor: '#FF385C',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    bookButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
