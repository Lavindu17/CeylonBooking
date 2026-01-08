import { Button } from '@/components/ui/Button';
import { Body, BodyBold, Caption1, Title2 } from '@/components/ui/Typography';
import { BorderRadius, BrandColors, SemanticColors, Spacing } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { pickReceiptImage, submitPaymentReceipt, uploadPaymentReceipt } from '@/lib/uploadReceipt';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
    bookingId: string;
    userId: string;
    onSuccess: () => void;
};

export function ReceiptUploadModal({
    visible,
    onClose,
    bookingId,
    userId,
    onSuccess,
}: Props) {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const handlePickImage = async (useCamera: boolean) => {
        try {
            const uri = await pickReceiptImage(useCamera);
            if (uri) {
                setSelectedImage(uri);
            }
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to pick image');
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) return;

        setUploading(true);

        try {
            // Upload to storage
            const { url, error: uploadError } = await uploadPaymentReceipt(
                userId,
                bookingId,
                selectedImage
            );

            if (uploadError || !url) {
                throw new Error(uploadError || 'Failed to upload receipt');
            }

            // Update booking with receipt URL
            const { success, error: submitError } = await submitPaymentReceipt(bookingId, url);

            if (!success) {
                throw new Error(submitError || 'Failed to submit receipt');
            }

            // Success
            Alert.alert(
                'Receipt Uploaded!',
                'Your payment receipt has been submitted. The host will verify and confirm your booking soon.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setSelectedImage(null);
                            onClose();
                            onSuccess();
                        },
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Upload Failed', error instanceof Error ? error.message : 'Something went wrong');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        if (!uploading) {
            setSelectedImage(null);
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.overlayTouchable}
                    activeOpacity={1}
                    onPress={handleClose}
                    disabled={uploading}
                >
                    <View />
                </TouchableOpacity>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={styles.header}>
                        <Title2>Upload Payment Receipt</Title2>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={styles.closeButton}
                            disabled={uploading}
                        >
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {selectedImage ? (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: selectedImage }} style={styles.image} resizeMode="contain" />
                            {!uploading && (
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => setSelectedImage(null)}
                                >
                                    <Ionicons name="close-circle" size={32} color="#ef4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View style={styles.uploadOptions}>
                            <Body style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: Spacing.l }}>
                                Choose how to upload your payment receipt
                            </Body>

                            <TouchableOpacity
                                style={[styles.optionButton, { backgroundColor: colors.backgroundSecondary }]}
                                onPress={() => handlePickImage(true)}
                            >
                                <Ionicons name="camera" size={32} color={BrandColors.ceylonGreen} />
                                <BodyBold style={{ marginTop: Spacing.s }}>Take Photo</BodyBold>
                                <Caption1 style={{ color: colors.textSecondary, marginTop: 4 }}>
                                    Use camera to capture receipt
                                </Caption1>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.optionButton, { backgroundColor: colors.backgroundSecondary }]}
                                onPress={() => handlePickImage(false)}
                            >
                                <Ionicons name="images" size={32} color={BrandColors.ceylonGreen} />
                                <BodyBold style={{ marginTop: Spacing.s }}>Choose from Gallery</BodyBold>
                                <Caption1 style={{ color: colors.textSecondary, marginTop: 4 }}>
                                    Select existing photo
                                </Caption1>
                            </TouchableOpacity>
                        </View>
                    )}

                    {selectedImage && (
                        <View style={styles.actions}>
                            {uploading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={BrandColors.ceylonGreen} />
                                    <Body style={{ marginTop: Spacing.m, color: colors.textSecondary }}>
                                        Uploading receipt...
                                    </Body>
                                </View>
                            ) : (
                                <>
                                    <Button
                                        title="Cancel"
                                        variant="secondary"
                                        onPress={() => setSelectedImage(null)}
                                        style={{ flex: 1, marginRight: Spacing.xs }}
                                    />
                                    <Button
                                        title="Upload Receipt"
                                        onPress={handleUpload}
                                        style={{ flex: 1, marginLeft: Spacing.xs }}
                                    />
                                </>
                            )}
                        </View>
                    )}
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
    uploadOptions: {
        flex: 1,
        justifyContent: 'center',
        gap: Spacing.m,
    },
    optionButton: {
        padding: Spacing.l,
        borderRadius: BorderRadius.card,
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#000',
        borderRadius: BorderRadius.card,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    removeButton: {
        position: 'absolute',
        top: Spacing.m,
        right: Spacing.m,
        backgroundColor: 'white',
        borderRadius: 16,
    },
    actions: {
        flexDirection: 'row',
        marginTop: Spacing.l,
        gap: Spacing.xs,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.l,
    },
});
