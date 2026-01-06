import { BorderRadius, Layout, SemanticColors, Spacing, formatPricePerNight } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Listing } from '@/types/listing';
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
                source={{
                    uri: (listing.images && listing.images.length > 0)
                        ? listing.images[0].url
                        : (listing.image_url ?? 'https://via.placeholder.com/400')
                }}
                style={styles.image}
                resizeMode="cover"
            />

            <View style={styles.content}>
                <Headline numberOfLines={1}>{listing.title}</Headline>

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
    priceContainer: {
        marginTop: 2,
    },
});
