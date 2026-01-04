import { Body, BodyBold, Caption1 } from '@/components/ui/Typography';
import { BorderRadius, BrandColors, formatCurrency, SemanticColors, Shadows, Spacing } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BookingWithListing } from '@/types/booking';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

type Props = {
    booking: BookingWithListing;
};

export function BookingCard({ booking }: Props) {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    const getStatusColor = () => {
        switch (booking.status) {
            case 'confirmed':
                return '#10b981'; // green
            case 'cancelled':
                return '#ef4444'; // red
            case 'pending':
            default:
                return '#f59e0b'; // yellow/amber
        }
    };

    const getStatusIcon = () => {
        switch (booking.status) {
            case 'confirmed':
                return 'checkmark-circle' as const;
            case 'cancelled':
                return 'close-circle' as const;
            case 'pending':
            default:
                return 'time' as const;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const calculateNights = () => {
        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <View style={[
            styles.card,
            { backgroundColor: colors.background },
            Shadows.small
        ]}>
            {/* Listing Name */}
            <BodyBold style={{ fontSize: 17, marginBottom: Spacing.xs }}>
                {booking.listing.title}
            </BodyBold>

            {/* Location */}
            <View style={styles.row}>
                <Ionicons name="location" size={15} color={colors.textSecondary} />
                <Caption1 style={{ color: colors.textSecondary, marginLeft: 4 }}>
                    {booking.listing.location}
                </Caption1>
            </View>

            {/* Dates */}
            <View style={[styles.dateSection, { marginTop: Spacing.m }]}>
                <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={18} color={BrandColors.ceylonGreen} />
                    <View style={{ marginLeft: Spacing.s, flex: 1 }}>
                        <Body style={{ fontSize: 15 }}>
                            {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                        </Body>
                        <Caption1 style={{ color: colors.textSecondary, marginTop: 2 }}>
                            {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}
                        </Caption1>
                    </View>
                </View>
            </View>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Status and Price */}
            <View style={styles.footer}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '15', borderColor: getStatusColor() + '30' }]}>
                    <Ionicons name={getStatusIcon()} size={16} color={getStatusColor()} />
                    <Caption1 style={{ color: getStatusColor(), marginLeft: 6, fontWeight: '600' }}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Caption1>
                </View>

                <BodyBold style={{ color: BrandColors.ceylonGreen, fontSize: 18 }}>
                    {formatCurrency(booking.total_price)}
                </BodyBold>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: Spacing.l,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.m,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateSection: {
        paddingVertical: Spacing.xs,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    divider: {
        height: 1,
        marginVertical: Spacing.m,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
        paddingVertical: 6,
        borderRadius: BorderRadius.small,
        borderWidth: 1,
    },
});
