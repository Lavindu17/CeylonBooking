import { Button } from '@/components/ui/Button';
import { Body, LargeTitle } from '@/components/ui/Typography';
import { BorderRadius, SemanticColors, Spacing } from '@/constants/Design';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1586616091465-b74659b0f49f?q=80&w=2070'; // Sri Lanka Landscape

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    async function handleSignIn() {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }
        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);

        if (error) {
            Alert.alert('Login Failed', error.message);
        } else {
            setShowEmailModal(false);
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Hero Image */}
            <Image
                source={{ uri: HERO_IMAGE }}
                style={styles.heroImage}
                resizeMode="cover"
            />

            {/* Content Sheet */}
            <View style={[styles.content, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <LargeTitle align="center">Welcome to CeylonStay</LargeTitle>
                    <Body align="center" style={{ color: colors.textSecondary, marginTop: Spacing.s }}>
                        Find your perfect stay across Sri Lanka
                    </Body>
                </View>

                {/* Continue with Email Button */}
                <Button
                    title="Continue with Email"
                    variant="primary"
                    style={{ marginTop: Spacing.xl }}
                    onPress={() => setShowEmailModal(true)}
                />

                <TouchableOpacity
                    onPress={() => router.push('/signup')}
                    style={styles.linkButton}
                >
                    <Body style={{ color: colors.tint }}>Create new account</Body>
                </TouchableOpacity>
            </View>

            {/* Email Login Modal */}
            <Modal
                visible={showEmailModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEmailModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowEmailModal(false)}
                >
                    <TouchableOpacity
                        style={[styles.modalContent, { backgroundColor: colors.background }]}
                        activeOpacity={1}
                        onPress={() => { }}
                    >
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <LargeTitle>Sign In with Email</LargeTitle>
                            <TouchableOpacity
                                onPress={() => setShowEmailModal(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={28} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {/* Email Form in Modal */}
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: colors.backgroundSecondary,
                                    color: colors.textPrimary,
                                    borderColor: colors.border
                                }]}
                                placeholder="Email"
                                placeholderTextColor={colors.textTertiary}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: colors.backgroundSecondary,
                                    color: colors.textPrimary,
                                    borderColor: colors.border
                                }]}
                                placeholder="Password"
                                placeholderTextColor={colors.textTertiary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            <Button
                                title="Sign In"
                                variant="primary"
                                loading={loading}
                                onPress={handleSignIn}
                                style={{ marginTop: Spacing.s }}
                            />
                        </KeyboardAvoidingView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    heroImage: {
        width: '100%',
        height: '45%',
    },
    content: {
        flex: 1,
        marginTop: -24,
        borderTopLeftRadius: BorderRadius.bottomSheet,
        borderTopRightRadius: BorderRadius.bottomSheet,
        paddingHorizontal: Spacing.l,
        paddingTop: Spacing.xl,
    },
    header: {
        alignItems: 'center',
    },
    input: {
        height: 50,
        borderRadius: BorderRadius.button,
        paddingHorizontal: Spacing.m,
        marginBottom: Spacing.m,
        borderWidth: 1,
    },
    linkButton: {
        marginTop: Spacing.l,
        alignItems: 'center',
        paddingVertical: Spacing.s,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: BorderRadius.bottomSheet,
        borderTopRightRadius: BorderRadius.bottomSheet,
        paddingHorizontal: Spacing.l,
        paddingTop: Spacing.l,
        paddingBottom: Spacing.xl,
        minHeight: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    closeButton: {
        padding: Spacing.xs,
    },
});
