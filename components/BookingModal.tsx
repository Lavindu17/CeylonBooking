import { Button } from '@/components/ui/Button';
import { Body, BodyBold, Title2 } from '@/components/ui/Typography';
import { BorderRadius, BrandColors, formatCurrency, SemanticColors, Spacing } from '@/constants/Design';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateAdvancePayment } from '@/lib/payment';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types/listing';
import { BankDetails } from '@/types/profile';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { PaymentInstructionsModal } from './PaymentInstructionsModal';
import { ReceiptUploadModal } from './ReceiptUploadModal';

type Props = {
    visible: boolean;
    onClose: () => void;
    listing: Listing;
    onBookingCreated?: () => void;
};

export function BookingModal({ visible, onClose, listing, onBookingCreated }: Props) {
    const { user } = useAuth();
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
    const [showReceiptUpload, setShowReceiptUpload] = useState(false);
    const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
    const [hostBankDetails, setHostBankDetails] = useState<BankDetails | null>(null);
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    // Fetch host bank details when modal opens
    useEffect(() => {
        if (visible && listing.host_id) {
            fetchHostBankDetails();
        }
    }, [visible, listing.host_id]);

    const fetchHostBankDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('bank_name, account_number, account_holder, branch')
                .eq('id', listing.host_id)
                .single();

            if (!error && data) {
                setHostBankDetails(data as BankDetails);
            }
        } catch (err) {
            console.error('Failed to fetch bank details:', err);
        }
    };

    const onDayPress = (day: DateData) => {
        if (!startDate || (startDate && endDate)) {
            setStartDate(day.dateString);
            setEndDate(null);
        } else if (startDate && !endDate) {
            if (day.dateString < startDate) {
                setStartDate(day.dateString);
            } else {
                setEndDate(day.dateString);
            }
        }
    };

    const markedDates: any = {};
    if (startDate) markedDates[startDate] = { startingDay: true, color: BrandColors.ceylonGreen, textColor: 'white' };
    if (endDate) markedDates[endDate] = { endingDay: true, color: BrandColors.ceylonGreen, textColor: 'white' };
    if (startDate && endDate) {
        let start = new Date(startDate);
        let end = new Date(endDate);
        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            if (dateStr !== startDate && dateStr !== endDate) {
                markedDates[dateStr] = { color: BrandColors.ceylonGreenLight, textColor: 'white', marked: true };
            }
        }
    }

    const calculateTotal = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays * listing.price;
    };

    const handleBooking = async () => {
        if (!startDate || !endDate || !user) return;
        setLoading(true);

        const totalPrice = calculateTotal();
        const advanceAmount = calculateAdvancePayment(totalPrice);

        const { data, error } = await supabase.from('bookings').insert({
            listing_id: listing.id,
            user_id: user.id,
            start_date: startDate,
            end_date: endDate,
            total_price: totalPrice,
            advance_payment_amount: advanceAmount,
            status: 'pending'
        }).select().single();

        setLoading(false);

        if (error) {
            alert('Booking failed: ' + error.message);
        } else if (data) {
            // Store booking ID for receipt upload
            setCreatedBookingId(data.id);
            // Show payment instructions instead of simple alert
            setShowPaymentInstructions(true);
            // Notify parent component
            onBookingCreated?.();
        }
    };

    const handleClosePaymentInstructions = () => {
        setShowPaymentInstructions(false);
        onClose();
        // Reset state
        setStartDate(null);
        setEndDate(null);
        setCreatedBookingId(null);
    };

    const handleOpenReceiptUpload = () => {
        setShowReceiptUpload(true);
    };

    const handleReceiptUploadSuccess = () => {
        // Booking list will update automatically via real-time subscription
        setShowReceiptUpload(false);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.overlayTouchable}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <View />
                </TouchableOpacity>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={styles.header}>
                        <Title2>Select Dates</Title2>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <Calendar
                        onDayPress={onDayPress}
                        markedDates={markedDates}
                        markingType={'period'}
                        theme={{
                            backgroundColor: colors.background,
                            calendarBackground: colors.background,
                            textSectionTitleColor: colors.textSecondary,
                            todayTextColor: BrandColors.ceylonGreen,
                            dayTextColor: colors.textPrimary,
                            arrowColor: BrandColors.ceylonGreen,
                            monthTextColor: colors.textPrimary,
                        }}
                    />

                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <View>
                            <BodyBold>{formatCurrency(calculateTotal())}</BodyBold>
                            <Body style={{ fontSize: 13, color: colors.textSecondary }}>
                                {startDate && endDate ?
                                    `${Math.ceil(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} nights`
                                    : 'Select dates'}
                            </Body>
                        </View>

                        <Button
                            title={loading ? 'Requesting...' : 'Request Booking'}
                            onPress={handleBooking}
                            loading={loading}
                            disabled={!startDate || !endDate}
                            style={{ width: 160 }}
                        />
                    </View>

                    <Body style={{ textAlign: 'center', marginTop: Spacing.s, color: colors.textSecondary, fontSize: 12 }}>
                        You won't be charged yet
                    </Body>
                </View>
            </View>

            {/* Payment Instructions Modal */}
            <PaymentInstructionsModal
                visible={showPaymentInstructions}
                onClose={handleClosePaymentInstructions}
                totalPrice={calculateTotal()}
                bankDetails={hostBankDetails}
                onUploadReceipt={handleOpenReceiptUpload}
            />

            {/* Receipt Upload Modal */}
            {createdBookingId && user && (
                <ReceiptUploadModal
                    visible={showReceiptUpload}
                    onClose={() => setShowReceiptUpload(false)}
                    bookingId={createdBookingId}
                    userId={user.id}
                    onSuccess={handleReceiptUploadSuccess}
                />
            )}
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'flex-end',
    },
    overlayTouchable: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    container: {
        borderTopLeftRadius: BorderRadius.bottomSheet,
        borderTopRightRadius: BorderRadius.bottomSheet,
        padding: Spacing.l,
        paddingBottom: Spacing.xl, // Safe area
        minHeight: '60%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    closeButton: {
        padding: 4,
    },
    footer: {
        marginTop: Spacing.l,
        paddingTop: Spacing.m,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
