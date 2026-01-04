import { WizardLayout } from '@/components/host/WizardLayout';
import { Body, Caption1 } from '@/components/ui/Typography';
import { BorderRadius, SemanticColors, Spacing } from '@/constants/Design';
import { useListingCreation } from '@/contexts/ListingCreationContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TextInput, View, useColorScheme } from 'react-native';

export default function LocationStep() {
    const { listing, updateListing } = useListingCreation();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    const isValid = listing.location.length > 3;

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
            <View style={styles.formGroup}>
                <View style={[styles.inputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                    <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.input, { color: colors.textPrimary }]}
                        placeholder="Search for town or area..."
                        placeholderTextColor={colors.textTertiary}
                        value={listing.location}
                        onChangeText={(text) => updateListing({ location: text })}
                    />
                </View>
            </View>

            {/* Map Preview Placeholder */}
            <View style={[styles.mapPlaceholder, { backgroundColor: colors.backgroundSecondary }]}>
                <Ionicons name="map" size={48} color={colors.textDisabled} />
                <Body style={{ color: colors.textSecondary, marginTop: Spacing.m }}>Map Preview (Coming Soon)</Body>
                <Caption1 style={{ color: colors.textTertiary, textAlign: 'center', marginTop: Spacing.s }}>
                    {listing.location || 'Enter a location to see map'}
                </Caption1>
            </View>
        </WizardLayout>
    );
}

const styles = StyleSheet.create({
    formGroup: {
        marginBottom: Spacing.l,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
        height: 50,
        borderWidth: 1,
        borderRadius: BorderRadius.button,
        gap: Spacing.s,
    },
    input: {
        flex: 1,
        height: '100%',
    },
    mapPlaceholder: {
        height: 300,
        borderRadius: BorderRadius.card,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.l,
    }
});
