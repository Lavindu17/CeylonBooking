import { Button } from '@/components/ui/Button';
import { Body, Title2 } from '@/components/ui/Typography';
import { BrandColors, SemanticColors, Spacing } from '@/constants/Design';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SuccessScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Ionicons name="checkmark" size={64} color="#fff" />
                </View>

                <Title2 style={{ marginTop: Spacing.xl, textAlign: 'center' }}>
                    Congratulations!{'\n'}Your listing is live.
                </Title2>

                <Body style={{
                    marginTop: Spacing.m,
                    textAlign: 'center',
                    color: colors.textSecondary,
                    paddingHorizontal: Spacing.xl
                }}>
                    Your property is now visible to thousands of travelers searching for their next Ceylon stay.
                </Body>
            </View>

            <View style={styles.footer}>
                <Button
                    title="View My Listing"
                    onPress={() => router.replace('/(tabs)/profile')}
                    style={{ marginBottom: Spacing.m }}
                />
                <Button
                    title="Return to Home"
                    variant="outline"
                    onPress={() => router.replace('/(tabs)/')}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.l,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: BrandColors.ceylonGreen,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: BrandColors.ceylonGreen,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    footer: {
        marginBottom: Spacing.xl,
    }
});
