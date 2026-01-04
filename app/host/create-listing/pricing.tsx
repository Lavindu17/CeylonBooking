import { WizardLayout } from '@/components/host/WizardLayout';
import { Body, Title2 } from '@/components/ui/Typography';
import { BorderRadius, SemanticColors, Spacing } from '@/constants/Design';
import { useListingCreation } from '@/contexts/ListingCreationContext';
import { useRouter } from 'expo-router';
import { StyleSheet, TextInput, View, useColorScheme } from 'react-native';

export default function PricingStep() {
    const { listing, updateListing } = useListingCreation();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    const isValid = listing.price > 0;

    const handleNext = () => {
        router.push('/host/create-listing/review');
    };

    return (
        <WizardLayout
            title="Now, set your price"
            subtitle="You can change it anytime."
            currentStep={6}
            totalSteps={7}
            isNextDisabled={!isValid}
            onNext={handleNext}
        >
            <View style={styles.container}>
                <View style={[styles.inputContainer, { backgroundColor: colors.backgroundSecondary }]}>
                    <Title2 style={{ color: colors.textSecondary }}>LKR</Title2>
                    <TextInput
                        style={[styles.input, { color: colors.textPrimary }]}
                        placeholder="0"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="number-pad"
                        value={listing.price.toString()}
                        onChangeText={(text) => {
                            const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
                            updateListing({ price: isNaN(num) ? 0 : num });
                        }}
                    />
                </View>
                <Body style={{ textAlign: 'center', marginTop: Spacing.m, color: colors.textSecondary }}>
                    / night
                </Body>
            </View>
        </WizardLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.l,
        borderRadius: BorderRadius.card,
        gap: Spacing.s,
    },
    input: {
        fontSize: 32,
        fontWeight: 'bold',
        minWidth: 100,
        textAlign: 'center',
    }
});
