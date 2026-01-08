import { WizardLayout } from '@/components/host/WizardLayout';
import { Body, Caption1, Headline, Title2 } from '@/components/ui/Typography';
import { BorderRadius, formatCurrency, SemanticColors, Spacing } from '@/constants/Design';
import { useAuth } from '@/contexts/AuthContext';
import { useListingCreation } from '@/contexts/ListingCreationContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, useColorScheme, View } from 'react-native';

export default function ReviewStep() {
    const { listing, resetListing, isEditMode } = useListingCreation();
    const { user } = useAuth();
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    const handlePublish = async () => {
        setUploading(true);

        try {
            // Validate user is authenticated
            if (!user?.id) {
                throw new Error('You must be logged in to publish a listing');
            }

            if (isEditMode && listing.id) {
                // === EDIT MODE ===
                console.log('Updating listing:', listing.id);

                // 1. Update the listing record
                const { error: listingError } = await supabase
                    .from('listings')
                    .update({
                        title: listing.title,
                        description: listing.description,
                        price: listing.price,
                        location: listing.location,
                        beds: listing.beds,
                        baths: listing.baths,
                        facilities: listing.facilities,
                        latitude: listing.latitude,
                        longitude: listing.longitude,
                        google_maps_url: listing.google_maps_url,
                    })
                    .eq('id', listing.id);

                if (listingError) throw listingError;

                // 2. Handle image deletions
                // Find which existing images were removed
                const originalImageIds = new Set((listing.existingImages || []).map(img => img.id));
                const { data: currentImages } = await supabase
                    .from('listing_images')
                    .select('*')
                    .eq('listing_id', listing.id);

                if (currentImages) {
                    const removedImages = currentImages.filter(img => !originalImageIds.has(img.id));
                    const { deleteImageMetadata } = await import('@/lib/imageUpload');

                    for (const img of removedImages) {
                        console.log('Deleting removed image:', img.id);
                        await deleteImageMetadata(img.id, img.storage_path);
                    }
                }

                // 3. Upload new images
                if (listing.images.length > 0) {
                    console.log(`Uploading ${listing.images.length} new images...`);
                    const { uploadListingImages, saveImageMetadata } = await import('@/lib/imageUpload');

                    const startOrder = (listing.existingImages?.length || 0);
                    const uploadedImages = await uploadListingImages(
                        listing.images,
                        listing.id,
                        (progress) => {
                            console.log(`Uploading image ${progress.imageIndex + 1}/${listing.images.length}`, progress.status);
                        }
                    );

                    // Adjust order for new images
                    const newImages = uploadedImages.map((img, idx) => ({
                        ...img,
                        order: startOrder + idx,
                    }));

                    await saveImageMetadata(listing.id, newImages);
                }

                // 4. Update cover image if needed
                const coverImageUrl = listing.existingImages?.[0]?.url || listing.images[0];
                if (coverImageUrl) {
                    await supabase
                        .from('listings')
                        .update({ image_url: coverImageUrl })
                        .eq('id', listing.id);
                }

                resetListing();
                router.replace('/host/create-listing/success?mode=edit');

            } else {
                // === CREATE MODE ===
                console.log('Creating listing for user:', user.id);

                // 1. First insert the listing to get the ID
                const { data: newListing, error: listingError } = await supabase
                    .from('listings')
                    .insert({
                        host_id: user.id,
                        title: listing.title,
                        description: listing.description,
                        price: listing.price,
                        location: listing.location,
                        beds: listing.beds,
                        baths: listing.baths,
                        facilities: listing.facilities,
                        latitude: listing.latitude,
                        longitude: listing.longitude,
                        google_maps_url: listing.google_maps_url,
                    })
                    .select()
                    .single();

                if (listingError) throw listingError;
                if (!newListing) throw new Error('Failed to create listing');

                // 2. Upload images to Supabase Storage
                console.log(`Preparing to upload ${listing.images.length} images...`);
                const { uploadListingImages, saveImageMetadata } = await import('@/lib/imageUpload');

                const uploadedImages = await uploadListingImages(
                    listing.images,
                    newListing.id,
                    (progress) => {
                        console.log(`Uploading image ${progress.imageIndex + 1}/${listing.images.length}`, progress.status);
                    }
                );

                console.log('All images uploaded successfully:', uploadedImages.length);

                // 3. Save image metadata to database
                await saveImageMetadata(newListing.id, uploadedImages);

                // 4. Update listing with the first image URL as fallback
                const { error: updateError } = await supabase
                    .from('listings')
                    .update({ image_url: uploadedImages[0].url })
                    .eq('id', newListing.id);

                if (updateError) {
                    console.warn('Failed to update listing image_url:', updateError);
                }

                // 5. Success
                resetListing();
                router.replace('/host/create-listing/success');
            }

        } catch (e: any) {
            console.error('Error publishing listing:', e);
            Alert.alert('Error publishing', e.message || 'An unexpected error occurred');
        } finally {
            setUploading(false);
        }
    };

    return (
        <WizardLayout
            title={isEditMode ? "Review your changes" : "Review your listing"}
            subtitle={isEditMode ? "Make sure your updates look good." : "Here's what guests will see. Make sure everything looks good."}
            currentStep={7}
            totalSteps={7}
            onNext={handlePublish}
            nextLabel={uploading ? (isEditMode ? "Updating..." : "Publishing...") : (isEditMode ? "Update Listing" : "Publish Listing")}
            isNextDisabled={uploading}
        >
            <ScrollView style={[styles.card, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                <Image
                    source={{ uri: listing.existingImages?.[0]?.url || listing.images[0] }}
                    style={styles.coverImage}
                />
                <View style={styles.content}>
                    <View style={styles.row}>
                        <Title2>{listing.title}</Title2>
                        <View style={styles.priceTag}>
                            <Headline>{formatCurrency(listing.price)}</Headline>
                            <Caption1 style={{ color: colors.textSecondary }}>/ night</Caption1>
                        </View>
                    </View>

                    <Body style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
                        {listing.location} · {listing.propertyType}
                    </Body>

                    <View style={styles.divider} />

                    <Body style={{ color: colors.textSecondary }} numberOfLines={3}>
                        {listing.description}
                    </Body>

                    <View style={styles.stats}>
                        <Caption1 style={{ color: colors.textSecondary }}>{listing.guests} guests · {listing.beds} beds · {listing.baths} baths</Caption1>
                    </View>

                    <View style={styles.divider} />

                    <Headline style={{ fontSize: 16, marginBottom: Spacing.s }}>Amenities</Headline>
                    <View style={styles.amenities}>
                        {listing.facilities.map(f => (
                            <Caption1 key={f} style={{ color: colors.textSecondary }}>• {f}</Caption1>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </WizardLayout>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: BorderRadius.card,
        overflow: 'hidden',
        borderWidth: 1,
    },
    coverImage: {
        width: '100%',
        height: 200,
    },
    content: {
        padding: Spacing.m,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    priceTag: {
        alignItems: 'flex-end',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e5e5', // Hardcoded logical grey
        marginVertical: Spacing.m,
    },
    stats: {
        marginTop: Spacing.s,
    },
    amenities: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.s,
    }
});
