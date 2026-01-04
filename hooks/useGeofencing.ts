import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

const TARGET_LOCATION = {
    latitude: 6.8667, // Ella, Sri Lanka
    longitude: 81.0467,
    radius: 5000, // 5km radius
    name: 'Ella'
};

export function useGeofencing() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            // Watch position
            await Location.watchPositionAsync({
                accuracy: Location.Accuracy.High,
                distanceInterval: 100, // Update every 100 meters
            }, (newLocation) => {
                setLocation(newLocation);
                checkGeofence(newLocation.coords);
            });
        })();
    }, []);

    const checkGeofence = (coords: { latitude: number; longitude: number }) => {
        const distance = getDistanceFromLatLonInKm(
            coords.latitude,
            coords.longitude,
            TARGET_LOCATION.latitude,
            TARGET_LOCATION.longitude
        );

        if (distance < (TARGET_LOCATION.radius / 1000)) {
            // Debounce alert in real app to avoid spam
            // For demo, we'll just log or show once if we implemented state for "already alerted"
            console.log(`Welcome to ${TARGET_LOCATION.name}!`);
        }
    };
}

// Haversine formula
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}
