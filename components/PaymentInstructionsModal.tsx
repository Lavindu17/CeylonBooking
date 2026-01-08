import { Button } from '@/components/ui/Button';
import { Body, BodyBold, Caption1, Title2 } from '@/components/ui/Typography';
import { BorderRadius, BrandColors, formatCurrency, SemanticColors, Spacing } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateAdvancePayment } from '@/lib/payment';
import { BankDetails } from '@/types/profile';
import { Ionicons } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
    totalPrice: number;
    bankDetails: BankDetails | null;
    onUploadReceipt: () => void;
};

export function PaymentInstructionsModal({
    visible,
    onClose,
    totalPrice,
    bankDetails,
    onUploadReceipt,
}: Props) {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;
    const advanceAmount = calculateAdvancePayment(totalPrice);

    const hasBankDetails = bankDetails &&
        bankDetails.bank_name &&
        bankDetails.account_number &&
        bankDetails.account_holder &&
        bankDetails.branch;

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
                        <Title2>Booking Request Sent! 🎉</Title2>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Success Message */}
                        <View style={[styles.successBox, { backgroundColor: BrandColors.ceylonGreenLight + '20' }]}>
                            <Ionicons name="checkmark-circle" size={48} color={BrandColors.ceylonGreen} />
                            <BodyBold style={{ marginTop: Spacing.m, textAlign: 'center' }}>
                                Your booking request has been sent!
                            </BodyBold>
                            <Caption1 style={{ marginTop: Spacing.xs, textAlign: 'center', color: colors.textSecondary }}>
                                Complete the payment to confirm your booking
                            </Caption1>
                        </View>

                        {/* Payment Amount */}
                        <View style={[styles.amountBox, { backgroundColor: colors.backgroundSecondary }]}>
                            <Caption1 style={{ color: colors.textSecondary }}>Advance Payment Required</Caption1>
                            <BodyBold style={{ fontSize: 32, color: BrandColors.ceylonGreen, marginVertical: Spacing.xs }}>
                                {formatCurrency(advanceAmount)}
                            </BodyBold>
                            <Caption1 style={{ color: colors.textSecondary }}>
                                (25% of {formatCurrency(totalPrice)} total)
                            </Caption1>
                        </View>

                        {/* Bank Details or Warning */}
                        {hasBankDetails ? (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="card-outline" size={20} color={BrandColors.ceylonGreen} />
                                    <BodyBold style={{ marginLeft: Spacing.xs }}>Bank Transfer Details</BodyBold>
                                </View>

                                <View style={[styles.bankDetailsBox, { backgroundColor: colors.backgroundSecondary }]}>
                                    <View style={styles.detailRow}>
                                        <Caption1 style={{ color: colors.textSecondary }}>Bank Name</Caption1>
                                        <Body>{bankDetails.bank_name}</Body>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.detailRow}>
                                        <Caption1 style={{ color: colors.textSecondary }}>Account Number</Caption1>
                                        <Body selectable>{bankDetails.account_number}</Body>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.detailRow}>
                                        <Caption1 style={{ color: colors.textSecondary }}>Account Holder</Caption1>
                                        <Body>{bankDetails.account_holder}</Body>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.detailRow}>
                                        <Caption1 style={{ color: colors.textSecondary }}>Branch</Caption1>
                                        <Body>{bankDetails.branch}</Body>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={[styles.warningBox, { backgroundColor: '#f59e0b15', borderColor: '#f59e0b30' }]}>
                                <Ionicons name="warning" size={24} color="#f59e0b" />
                                <Body style={{ marginLeft: Spacing.m, flex: 1, color: '#f59e0b' }}>
                                    The host hasn't added bank details yet. They will provide payment instructions soon.
                                </Body>
                            </View>
                        )}

                        {/* Instructions */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="information-circle-outline" size={20} color={BrandColors.ceylonGreen} />
                                <BodyBold style={{ marginLeft: Spacing.xs }}>Next Steps</BodyBold>
                            </View>

                            <View style={styles.stepsList}>
                                <View style={styles.step}>
                                    <View style={[styles.stepNumber, { backgroundColor: BrandColors.ceylonGreen }]}>
                                        <Caption1 style={{ color: 'white', fontWeight: '600' }}>1</Caption1>
                                    </View>
                                    <Body style={{ flex: 1, marginLeft: Spacing.m }}>
                                        Transfer {formatCurrency(advanceAmount)} to the bank account above
                                    </Body>
                                </View>

                                <View style={styles.step}>
                                    <View style={[styles.stepNumber, { backgroundColor: BrandColors.ceylonGreen }]}>
                                        <Caption1 style={{ color: 'white', fontWeight: '600' }}>2</Caption1>
                                    </View>
                                    <Body style={{ flex: 1, marginLeft: Spacing.m }}>
                                        Take a screenshot or photo of the payment receipt
                                    </Body>
                                </View>

                                <View style={styles.step}>
                                    <View style={[styles.stepNumber, { backgroundColor: BrandColors.ceylonGreen }]}>
                                        <Caption1 style={{ color: 'white', fontWeight: '600' }}>3</Caption1>
                                    </View>
                                    <Body style={{ flex: 1, marginLeft: Spacing.m }}>
                                        Upload the receipt in "My Trips" section
                                    </Body>
                                </View>

                                <View style={styles.step}>
                                    <View style={[styles.stepNumber, { backgroundColor: BrandColors.ceylonGreen }]}>
                                        <Caption1 style={{ color: 'white', fontWeight: '600' }}>4</Caption1>
                                    </View>
                                    <Body style={{ flex: 1, marginLeft: Spacing.m }}>
                                        Host will verify and confirm your booking
                                    </Body>
                                </View>
                            </View>
                        </View>

                        <Caption1 style={{ textAlign: 'center', color: colors.textSecondary, marginVertical: Spacing.l }}>
                            You can upload the receipt anytime from your "My Trips" section
                        </Caption1>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        {hasBankDetails && (
                            <Button
                                title="Upload Receipt Now"
                                onPress={() => {
                                    onClose();
                                    onUploadReceipt();
                                }}
                                style={{ flex: 1, marginRight: Spacing.xs }}
                            />
                        )}
                        <Button
                            title={hasBankDetails ? "I'll Do This Later" : "Got It"}
                            variant="secondary"
                            onPress={onClose}
                            style={hasBankDetails ? { flex: 1, marginLeft: Spacing.xs } : { flex: 1 }}
                        />
                    </View>
                </View>
            </View>
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
        paddingBottom: Spacing.xl,
        maxHeight: '90%',
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
    successBox: {
        padding: Spacing.l,
        borderRadius: BorderRadius.card,
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    amountBox: {
        padding: Spacing.l,
        borderRadius: BorderRadius.card,
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    section: {
        marginBottom: Spacing.l,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    bankDetailsBox: {
        padding: Spacing.m,
        borderRadius: BorderRadius.card,
    },
    detailRow: {
        paddingVertical: Spacing.s,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.m,
        borderRadius: BorderRadius.card,
        borderWidth: 1,
        marginBottom: Spacing.l,
    },
    stepsList: {
        gap: Spacing.m,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actions: {
        flexDirection: 'row',
        marginTop: Spacing.m,
        gap: Spacing.xs,
    },
});
