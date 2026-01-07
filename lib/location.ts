import Constants from 'expo-constants';
import * as Location from 'expo-location';

const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.GOOGLE_PLACES_WEB_KEY || '';

export interface LocationResult {
    latitude: number;
    longitude: number;
    address: string;
    googleMapsUrl: string;
}

/**
 * Request location permissions and get current device location
 */
export async function getCurrentLocation(): Promise<LocationResult | null> {
    try {
        // Request permission
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            console.log('Location permission denied');
            return null;
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;

        // Reverse geocode to get address
        const address = await reverseGeocode(latitude, longitude);

        return {
            latitude,
            longitude,
            address,
            googleMapsUrl: generateGoogleMapsUrl(latitude, longitude),
        };
    } catch (error) {
        console.error('Error getting current location:', error);
        return null;
    }
}

/**
 * Convert coordinates to a human-readable address using reverse geocoding
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });

        if (results && results.length > 0) {
            const location = results[0];
            const parts: string[] = [];

            // Build address from available components
            if (location.name) parts.push(location.name);
            if (location.street) parts.push(location.street);
            if (location.city) parts.push(location.city);
            if (location.region) parts.push(location.region);
            if (location.country) parts.push(location.country);

            return parts.join(', ') || 'Unknown location';
        }

        return 'Unknown location';
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
}

/**
 * Generate a Google Maps URL for the given coordinates
 */
export function generateGoogleMapsUrl(latitude: number, longitude: number): string {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

/**
 * Get place details from Google Places Autocomplete selection
 */
export interface PlaceDetails {
    latitude: number;
    longitude: number;
    address: string;
    name: string;
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry&key=${GOOGLE_PLACES_API_KEY}`
        );

        const data = await response.json();

        if (data.status === 'OK' && data.result) {
            const { geometry, formatted_address, name } = data.result;

            return {
                latitude: geometry.location.lat,
                longitude: geometry.location.lng,
                address: formatted_address,
                name: name || formatted_address,
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching place details:', error);
        return null;
    }
}

/**
 * Check if location permissions are granted
 */
export async function checkLocationPermission(): Promise<boolean> {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
}
