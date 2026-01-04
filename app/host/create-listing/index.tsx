import { WizardLayout } from '@/components/host/WizardLayout';
import { Body, Caption1 } from '@/components/ui/Typography';
import { BorderRadius, SemanticColors, Spacing } from '@/constants/Design';
import { useListingCreation } from '@/contexts/ListingCreationContext';
import { useRouter } from 'expo-router';
import { StyleSheet, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

const PROPERTY_TYPES = ['Entire place', 'Private room', 'Shared room'];

export default function BasicInfoStep() {
    const { listing, updateListing } = useListingCreation();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    const isValid = listing.title.length > 5 && listing.description.length > 10;

    const handleNext = () => {
        router.push('/host/create-listing/location');
    };

    return (
        <WizardLayout
            title="Tell us about your place"
            subtitle="Share some basic details about your property."
            currentStep={1}
            totalSteps={7}
            isNextDisabled={!isValid}
            onNext={handleNext}
            showBack={false}
        >
            <View style={styles.formGroup}>
                <Body style={styles.label}>Listing Title</Body>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="e.g. Cozy Villa in Ella"
                    placeholderTextColor={colors.textTertiary}
                    value={listing.title}
                    onChangeText={(text) => updateListing({ title: text })}
                    maxLength={50}
                />
                <Caption1 style={{ color: colors.textSecondary, alignSelf: 'flex-end' }}>
                    {listing.title.length}/50
                </Caption1>
            </View>

            <View style={styles.formGroup}>
                <Body style={styles.label}>Property Type</Body>
                <View style={styles.typeContainer}>
                    {PROPERTY_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.typeOption,
                                { borderColor: listing.propertyType === type ? 'transparent' : colors.border, backgroundColor: listing.propertyType === type ? colors.backgroundSecondary : 'transparent' },
                                listing.propertyType === type && styles.selectedType
                            ]}
                            onPress={() => updateListing({ propertyType: type })}
                        >
                            <Body style={{ color: listing.propertyType === type ? colors.tint : colors.textPrimary }}>
                                {type}
                            </Body>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.formGroup}>
                <Body style={styles.label}>Description</Body>
                <TextInput
                    style={[styles.textArea, { backgroundColor: colors.backgroundSecondary, color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="Tell guests what makes your place special..."
                    placeholderTextColor={colors.textTertiary}
                    value={listing.description}
                    onChangeText={(text) => updateListing({ description: text })}
                    multiline
                    numberOfLines={5}
                    maxLength={500}
                    textAlignVertical="top"
                />
                <Caption1 style={{ color: colors.textSecondary, alignSelf: 'flex-end' }}>
                    {listing.description.length}/500
                </Caption1>
            </View>
        </WizardLayout>
    );
}

const styles = StyleSheet.create({
    formGroup: {
        marginBottom: Spacing.l,
    },
    label: {
        marginBottom: Spacing.s,
        fontWeight: '600',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: BorderRadius.button,
        paddingHorizontal: Spacing.m,
        marginBottom: 4,
    },
    textArea: {
        height: 120,
        borderWidth: 1,
        borderRadius: BorderRadius.card,
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.m,
        marginBottom: 4,
    },
    typeContainer: {
        gap: Spacing.s,
    },
    typeOption: {
        padding: Spacing.m,
        borderWidth: 1,
        borderRadius: BorderRadius.button,
        alignItems: 'center',
    },
    selectedType: {
        borderWidth: 2,
        borderColor: '#1F7A5C', // Hardcoded as tint isn't available in styles directly easily without logic, or used style prop above
    }
});
