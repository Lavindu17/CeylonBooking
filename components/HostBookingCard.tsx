import { Button } from '@/components/ui/Button';
import { Body, BodyBold, Caption1 } from '@/components/ui/Typography';
import { BorderRadius, BrandColors, formatCurrency, SemanticColors, Shadows, Spacing } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateAdvancePayment } from '@/lib/payment';
import { BookingWithDetails } from '@/types/booking';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ReceiptViewerModal } from './ReceiptViewerModal';

type Props = {
    booking: BookingWithDetails;
    onUpdateStatus: (bookingId: string, status: 'confirmed' | 'cancelled') => Promise<{ success: boolean; error?: string }>;
};

export function HostBookingCard({ booking, onUpdateStatus }: Props) {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;
    const [loading, setLoading] = useState(false);
    const [showReceiptViewer, setShowReceiptViewer] = useState(false);

    const getStatusColor = () => {
        switch (booking.status) {
            case 'confirmed':
                return '#10b981';
            case 'cancelled':
                return '#ef4444';
            case 'payment_submitted':
                return '#3b82f6';
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

    const handleVerifyAndConfirm = async () => {
        setShowReceiptViewer(false);
        setLoading(true);
        const result = await onUpdateStatus(booking.id, 'confirmed');
        setLoading(false);

        if (result.success) {
            Alert.alert('Success', 'Payment verified and booking confirmed!');
        } else {
            Alert.alert('Error', result.error || 'Failed to confirm booking');
        }
    };

    const handleReject = async () => {
        setShowReceiptViewer(false);

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
    const isPaymentSubmitted = booking.status === 'payment_submitted';
    const hasReceipt = !!booking.payment_receipt_url;
    const advanceAmount = booking.advance_payment_amount || calculateAdvancePayment(booking.total_price);

    return (
        <>
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

                {/* Payment Receipt Preview */}
                {isPaymentSubmitted && hasReceipt && (
                    <TouchableOpacity
                        style={[styles.receiptPreview, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() => setShowReceiptViewer(true)}
                    >
                        <View style={styles.receiptImageContainer}>
                            <Image
                                source={{ uri: booking.payment_receipt_url }}
                                style={styles.receiptThumbnail}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                            />
                            <View style={styles.receiptOverlay}>
                                <Ionicons name="eye" size={24} color="#fff" />
                            </View>
                        </View>
                        <View style={{ marginLeft: Spacing.m, flex: 1 }}>
                            <BodyBold style={{ fontSize: 15 }}>Payment Receipt Submitted</BodyBold>
                            <Caption1 style={{ color: colors.textSecondary, marginTop: 2 }}>
                                Tap to view and verify receipt
                            </Caption1>
                            <Caption1 style={{ color: BrandColors.ceylonGreen, marginTop: 4, fontWeight: '600' }}>
                                Expected: {formatCurrency(advanceAmount)} (25%)
                            </Caption1>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
                )}

                {/* Awaiting Payment Notice */}
                {isPending && !hasReceipt && (
                    <View style={[styles.infoBox, { backgroundColor: '#f59e0b15', borderColor: '#f59e0b30' }]}>
                        <Ionicons name="time" size={20} color="#f59e0b" />
                        <View style={{ marginLeft: Spacing.s, flex: 1 }}>
                            <Caption1 style={{ color: '#f59e0b', fontWeight: '600' }}>
                                Awaiting guest payment
                            </Caption1>
                            <Caption1 style={{ color: colors.textSecondary, marginTop: 2 }}>
                                Guest needs to pay {formatCurrency(advanceAmount)} advance
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

                {/* Action Buttons */}
                {isPaymentSubmitted && hasReceipt && (
                    <View style={styles.actions}>
                        <Button
                            title="Reject"
                            variant="destructive"
                            onPress={handleReject}
                            disabled={loading}
                            style={{ flex: 1, marginRight: Spacing.xs }}
                        />
                        <Button
                            title="Verify & Confirm"
                            onPress={() => setShowReceiptViewer(true)}
                            loading={loading}
                            disabled={loading}
                            style={{ flex: 1, marginLeft: Spacing.xs }}
                        />
                    </View>
                )}

                {(isPending && !hasReceipt) && (
                    <View style={styles.actions}>
                        <Button
                            title="Reject Booking"
                            variant="secondary"
                            onPress={handleReject}
                            disabled={loading}
                            style={{ flex: 1 }}
                        />
                    </View>
                )}
            </View>

            {/* Receipt Viewer Modal */}
            {hasReceipt && (
                <ReceiptViewerModal
                    visible={showReceiptViewer}
                    onClose={() => setShowReceiptViewer(false)}
                    receiptUrl={booking.payment_receipt_url!}
                    onVerifyAndConfirm={isPaymentSubmitted ? handleVerifyAndConfirm : undefined}
                    onReject={isPaymentSubmitted ? handleReject : undefined}
                    isVerifying={loading}
                />
            )}
        </>
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
    receiptPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.m,
        borderRadius: BorderRadius.small,
        marginTop: Spacing.m,
    },
    receiptImageContainer: {
        width: 60,
        height: 60,
        borderRadius: BorderRadius.small,
        overflow: 'hidden',
        position: 'relative',
    },
    receiptThumbnail: {
        width: '100%',
        height: '100%',
    },
    receiptOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoBox: {
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
    actions: {
        flexDirection: 'row',
        marginTop: Spacing.l,
        paddingTop: Spacing.m,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
    },
});
