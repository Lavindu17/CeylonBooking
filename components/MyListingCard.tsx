import { BodyBold, Caption1 } from '@/components/ui/Typography';
import { BorderRadius, BrandColors, formatCurrency, SemanticColors, Shadows, Spacing } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Listing } from '@/types/listing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';

type Props = {
    listing: Listing;
    onDelete?: (id: string) => void;
};

export function MyListingCard({ listing, onDelete }: Props) {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;
    const router = useRouter();

    const handleDelete = () => {
        Alert.alert(
            'Delete Listing',
            `Are you sure you want to delete "${listing.title}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => onDelete?.(listing.id),
                },
            ]
        );
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.background, opacity: pressed ? 0.9 : 1 },
                Shadows.small,
            ]}
            onPress={() => router.push(`/listing/${listing.id}`)}
        >
            {/* Image */}
            <Image
                source={{
                    uri: (listing.images && listing.images.length > 0)
                        ? listing.images[0].url
                        : (listing.image_url ?? undefined)
                }}
                style={styles.image}
                resizeMode="cover"
            />

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <BodyBold style={{ fontSize: 16, marginBottom: 4 }}>
                            {listing.title}
                        </BodyBold>
                        <View style={styles.row}>
                            <Ionicons name="location" size={14} color={colors.textSecondary} />
                            <Caption1 style={{ color: colors.textSecondary, marginLeft: 4 }}>
                                {listing.location}
                            </Caption1>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Pressable
                            style={[styles.iconButton, { backgroundColor: colors.backgroundSecondary }]}
                            onPress={handleDelete}
                        >
                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </Pressable>
                    </View>
                </View>

                {/* Stats */}
                <View style={[styles.stats, { marginTop: Spacing.s }]}>
                    <View style={styles.stat}>
                        <Ionicons name="bed-outline" size={16} color={colors.textSecondary} />
                        <Caption1 style={{ color: colors.textSecondary, marginLeft: 4 }}>
                            {listing.beds} Beds
                        </Caption1>
                    </View>
                    <View style={styles.stat}>
                        <Ionicons name="water-outline" size={16} color={colors.textSecondary} />
                        <Caption1 style={{ color: colors.textSecondary, marginLeft: 4 }}>
                            {listing.baths} Bath
                        </Caption1>
                    </View>
                </View>

                {/* Price */}
                <BodyBold style={{ color: BrandColors.ceylonGreen, fontSize: 18, marginTop: Spacing.s }}>
                    {formatCurrency(listing.price)}
                    <Caption1 style={{ color: colors.textSecondary }}> / night</Caption1>
                </BodyBold>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.m,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 180,
        backgroundColor: '#f0f0f0',
    },
    content: {
        padding: Spacing.m,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actions: {
        flexDirection: 'row',
        gap: Spacing.s,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stats: {
        flexDirection: 'row',
        gap: Spacing.m,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
