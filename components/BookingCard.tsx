import { Body, BodyBold, Caption1 } from '@/components/ui/Typography';
import { BorderRadius, BrandColors, formatCurrency, SemanticColors, Spacing } from '@/constants/Design';
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
                return '#f59e0b'; // yellow
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
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {/* Listing Name */}
            <BodyBold style={{ fontSize: 16, marginBottom: Spacing.xs }}>
                {booking.listing.title}
            </BodyBold>

            {/* Location */}
            <View style={styles.row}>
                <Ionicons name="location" size={14} color={colors.textSecondary} />
                <Caption1 style={{ color: colors.textSecondary, marginLeft: 4 }}>
                    {booking.listing.location}
                </Caption1>
            </View>

            {/* Dates */}
            <View style={[styles.row, { marginTop: Spacing.s }]}>
                <Ionicons name="calendar" size={16} color={colors.textPrimary} />
                <Body style={{ marginLeft: Spacing.xs }}>
                    {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                </Body>
            </View>

            <Caption1 style={{ color: colors.textSecondary, marginLeft: 24 }}>
                {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}
            </Caption1>

            {/* Status and Price */}
            <View style={[styles.footer, { marginTop: Spacing.m }]}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
                    <Ionicons name={getStatusIcon()} size={14} color={getStatusColor()} />
                    <Caption1 style={{ color: getStatusColor(), marginLeft: 4, fontWeight: '600' }}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Caption1>
                </View>

                <BodyBold style={{ color: BrandColors.ceylonGreen }}>
                    {formatCurrency(booking.total_price)}
                </BodyBold>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: Spacing.m,
        borderRadius: BorderRadius.card,
        borderWidth: 1,
        marginBottom: Spacing.m,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.s,
        paddingVertical: 4,
        borderRadius: BorderRadius.small,
    },
});
