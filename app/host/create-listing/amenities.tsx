import { WizardLayout } from '@/components/host/WizardLayout';
import { Body } from '@/components/ui/Typography';
import { BorderRadius, BrandColors, SemanticColors, Spacing } from '@/constants/Design';
import { useListingCreation } from '@/contexts/ListingCreationContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';

const AMENITIES = [
    { id: 'wifi', label: 'Wi-Fi', icon: 'wifi' },
    { id: 'ac', label: 'Air Conditioning', icon: 'snow' },
    { id: 'parking', label: 'Free Parking', icon: 'car' },
    { id: 'kitchen', label: 'Kitchen', icon: 'restaurant' },
    { id: 'tv', label: 'TV', icon: 'tv' },
    { id: 'washer', label: 'Washing Machine', icon: 'water' },
];

export default function AmenitiesStep() {
    const { listing, updateListing } = useListingCreation();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    const toggleAmenity = (label: string) => {
        const current = listing.facilities;
        if (current.includes(label)) {
            updateListing({ facilities: current.filter(f => f !== label) });
        } else {
            updateListing({ facilities: [...current, label] });
        }
    };

    const handleNext = () => {
        router.push('/host/create-listing/photos');
    };

    return (
        <WizardLayout
            title="Tell guests what your place has to offer"
            subtitle="You can add more amenities after you publish."
            currentStep={4}
            totalSteps={7}
            onNext={handleNext}
        >
            <View style={styles.grid}>
                {AMENITIES.map((item) => {
                    const isSelected = listing.facilities.includes(item.label);
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.card,
                                {
                                    backgroundColor: isSelected ? BrandColors.ceylonGreenLight + '20' : colors.backgroundSecondary,
                                    borderColor: isSelected ? BrandColors.ceylonGreen : colors.border,
                                    borderWidth: 2,
                                }
                            ]}
                            onPress={() => toggleAmenity(item.label)}
                        >
                            <Ionicons
                                name={item.icon as any}
                                size={28}
                                color={isSelected ? BrandColors.ceylonGreen : colors.textPrimary}
                            />
                            <Body style={{
                                marginTop: Spacing.s,
                                fontWeight: isSelected ? '600' : '400',
                                color: isSelected ? BrandColors.ceylonGreen : colors.textPrimary
                            }}>
                                {item.label}
                            </Body>
                        </TouchableOpacity>
                    );
                })}
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
    card: {
        width: '47%', // approx half minus gap
        aspectRatio: 1, // square
        borderRadius: BorderRadius.card,
        padding: Spacing.m,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
