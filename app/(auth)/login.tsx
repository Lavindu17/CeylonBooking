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

                {/* Google Button */}
                <Button
                    title="Continue with Google"
                    variant="primary"
                    style={{ backgroundColor: '#000000', marginTop: Spacing.xl }}
                    icon={<Ionicons name="logo-google" size={20} color="#FFF" />}
                // onPress={promptAsync} // Implement Google Auth
                />

                <View style={styles.divider}>
                    <View style={[styles.line, { backgroundColor: colors.border }]} />
                    <Body style={{ color: colors.textSecondary, marginHorizontal: Spacing.m }}>or</Body>
                    <View style={[styles.line, { backgroundColor: colors.border }]} />
                </View>

                {/* Email Form */}
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
                        title="Sign In with Email"
                        variant="primary"
                        loading={loading}
                        onPress={handleSignIn}
                        style={{ marginTop: Spacing.s }}
                    />
                </KeyboardAvoidingView>

                <TouchableOpacity
                    onPress={() => router.push('/signup')}
                    style={styles.linkButton}
                >
                    <Body style={{ color: colors.tint }}>Don't have an account? Sign Up</Body>
                </TouchableOpacity>
            </View>
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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.l,
    },
    line: {
        flex: 1,
        height: 1,
    },
    input: {
        height: 50,
        borderRadius: BorderRadius.button,
        paddingHorizontal: Spacing.m,
        marginBottom: Spacing.m,
        borderWidth: 1, // Subtle border
    },
    linkButton: {
        marginTop: Spacing.l,
        alignItems: 'center',
        paddingVertical: Spacing.s,
    },
});
