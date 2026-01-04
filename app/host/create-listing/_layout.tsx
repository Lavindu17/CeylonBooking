import { ListingCreationProvider } from '@/contexts/ListingCreationContext';
import { Stack } from 'expo-router';

export default function CreateListingLayout() {
    return (
        <ListingCreationProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="location" />
                <Stack.Screen name="details" />
                <Stack.Screen name="amenities" />
                <Stack.Screen name="photos" />
                <Stack.Screen name="pricing" />
                <Stack.Screen name="review" />
            </Stack>
        </ListingCreationProvider>
    );
}
