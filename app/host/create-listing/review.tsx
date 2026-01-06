import { WizardLayout } from '@/components/host/WizardLayout';
import { Body, Caption1, Headline, Title2 } from '@/components/ui/Typography';
import { BorderRadius, formatCurrency, SemanticColors, Spacing } from '@/constants/Design';
import { useListingCreation } from '@/contexts/ListingCreationContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, useColorScheme, View } from 'react-native';

export default function ReviewStep() {
    const { listing, resetListing } = useListingCreation();
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    const handlePublish = async () => {
        setUploading(true);

        try {
            // 1. First insert the listing to get the ID
            const { data: newListing, error: listingError } = await supabase
                .from('listings')
                .insert({
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
                    // image_url will be set to first uploaded image URL
                })
                .select()
                .single();

            if (listingError) throw listingError;
            if (!newListing) throw new Error('Failed to create listing');

            // 2. Upload images to Supabase Storage
            const { uploadListingImages, saveImageMetadata } = await import('@/lib/imageUpload');

            const uploadedImages = await uploadListingImages(
                listing.images,
                newListing.id,
                (progress) => {
                    console.log(`Uploading image ${progress.imageIndex + 1}/${listing.images.length}`);
                }
            );

            if (uploadedImages.length === 0) {
                throw new Error('Failed to upload images');
            }

            // 3. Save image metadata to database
            await saveImageMetadata(newListing.id, uploadedImages);

            // 4. Update listing with the first image URL as fallback
            const { error: updateError } = await supabase
                .from('listings')
                .update({ image_url: uploadedImages[0].url })
                .eq('id', newListing.id);

            if (updateError) {
                console.warn('Failed to update listing image_url:', updateError);
                // Don't throw - this is just a fallback field
            }

            // 5. Success
            resetListing();
            router.replace('/host/create-listing/success');

        } catch (e: any) {
            console.error('Error publishing listing:', e);
            Alert.alert('Error publishing', e.message || 'An unexpected error occurred');
        } finally {
            setUploading(false);
        }
    };

    return (
        <WizardLayout
            title="Review your listing"
            subtitle="Here's what guests will see. Make sure everything looks good."
            currentStep={7}
            totalSteps={7}
            onNext={handlePublish}
            nextLabel={uploading ? "Publishing..." : "Publish Listing"}
            isNextDisabled={uploading}
        >
            <ScrollView style={[styles.card, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                <Image
                    source={{ uri: listing.images[0] }}
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
