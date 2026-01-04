import { BorderRadius, Layout, SemanticColors, Spacing, formatPricePerNight } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Listing } from '@/types/listing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { BodyBold, Caption1, Headline } from './ui/Typography';

type Props = {
    listing: Listing;
};

export function ListingCard({ listing }: Props) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    return (
        <Pressable
            style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}
            onPress={() => router.push(`/listing/${listing.id}`)}
        >
            <Image
                source={{ uri: listing.image_url ?? 'https://via.placeholder.com/400' }}
                style={styles.image}
                resizeMode="cover"
            />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Headline numberOfLines={1} style={{ flex: 1 }}>{listing.title}</Headline>
                    <View style={styles.rating}>
                        <Ionicons name="star" size={12} color={colors.textPrimary} />
                        <Caption1>4.8</Caption1>
                    </View>
                </View>

                <Caption1 style={{ color: colors.textSecondary }}>
                    {listing.beds} beds · {listing.baths || 1} baths
                </Caption1>

                <View style={styles.priceContainer}>
                    <BodyBold>{formatPricePerNight(listing.price)}</BodyBold>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        marginBottom: Spacing.l,
    },
    image: {
        width: '100%',
        height: Layout.cardImageHeight, // 140
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.s,
    },
    content: {
        gap: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    priceContainer: {
        marginTop: 2,
    },
});
