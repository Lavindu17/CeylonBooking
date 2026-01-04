import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FACILITIES = ['Wifi', 'Hot Water', 'AC', 'Pool', 'Parking', 'Kitchen', 'Gym', 'Breakfast'];

export default function CreateListingScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [beds, setBeds] = useState('');
    const [baths, setBaths] = useState('');
    const [facilities, setFacilities] = useState<string[]>([]);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [googleMapsUrl, setGoogleMapsUrl] = useState('');

    const toggleFacility = (facility: string) => {
        if (facilities.includes(facility)) {
            setFacilities(facilities.filter(f => f !== facility));
        } else {
            setFacilities([...facilities, facility]);
        }
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission Required', 'Camera roll permission is required');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const fileExt = uri.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `listings/${user?.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('listing-images')
                .upload(filePath, blob);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('listing-images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const handleSubmit = async () => {
        if (!title || !location || !price || !beds || !baths) {
            Alert.alert('Missing Information', 'Please fill in all required fields');
            return;
        }

        setLoading(true);

        let imageUrl = 'https://via.placeholder.com/400';
        if (imageUri) {
            const uploadedUrl = await uploadImage(imageUri);
            if (uploadedUrl) imageUrl = uploadedUrl;
        }

        const { error } = await supabase.from('listings').insert({
            host_id: user?.id,
            title,
            description,
            location,
            price: parseFloat(price),
            beds: parseInt(beds),
            baths: parseInt(baths),
            facilities,
            image_url: imageUrl,
            google_maps_url: googleMapsUrl || null,
            latitude: null,
            longitude: null,
        });

        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', 'Listing created successfully!');
            router.back();
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <View style={styles.stepContent}>
                        <ThemedText type="subtitle">Basic Information</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Title *"
                            value={title}
                            onChangeText={setTitle}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Location *"
                            value={location}
                            onChangeText={setLocation}
                        />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Description"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                );

            case 2:
                return (
                    <View style={styles.stepContent}>
                        <ThemedText type="subtitle">Property Details</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Number of Beds *"
                            value={beds}
                            onChangeText={setBeds}
                            keyboardType="number-pad"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Number of Baths *"
                            value={baths}
                            onChangeText={setBaths}
                            keyboardType="number-pad"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Price per Night (LKR) *"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="number-pad"
                        />
                    </View>
                );

            case 3:
                return (
                    <View style={styles.stepContent}>
                        <ThemedText type="subtitle">Facilities</ThemedText>
                        <View style={styles.facilitiesGrid}>
                            {FACILITIES.map((facility) => (
                                <TouchableOpacity
                                    key={facility}
                                    style={[
                                        styles.facilityChip,
                                        facilities.includes(facility) && styles.facilityChipActive,
                                    ]}
                                    onPress={() => toggleFacility(facility)}
                                >
                                    <ThemedText
                                        style={[
                                            styles.facilityText,
                                            facilities.includes(facility) && styles.facilityTextActive,
                                        ]}
                                    >
                                        {facility}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 4:
                return (
                    <View style={styles.stepContent}>
                        <ThemedText type="subtitle">Location Link (Optional)</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Google Maps URL"
                            value={googleMapsUrl}
                            onChangeText={setGoogleMapsUrl}
                        />
                    </View>
                );

            case 5:
                return (
                    <View style={styles.stepContent}>
                        <ThemedText type="subtitle">Upload Image</ThemedText>
                        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                            {imageUri ? (
                                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons name="camera-outline" size={48} color="#ccc" />
                                    <ThemedText style={styles.imagePlaceholderText}>Tap to select image</ThemedText>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ title: 'Create Listing', headerBackTitle: 'Cancel' }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.progressBar}>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <View
                            key={s}
                            style={[styles.progressDot, s <= step && styles.progressDotActive]}
                        />
                    ))}
                </View>

                {renderStep()}
            </ScrollView>

            <View style={styles.footer}>
                {step > 1 && (
                    <TouchableOpacity style={styles.backButton} onPress={() => setStep(step - 1)}>
                        <ThemedText style={styles.backButtonText}>Back</ThemedText>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={() => {
                        if (step < 5) {
                            setStep(step + 1);
                        } else {
                            handleSubmit();
                        }
                    }}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <ThemedText style={styles.nextButtonText}>
                            {step === 5 ? 'Create Listing' : 'Next'}
                        </ThemedText>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 24,
    },
    progressBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 32,
    },
    progressDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#ddd',
    },
    progressDotActive: {
        backgroundColor: '#FF385C',
    },
    stepContent: {
        gap: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    facilitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    facilityChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    facilityChipActive: {
        backgroundColor: '#FF385C',
        borderColor: '#FF385C',
    },
    facilityText: {
        color: '#666',
    },
    facilityTextActive: {
        color: '#fff',
    },
    imagePicker: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#ddd',
        borderRadius: 12,
    },
    imagePlaceholderText: {
        marginTop: 12,
        color: '#999',
    },
    footer: {
        flexDirection: 'row',
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        gap: 12,
    },
    backButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    backButtonText: {
        fontWeight: '600',
    },
    nextButton: {
        flex: 2,
        paddingVertical: 16,
        borderRadius: 8,
        backgroundColor: '#FF385C',
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
