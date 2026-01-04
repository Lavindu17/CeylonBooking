import { Button } from '@/components/ui/Button';
import { Body, BodyBold, Caption1 } from '@/components/ui/Typography';
import { BorderRadius, BrandColors, formatCurrency, SemanticColors, Shadows, Spacing } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BookingWithDetails } from '@/types/booking';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

type Props = {
    booking: BookingWithDetails;
    onUpdateStatus: (bookingId: string, status: 'confirmed' | 'cancelled') => Promise<{ success: boolean; error?: string }>;
};

export function HostBookingCard({ booking, onUpdateStatus }: Props) {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;
    const [loading, setLoading] = useState(false);

    const getStatusColor = () => {
        switch (booking.status) {
            case 'confirmed':
                return '#10b981';
            case 'cancelled':
                return '#ef4444';
            case 'pending':
            default:
                return '#f59e0b';
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

    const handleApprove = async () => {
        setLoading(true);
        const result = await onUpdateStatus(booking.id, 'confirmed');
        setLoading(false);

        if (result.success) {
            Alert.alert('Success', 'Booking approved successfully!');
        } else {
            Alert.alert('Error', result.error || 'Failed to approve booking');
        }
    };

    const handleReject = async () => {
        Alert.alert(
            'Reject Booking',
            'Are you sure you want to reject this booking request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        const result = await onUpdateStatus(booking.id, 'cancelled');
                        setLoading(false);

                        if (result.success) {
                            Alert.alert('Success', 'Booking rejected');
                        } else {
                            Alert.alert('Error', result.error || 'Failed to reject booking');
                        }
                    },
                },
            ]
        );
    };

    const isPending = booking.status === 'pending';

    return (
        <View style={[
            styles.card,
            { backgroundColor: colors.background },
            Shadows.small
        ]}>
            {/* Guest Info */}
            <View style={[styles.guestRow, { backgroundColor: colors.backgroundSecondary }]}>
                <Ionicons name="person-circle" size={20} color={BrandColors.ceylonGreen} />
                <Caption1 style={{ color: colors.textSecondary, marginLeft: Spacing.xs, flex: 1 }}>
                    {booking.guest_email || 'Unknown Guest'}
                </Caption1>
            </View>

            {/* Listing Name */}
            <BodyBold style={{ fontSize: 17, marginTop: Spacing.m, marginBottom: Spacing.xs }}>
                {booking.listing.title}
            </BodyBold>

            {/* Dates */}
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

            {/* Action Buttons */}
            {isPending && (
                <View style={styles.actions}>
                    <Button
                        title="Reject"
                        variant="secondary"
                        onPress={handleReject}
                        disabled={loading}
                        style={{ flex: 1, marginRight: Spacing.xs }}
                    />
                    <Button
                        title="Approve"
                        onPress={handleApprove}
                        loading={loading}
                        disabled={loading}
                        style={{ flex: 1, marginLeft: Spacing.xs }}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: Spacing.l,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.m,
    },
    guestRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        borderRadius: BorderRadius.small,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: Spacing.s,
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
    actions: {
        flexDirection: 'row',
        marginTop: Spacing.l,
        paddingTop: Spacing.m,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
    },
});
