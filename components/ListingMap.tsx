import { Listing } from '@/types/listing';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

type Props = {
    listings: Listing[];
};

const INITIAL_REGION = {
    latitude: 7.8731, // Center of Sri Lanka approx
    longitude: 80.7718,
    latitudeDelta: 4.0,
    longitudeDelta: 4.0,
};

export function ListingMap({ listings }: Props) {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <MapView
                style={StyleSheet.absoluteFill}
                provider={PROVIDER_DEFAULT}
                initialRegion={INITIAL_REGION}
                showsUserLocation
                showsMyLocationButton
            >
                {listings.map((listing) => (
                    listing.latitude && listing.longitude ? (
                        <Marker
                            key={listing.id}
                            coordinate={{
                                latitude: listing.latitude,
                                longitude: listing.longitude,
                            }}
                            title={listing.title}
                            description={`LKR ${listing.price}`}
                            onCalloutPress={() => {
                                // router.push(`/listing/${listing.id}`);
                                console.log('Callout pressed:', listing.id);
                            }}
                        />
                    ) : null
                ))}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
