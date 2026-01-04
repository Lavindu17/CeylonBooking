import { Listing } from '@/types/listing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';

type Props = {
    listing: Listing;
};

export function ListingCard({ listing }: Props) {
    const router = useRouter();

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                // Navigate to details page (Phase 3)
                // router.push(`/listing/${listing.id}`);
                console.log('Pressed listing:', listing.id);
            }}
        >
            <Image source={{ uri: listing.image_url ?? 'https://via.placeholder.com/400' }} style={styles.image} />

            <View style={styles.content}>
                <View style={styles.header}>
                    <ThemedText type="subtitle" style={styles.title}>{listing.location}</ThemedText>
                    <View style={styles.rating}>
                        <Ionicons name="star" size={14} color="#000" />
                        <ThemedText style={styles.ratingText}>4.8</ThemedText>
                    </View>
                </View>
                <ThemedText style={styles.description}>{listing.title}</ThemedText>
                <ThemedText style={styles.description}>{listing.beds} beds</ThemedText>

                <View style={styles.priceContainer}>
                    <ThemedText type="defaultSemiBold">LKR {listing.price.toLocaleString()}</ThemedText>
                    <ThemedText> night</ThemedText>
                </View>
            </View>
        </TouchableOpacity>
    );
}

import { View } from 'react-native';

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'transparent',
        marginBottom: 24,
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        marginBottom: 10,
    },
    content: {
        gap: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    description: {
        color: '#666',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 4,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
    }
});
