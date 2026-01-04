import { WizardLayout } from '@/components/host/WizardLayout';
import { Stepper } from '@/components/ui/Stepper';
import { Body } from '@/components/ui/Typography';
import { SemanticColors, Spacing } from '@/constants/Design';
import { useListingCreation } from '@/contexts/ListingCreationContext';
import { useRouter } from 'expo-router';
import { StyleSheet, View, useColorScheme } from 'react-native';

export default function DetailsStep() {
    const { listing, updateListing } = useListingCreation();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    const handleNext = () => {
        router.push('/host/create-listing/amenities');
    };

    return (
        <WizardLayout
            title="Share some basics about your place"
            subtitle="You'll add more details later, like bed types."
            currentStep={3}
            totalSteps={7}
            isNextDisabled={false}
            onNext={handleNext}
        >
            <View style={[styles.row, { borderBottomColor: colors.border }]}>
                <Body>Guests</Body>
                <Stepper
                    value={listing.guests}
                    onIncrement={() => updateListing({ guests: listing.guests + 1 })}
                    onDecrement={() => updateListing({ guests: listing.guests - 1 })}
                    min={1}
                />
            </View>

            <View style={[styles.row, { borderBottomColor: colors.border }]}>
                <Body>Beds</Body>
                <Stepper
                    value={listing.beds}
                    onIncrement={() => updateListing({ beds: listing.beds + 1 })}
                    onDecrement={() => updateListing({ beds: listing.beds - 1 })}
                    min={1}
                />
            </View>

            <View style={[styles.row, { borderBottomColor: 'transparent' }]}>
                <Body>Bathrooms</Body>
                <Stepper
                    value={listing.baths}
                    onIncrement={() => updateListing({ baths: listing.baths + 1 })}
                    onDecrement={() => updateListing({ baths: listing.baths - 1 })}
                    min={0.5}
                />
            </View>
        </WizardLayout>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.l,
        borderBottomWidth: 1,
    }
});
