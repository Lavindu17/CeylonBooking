import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

export interface UploadProgress {
    imageIndex: number;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    url?: string;
    error?: string;
}

/**
 * Compress and upload a single image to Supabase Storage
 * @param uri Local file URI from image picker
 * @param listingId The listing ID to associate the image with
 * @param order Display order (0 = cover image)
 * @returns Public URL of the uploaded image
 */
export async function uploadListingImage(
    uri: string,
    listingId: string,
    order: number
): Promise<{ url: string; storagePath: string }> {
    try {
        // Generate unique filename
        const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${Date.now()}_${order}.${fileExt}`;
        const storagePath = `${listingId}/${fileName}`;

        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
        });

        // Convert base64 to ArrayBuffer
        const arrayBuffer = decode(base64);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('listing-images')
            .upload(storagePath, arrayBuffer, {
                contentType: `image/${fileExt}`,
                upsert: false,
            });

        if (error) {
            console.error('Upload error:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('listing-images')
            .getPublicUrl(storagePath);

        return {
            url: urlData.publicUrl,
            storagePath: data.path,
        };
    } catch (error: any) {
        console.error('Error in uploadListingImage:', error);
        throw error;
    }
}

/**
 * Upload multiple images for a listing
 * @param uris Array of local file URIs
 * @param listingId The listing ID
 * @param onProgress Optional callback for progress updates
 * @returns Array of uploaded image data
 */
export async function uploadListingImages(
    uris: string[],
    listingId: string,
    onProgress?: (progress: UploadProgress) => void
): Promise<Array<{ url: string; storagePath: string; order: number }>> {
    const results: Array<{ url: string; storagePath: string; order: number }> = [];

    for (let i = 0; i < uris.length; i++) {
        try {
            onProgress?.({
                imageIndex: i,
                progress: 0,
                status: 'uploading',
            });

            const result = await uploadListingImage(uris[i], listingId, i);

            results.push({
                ...result,
                order: i,
            });

            onProgress?.({
                imageIndex: i,
                progress: 100,
                status: 'success',
                url: result.url,
            });
        } catch (error: any) {
            onProgress?.({
                imageIndex: i,
                progress: 0,
                status: 'error',
                error: error.message,
            });

            // Continue with other images even if one fails
            console.error(`Failed to upload image ${i}:`, error);
        }
    }

    return results;
}

/**
 * Delete an image from Supabase Storage
 * @param storagePath The storage path of the image to delete
 */
export async function deleteListingImage(storagePath: string): Promise<void> {
    try {
        const { error } = await supabase.storage
            .from('listing-images')
            .remove([storagePath]);

        if (error) {
            throw new Error(`Failed to delete image: ${error.message}`);
        }
    } catch (error: any) {
        console.error('Error in deleteListingImage:', error);
        throw error;
    }
}

/**
 * Delete all images for a listing
 * @param listingId The listing ID
 */
export async function deleteAllListingImages(listingId: string): Promise<void> {
    try {
        // List all files in the listing folder
        const { data: files, error: listError } = await supabase.storage
            .from('listing-images')
            .list(listingId);

        if (listError) throw listError;

        if (files && files.length > 0) {
            const filePaths = files.map(file => `${listingId}/${file.name}`);
            const { error: deleteError } = await supabase.storage
                .from('listing-images')
                .remove(filePaths);

            if (deleteError) throw deleteError;
        }
    } catch (error: any) {
        console.error('Error in deleteAllListingImages:', error);
        throw error;
    }
}

/**
 * Get public URL for a storage path
 * @param storagePath The storage path
 * @returns Public URL
 */
export function getPublicUrl(storagePath: string): string {
    const { data } = supabase.storage
        .from('listing-images')
        .getPublicUrl(storagePath);

    return data.publicUrl;
}

/**
 * Save image metadata to database
 * @param listingId The listing ID
 * @param imageData Array of image data with URLs and storage paths
 */
export async function saveImageMetadata(
    listingId: string,
    imageData: Array<{ url: string; storagePath: string; order: number }>
): Promise<void> {
    try {
        const records = imageData.map(img => ({
            listing_id: listingId,
            storage_path: img.storagePath,
            url: img.url,
            order: img.order,
        }));

        const { error } = await supabase
            .from('listing_images')
            .insert(records);

        if (error) {
            throw new Error(`Failed to save image metadata: ${error.message}`);
        }
    } catch (error: any) {
        console.error('Error in saveImageMetadata:', error);
        throw error;
    }
}
