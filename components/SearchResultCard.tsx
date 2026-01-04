import { BorderRadius, SemanticColors, Spacing, formatPricePerNight } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Listing } from '@/types/listing';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Body, Caption1, Headline } from './ui/Typography';

type Props = {
    listing: Listing;
};

export function SearchResultCard({ listing }: Props) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    return (
        <Pressable
            style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1, borderBottomColor: colors.border }]}
            onPress={() => router.push(`/listing/${listing.id}`)}
        >
            <Image
                source={{ uri: listing.image_url ?? 'https://via.placeholder.com/150' }}
                style={styles.image}
                resizeMode="cover"
            />

            <View style={styles.content}>
                <Headline numberOfLines={1}>{listing.title}</Headline>
                <Body style={{ color: colors.textSecondary }}>{formatPricePerNight(listing.price)}</Body>
                <Caption1 style={{ color: colors.textTertiary }}>
                    {listing.beds} beds · {listing.baths || 1} baths
                </Caption1>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        paddingVertical: Spacing.m,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: Spacing.m,
        alignItems: 'center',
    },
    image: {
        width: 72,
        height: 72,
        borderRadius: BorderRadius.image, // 16
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: 2,
    },
});
