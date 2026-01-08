import { ListingCreationProvider } from '@/contexts/ListingCreationContext';
import { Stack } from 'expo-router';

export default function EditListingLayout() {
    return (
        <ListingCreationProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="[id]/index" />
                <Stack.Screen name="[id]/location" />
                <Stack.Screen name="[id]/details" />
                <Stack.Screen name="[id]/amenities" />
                <Stack.Screen name="[id]/photos" />
                <Stack.Screen name="[id]/pricing" />
                <Stack.Screen name="[id]/review" />
            </Stack>
        </ListingCreationProvider>
    );
}
