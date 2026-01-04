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
            // 1. Upload Images (Optimistic: just using the first one locally for now if not uploading to storage)
            // Real implementation would upload to Supabase Storage here.
            // For MVP/Demo, we assume the URI is local. 
            // Since we can't upload to a bucket without one set up, we might just store the local URI or a placeholder.
            // But 'listing.image_url' is expected to be a string.

            // TODO: Implement actual image upload to Supabase Storage "listings" bucket.
            // For now, we'll assume the image_url is just the first image path (which won't work across devices but fine for demo).
            const mainImage = listing.images.length > 0 ? listing.images[0] : null;

            // 2. Insert into Database
            const { error } = await supabase.from('listings').insert({
                title: listing.title,
                description: listing.description,
                price: listing.price,
                location: listing.location,
                beds: listing.beds,
                baths: listing.baths,
                image_url: mainImage, // Mapping first image
                facilities: listing.facilities,
                // created_at is default
            });

            if (error) throw error;

            // 3. Success
            resetListing();
            router.replace('/host/create-listing/success');

        } catch (e: any) {
            Alert.alert('Error publishing', e.message);
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
