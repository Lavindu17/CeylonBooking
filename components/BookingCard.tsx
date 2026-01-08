import { Button } from '@/components/ui/Button';
import { Body, BodyBold, Caption1 } from '@/components/ui/Typography';
import { BorderRadius, BrandColors, formatCurrency, SemanticColors, Shadows, Spacing } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateAdvancePayment } from '@/lib/payment';
import { BookingWithListing } from '@/types/booking';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ReceiptUploadModal } from './ReceiptUploadModal';

type Props = {
    booking: BookingWithListing;
    userId: string;
    onReceiptUploaded?: () => void;
};

export function BookingCard({ booking, userId, onReceiptUploaded }: Props) {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;
    const [showReceiptUpload, setShowReceiptUpload] = useState(false);

    const getStatusColor = () => {
        switch (booking.status) {
            case 'confirmed':
                return '#10b981'; // green
            case 'cancelled':
                return '#ef4444'; // red
            case 'payment_submitted':
                return '#3b82f6'; // blue
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
            case 'payment_submitted':
                return 'document-text' as const;
            case 'pending':
            default:
                return 'time' as const;
        }
    };

    const getStatusText = () => {
        switch (booking.status) {
            case 'confirmed':
                return 'Confirmed';
            case 'cancelled':
                return 'Cancelled';
            case 'payment_submitted':
                return 'Payment Submitted';
            case 'pending':
            default:
                return 'Awaiting Payment';
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

    const handleReceiptUploadSuccess = () => {
        setShowReceiptUpload(false);
        onReceiptUploaded?.();
    };

    const isPending = booking.status === 'pending';
    const isPaymentSubmitted = booking.status === 'payment_submitted';
    const advanceAmount = booking.advance_payment_amount || calculateAdvancePayment(booking.total_price);

    return (
        <>
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

                {/* Payment Info for Pending Status */}
                {isPending && (
                    <View style={[styles.paymentInfo, { backgroundColor: colors.backgroundSecondary }]}>
                        <View style={styles.row}>
                            <Ionicons name="cash-outline" size={16} color={BrandColors.ceylonGreen} />
                            <Caption1 style={{ marginLeft: 6, color: colors.textSecondary }}>
                                Advance Payment Required
                            </Caption1>
                        </View>
                        <BodyBold style={{ fontSize: 15, color: BrandColors.ceylonGreen, marginTop: 4 }}>
                            {formatCurrency(advanceAmount)}
                        </BodyBold>
                    </View>
                )}

                {/* Receipt Submitted Info */}
                {isPaymentSubmitted && (
                    <View style={[styles.receiptInfo, { backgroundColor: '#3b82f615', borderColor: '#3b82f630' }]}>
                        <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                        <View style={{ marginLeft: Spacing.s, flex: 1 }}>
                            <Caption1 style={{ color: '#3b82f6', fontWeight: '600' }}>
                                Payment receipt submitted
                            </Caption1>
                            <Caption1 style={{ color: colors.textSecondary, marginTop: 2 }}>
                                Host is verifying your payment
                            </Caption1>
                        </View>
                    </View>
                )}

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Status and Price */}
                <View style={styles.footer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '15', borderColor: getStatusColor() + '30' }]}>
                        <Ionicons name={getStatusIcon()} size={16} color={getStatusColor()} />
                        <Caption1 style={{ color: getStatusColor(), marginLeft: 6, fontWeight: '600' }}>
                            {getStatusText()}
                        </Caption1>
                    </View>

                    <BodyBold style={{ color: BrandColors.ceylonGreen, fontSize: 18 }}>
                        {formatCurrency(booking.total_price)}
                    </BodyBold>
                </View>

                {/* Upload Receipt Button for Pending Bookings */}
                {isPending && !booking.payment_receipt_url && (
                    <View style={styles.actionSection}>
                        <Button
                            title="Upload Payment Receipt"
                            onPress={() => setShowReceiptUpload(true)}
                            icon={<Ionicons name="cloud-upload-outline" size={20} color="white" />}
                        />
                        <Caption1 style={{ textAlign: 'center', color: colors.textSecondary, marginTop: Spacing.s }}>
                            Upload your payment receipt to proceed with booking
                        </Caption1>
                    </View>
                )}
            </View>

            {/* Receipt Upload Modal */}
            <ReceiptUploadModal
                visible={showReceiptUpload}
                onClose={() => setShowReceiptUpload(false)}
                bookingId={booking.id}
                userId={userId}
                onSuccess={handleReceiptUploadSuccess}
            />
        </>
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
    paymentInfo: {
        padding: Spacing.m,
        borderRadius: BorderRadius.small,
        marginTop: Spacing.m,
    },
    receiptInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.m,
        borderRadius: BorderRadius.small,
        borderWidth: 1,
        marginTop: Spacing.m,
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
    actionSection: {
        marginTop: Spacing.l,
        paddingTop: Spacing.m,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
    },
});
