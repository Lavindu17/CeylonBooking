import { WizardLayout } from '@/components/host/WizardLayout';
import { Body } from '@/components/ui/Typography';
import { BorderRadius, SemanticColors, Spacing } from '@/constants/Design';
import { useListingCreation } from '@/contexts/ListingCreationContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Alert, Image, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function PhotosStep() {
    const { listing, updateListing, isEditMode } = useListingCreation();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    const pickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const totalImages = (listing.existingImages?.length || 0) + listing.images.length;
        const remainingSlots = 10 - totalImages;

        if (remainingSlots <= 0) {
            Alert.alert('Limit reached', 'You can only have up to 10 photos.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
            selectionLimit: remainingSlots,
            allowsMultipleSelection: true,
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            updateListing({ images: [...listing.images, ...newImages] });
        }
    };

    const removeNewImage = (index: number) => {
        const newImages = [...listing.images];
        newImages.splice(index, 1);
        updateListing({ images: newImages });
    };

    const removeExistingImage = (index: number) => {
        const existingImages = [...(listing.existingImages || [])];
        existingImages.splice(index, 1);
        updateListing({ existingImages });
    };

    const handleNext = () => {
        router.push(isEditMode ? `/host/edit-listing/${listing.id}/pricing` : '/host/create-listing/pricing');
    };

    const totalImages = (listing.existingImages?.length || 0) + listing.images.length;
    const hasImages = totalImages > 0;

    return (
        <WizardLayout
            title="Add some photos of your house"
            subtitle={isEditMode ? "Update your listing photos. You'll need at least 1 photo." : "You'll need at least 1 photo to get started."}
            currentStep={5}
            totalSteps={7}
            isNextDisabled={!hasImages}
            onNext={handleNext}
        >
            <View style={styles.grid}>
                {/* Existing Photos (Edit Mode) */}
                {isEditMode && listing.existingImages?.map((image, index) => (
                    <View key={`existing-${image.id}`} style={styles.photoContainer}>
                        <Image source={{ uri: image.url }} style={styles.photo} />
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => removeExistingImage(index)}
                        >
                            <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                        {index === 0 && listing.images.length === 0 && (
                            <View style={styles.coverBadge}>
                                <Body style={{ fontSize: 10, color: '#fff', fontWeight: 'bold' }}>Cover</Body>
                            </View>
                        )}
                    </View>
                ))}

                {/* New Photos */}
                {listing.images.map((uri, index) => (
                    <View key={`new-${index}`} style={styles.photoContainer}>
                        <Image source={{ uri }} style={styles.photo} />
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => removeNewImage(index)}
                        >
                            <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                        {index === 0 && (!isEditMode || listing.existingImages?.length === 0) && (
                            <View style={styles.coverBadge}>
                                <Body style={{ fontSize: 10, color: '#fff', fontWeight: 'bold' }}>Cover</Body>
                            </View>
                        )}
                        <View style={styles.newBadge}>
                            <Body style={{ fontSize: 10, color: '#fff', fontWeight: 'bold' }}>New</Body>
                        </View>
                    </View>
                ))}

                {/* Add Button */}
                {totalImages < 10 && (
                    <TouchableOpacity
                        style={[styles.addButton, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                        onPress={pickImage}
                    >
                        <Ionicons name="camera-outline" size={32} color={colors.textSecondary} />
                        <Body style={{ color: colors.textSecondary, marginTop: Spacing.s }}>Add Photos</Body>
                    </TouchableOpacity>
                )}
            </View>
        </WizardLayout>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.m,
    },
    photoContainer: {
        width: '47%',
        aspectRatio: 1,
        borderRadius: BorderRadius.image,
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    addButton: {
        width: '47%',
        aspectRatio: 1,
        borderRadius: BorderRadius.image,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coverBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    newBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(31,122,92,0.9)', // Ceylon green
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    }
});
