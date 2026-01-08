import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

/**
 * Pick an image from camera or gallery
 * @param useCamera - If true, opens camera; otherwise opens gallery
 * @returns Image URI or null if cancelled
 */
export async function pickReceiptImage(useCamera: boolean = false): Promise<string | null> {
    // Request permissions
    const { status } = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
        throw new Error('Permission to access camera/gallery was denied');
    }

    // Launch picker
    const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

    if (result.canceled) {
        return null;
    }

    return result.assets[0].uri;
}

/**
 * Upload payment receipt to Supabase storage
 * @param userId - User ID (for storage path)
 * @param bookingId - Booking ID (for storage path and filename)
 * @param imageUri - Local image URI
 * @returns Public URL of uploaded receipt or error
 */
export async function uploadPaymentReceipt(
    userId: string,
    bookingId: string,
    imageUri: string
): Promise<{ url?: string; error?: string }> {
    try {
        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
        });

        // Convert base64 to ArrayBuffer
        const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${bookingId}_${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;
        const arrayBuffer = decode(base64);

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
            .from('payment-receipts')
            .upload(filePath, arrayBuffer, {
                contentType: `image/${fileExt}`,
                upsert: false,
            });

        if (error) {
            return { error: error.message };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('payment-receipts')
            .getPublicUrl(filePath);

        return { url: urlData.publicUrl };
    } catch (err) {
        return { error: err instanceof Error ? err.message : 'Failed to upload receipt' };
    }
}

/**
 * Update booking with payment receipt
 * @param bookingId - Booking ID to update
 * @param receiptUrl - URL of uploaded receipt
 * @returns Success status and error if any
 */
export async function submitPaymentReceipt(
    bookingId: string,
    receiptUrl: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('bookings')
            .update({
                payment_receipt_url: receiptUrl,
                payment_submitted_at: new Date().toISOString(),
                status: 'payment_submitted',
            })
            .eq('id', bookingId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to submit receipt',
        };
    }
}
