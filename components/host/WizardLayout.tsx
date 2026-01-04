import { Button } from '@/components/ui/Button';
import { Body, Headline } from '@/components/ui/Typography';
import { BrandColors, SemanticColors, Spacing } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    currentStep: number;
    totalSteps: number;
    isNextDisabled?: boolean;
    onNext: () => void;
    nextLabel?: string;
    showBack?: boolean;
    onBack?: () => void; // Optional custom back handler
};

export function WizardLayout({
    children,
    title,
    subtitle,
    currentStep,
    totalSteps,
    isNextDisabled = false,
    onNext,
    nextLabel = 'Next',
    showBack = true,
    onBack,
}: Props) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    const progress = (currentStep / totalSteps) * 100;

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
                <View style={styles.navRow}>
                    {showBack ? (
                        <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
                            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.iconBtn} /> // Spacer
                    )}

                    <TouchableOpacity onPress={() => router.dismiss()} style={styles.iconBtn}>
                        <Body style={{ color: colors.textSecondary }}>Cancel</Body>
                    </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View style={[styles.progressTrack, { backgroundColor: colors.backgroundSecondary }]}>
                    <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: BrandColors.ceylonGreen }]} />
                </View>
            </View>

            {/* Content */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <Headline style={{ marginBottom: Spacing.xs }}>{title}</Headline>
                    {subtitle && <Body style={{ color: colors.textSecondary, marginBottom: Spacing.l }}>{subtitle}</Body>}

                    {children}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.m), borderTopColor: colors.border, backgroundColor: colors.background }]}>
                <Button
                    title={nextLabel}
                    onPress={onNext}
                    disabled={isNextDisabled}
                    fullWidth
                    size="large"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        backgroundColor: 'transparent',
    },
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
        height: 44,
    },
    iconBtn: {
        padding: Spacing.s,
    },
    progressTrack: {
        height: 4,
        width: '100%',
    },
    progressBar: {
        height: '100%',
    },
    content: {
        padding: Spacing.l,
    },
    footer: {
        paddingHorizontal: Spacing.l,
        paddingTop: Spacing.m,
        borderTopWidth: 1,
    },
});
