import { WizardLayout } from '@/components/host/WizardLayout';
import { Body, Caption1, Subheadline } from '@/components/ui/Typography';
import { BorderRadius, SemanticColors, Spacing } from '@/constants/Design';
import { useListingCreation } from '@/contexts/ListingCreationContext';
import { generateGoogleMapsUrl, getCurrentLocation, reverseGeocode } from '@/lib/location';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import MapView, { Marker, Region } from 'react-native-maps';

const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.GOOGLE_PLACES_WEB_KEY || '';

// Sri Lanka default location (Colombo)
const DEFAULT_REGION: Region = {
    latitude: 6.9271,
    longitude: 79.8612,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
};

export default function LocationStep() {
    const { listing, updateListing } = useListingCreation();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    const mapRef = useRef<MapView>(null);
    const autocompleteRef = useRef<GooglePlacesAutocompleteRef>(null);

    const [region, setRegion] = useState<Region>(() => {
        if (listing.latitude && listing.longitude) {
            return {
                latitude: listing.latitude,
                longitude: listing.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
        }
        return DEFAULT_REGION;
    });

    const [markerPosition, setMarkerPosition] = useState<{ latitude: number; longitude: number } | null>(() => {
        if (listing.latitude && listing.longitude) {
            return { latitude: listing.latitude, longitude: listing.longitude };
        }
        return null;
    });

    const [loadingLocation, setLoadingLocation] = useState(false);
    const [isManualSelection, setIsManualSelection] = useState(false);

    const isValid = listing.location.length > 3 && listing.latitude !== null && listing.longitude !== null;

    // Update location in context
    const updateLocationData = async (lat: number, lng: number, address?: string) => {
        const locationAddress = address || await reverseGeocode(lat, lng);
        const googleMapsUrl = generateGoogleMapsUrl(lat, lng);

        updateListing({
            latitude: lat,
            longitude: lng,
            location: locationAddress,
            google_maps_url: googleMapsUrl,
        });

        setMarkerPosition({ latitude: lat, longitude: lng });
    };

    // Handle "Use Current Location" button
    const handleUseCurrentLocation = async () => {
        setLoadingLocation(true);
        try {
            const locationResult = await getCurrentLocation();

            if (locationResult) {
                const newRegion = {
                    latitude: locationResult.latitude,
                    longitude: locationResult.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };

                setRegion(newRegion);
                mapRef.current?.animateToRegion(newRegion, 1000);

                await updateLocationData(
                    locationResult.latitude,
                    locationResult.longitude,
                    locationResult.address
                );

                // Clear autocomplete
                autocompleteRef.current?.setAddressText(locationResult.address);
            } else {
                Alert.alert(
                    'Location Permission Required',
                    'Please enable location services to use this feature.',
                    [
                        { text: 'OK' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() }
                    ]
                );
            }
        } catch (error) {
            console.error('Error getting current location:', error);
            Alert.alert('Error', 'Failed to get your current location. Please try again.');
        } finally {
            setLoadingLocation(false);
        }
    };

    // Handle map tap for manual selection
    const handleMapPress = async (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setIsManualSelection(true);
        await updateLocationData(latitude, longitude);
    };

    // Handle marker drag
    const handleMarkerDragEnd = async (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        await updateLocationData(latitude, longitude);
    };

    const handleNext = () => {
        router.push('/host/create-listing/details');
    };

    return (
        <WizardLayout
            title="Where is your place located?"
            subtitle="Your address is only shared with guests after they make a reservation."
            currentStep={2}
            totalSteps={7}
            isNextDisabled={!isValid}
            onNext={handleNext}
        >
            {/* Google Places Autocomplete Search */}
            <View style={[styles.autocompleteContainer, { zIndex: 10 }]}>
                <GooglePlacesAutocomplete
                    ref={autocompleteRef}
                    placeholder="Search for town or area..."
                    onPress={(data, details = null) => {
                        if (details) {
                            const lat = details.geometry.location.lat;
                            const lng = details.geometry.location.lng;
                            const address = details.formatted_address || data.description;

                            const newRegion = {
                                latitude: lat,
                                longitude: lng,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            };

                            setRegion(newRegion);
                            mapRef.current?.animateToRegion(newRegion, 1000);
                            updateLocationData(lat, lng, address);
                            setIsManualSelection(false);
                        }
                    }}
                    query={{
                        key: GOOGLE_PLACES_API_KEY,
                        language: 'en',
                        components: 'country:lk', // Restrict to Sri Lanka
                    }}
                    fetchDetails={true}
                    enablePoweredByContainer={false}
                    styles={{
                        container: {
                            flex: 0,
                        },
                        textInputContainer: {
                            backgroundColor: colors.backgroundSecondary,
                            borderRadius: BorderRadius.button,
                            borderWidth: 1,
                            borderColor: colors.border,
                            paddingHorizontal: Spacing.s,
                        },
                        textInput: {
                            height: 50,
                            color: colors.textPrimary,
                            fontSize: 16,
                            backgroundColor: 'transparent',
                        },
                        predefinedPlacesDescription: {
                            color: colors.textPrimary,
                        },
                        listView: {
                            backgroundColor: colors.backgroundSecondary,
                            borderRadius: BorderRadius.card,
                            marginTop: Spacing.s,
                        },
                        row: {
                            backgroundColor: colors.backgroundSecondary,
                            paddingVertical: Spacing.m,
                        },
                        separator: {
                            backgroundColor: colors.border,
                            height: 1,
                        },
                        description: {
                            color: colors.textPrimary,
                        },
                        loader: {
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            height: 20,
                        },
                    }}
                    textInputProps={{
                        placeholderTextColor: colors.textTertiary,
                        leftIcon: <Ionicons name="search" size={20} color={colors.textSecondary} />,
                    }}
                />
            </View>

            {/* Map View */}
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    region={region}
                    onPress={handleMapPress}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                >
                    {markerPosition && (
                        <Marker
                            coordinate={markerPosition}
                            draggable
                            onDragEnd={handleMarkerDragEnd}
                        />
                    )}
                </MapView>

                {/* Use Current Location Button */}
                <Pressable
                    style={[styles.currentLocationButton, { backgroundColor: colors.tint }]}
                    onPress={handleUseCurrentLocation}
                    disabled={loadingLocation}
                >
                    {loadingLocation ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="locate" size={20} color="#fff" />
                            <Body style={{ color: '#fff', marginLeft: Spacing.s }}>Use Current Location</Body>
                        </>
                    )}
                </Pressable>
            </View>

            {/* Location Preview Card */}
            {listing.location && markerPosition && (
                <View style={[styles.previewCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                    <View style={styles.previewHeader}>
                        <Ionicons name="location" size={24} color={colors.tint} />
                        <View style={{ flex: 1, marginLeft: Spacing.m }}>
                            <Subheadline style={{ color: colors.textPrimary }}>Selected Location</Subheadline>
                            <Body style={{ color: colors.textSecondary, marginTop: 4 }}>{listing.location}</Body>
                            <Caption1 style={{ color: colors.textTertiary, marginTop: 4 }}>
                                {listing.latitude?.toFixed(4)}° N, {listing.longitude?.toFixed(4)}° E
                            </Caption1>
                        </View>
                    </View>

                    {listing.google_maps_url && (
                        <Pressable
                            style={styles.openMapsButton}
                            onPress={() => Linking.openURL(listing.google_maps_url!)}
                        >
                            <Caption1 style={{ color: colors.tint }}>Open in Google Maps</Caption1>
                            <Ionicons name="arrow-forward" size={16} color={colors.tint} />
                        </Pressable>
                    )}
                </View>
            )}

            {/* Helper Text */}
            <View style={{ marginTop: Spacing.m }}>
                <Caption1 style={{ color: colors.textTertiary, textAlign: 'center' }}>
                    Search for a location, use your current location, or tap on the map to select manually
                </Caption1>
            </View>
        </WizardLayout>
    );
}

const styles = StyleSheet.create({
    autocompleteContainer: {
        marginBottom: Spacing.m,
    },
    mapContainer: {
        height: 350,
        borderRadius: BorderRadius.card,
        overflow: 'hidden',
        marginBottom: Spacing.l,
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    currentLocationButton: {
        position: 'absolute',
        bottom: Spacing.m,
        right: Spacing.m,
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        borderRadius: BorderRadius.button,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    previewCard: {
        borderRadius: BorderRadius.card,
        borderWidth: 1,
        padding: Spacing.m,
        marginBottom: Spacing.m,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    openMapsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.m,
        paddingTop: Spacing.m,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
        gap: Spacing.xs,
    },
});
