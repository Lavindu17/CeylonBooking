import { Body, Title2 } from '@/components/ui/Typography';
import { BorderRadius, SemanticColors } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
    receiptUrl: string;
    onVerifyAndConfirm?: () => void;
    onReject?: () => void;
    isVerifying?: boolean;
};

export function ReceiptViewerModal({
    visible,
    onClose,
    receiptUrl,
    onVerifyAndConfirm,
    onReject,
    isVerifying = false,
}: Props) {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;
    const [imageLoading, setImageLoading] = useState(true);

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                {/* Close button (top right) */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    disabled={isVerifying}
                >
                    <View style={styles.closeButtonCircle}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </View>
                </TouchableOpacity>

                {/* Receipt Image */}
                <View style={styles.imageContainer}>
                    {imageLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#fff" />
                            <Body style={{ color: '#fff', marginTop: 16 }}>Loading receipt...</Body>
                        </View>
                    )}
                    <Image
                        source={{ uri: receiptUrl }}
                        style={styles.image}
                        resizeMode="contain"
                        onLoadStart={() => setImageLoading(true)}
                        onLoadEnd={() => setImageLoading(false)}
                    />
                </View>

                {/* Action Buttons */}
                {(onVerifyAndConfirm || onReject) && (
                    <View style={[styles.actionsContainer, { backgroundColor: colors.background }]}>
                        <Title2 style={{ marginBottom: 12 }}>Verify Payment Receipt</Title2>
                        <Body style={{ color: colors.textSecondary, marginBottom: 20 }}>
                            Review the payment receipt and confirm if the payment has been received.
                        </Body>

                        <View style={styles.buttonRow}>
                            {onReject && (
                                <TouchableOpacity
                                    style={[styles.button, styles.rejectButton]}
                                    onPress={onReject}
                                    disabled={isVerifying}
                                >
                                    {isVerifying ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons name="close-circle" size={20} color="#fff" />
                                            <Body style={{ color: '#fff', marginLeft: 8, fontWeight: '600' }}>
                                                Reject
                                            </Body>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}

                            {onVerifyAndConfirm && (
                                <TouchableOpacity
                                    style={[styles.button, styles.confirmButton]}
                                    onPress={onVerifyAndConfirm}
                                    disabled={isVerifying}
                                >
                                    {isVerifying ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                            <Body style={{ color: '#fff', marginLeft: 8, fontWeight: '600' }}>
                                                Verify & Confirm
                                            </Body>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
    },
    closeButtonCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    actionsContainer: {
        padding: 24,
        paddingBottom: 40,
        borderTopLeftRadius: BorderRadius.bottomSheet,
        borderTopRightRadius: BorderRadius.bottomSheet,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: BorderRadius.button,
    },
    rejectButton: {
        backgroundColor: '#ef4444',
    },
    confirmButton: {
        backgroundColor: '#10b981',
    },
});
