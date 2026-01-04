import { Button } from '@/components/ui/Button';
import { Body, LargeTitle } from '@/components/ui/Typography';
import { BorderRadius, SemanticColors, Spacing } from '@/constants/Design';
import { useAuth } from '@/contexts/AuthContext';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';

export default function SignupScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    async function handleSignUp() {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }
        setLoading(true);
        const { error } = await signUp(email, password);
        setLoading(false);

        if (error) {
            Alert.alert('Signup Failed', error.message);
        } else {
            Alert.alert('Success', 'Please check your inbox for email verification!');
            router.back();
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ title: 'Sign Up', headerBackTitle: 'Login' }} />

            <View style={styles.header}>
                <LargeTitle align="center">Create Account</LargeTitle>
                <Body align="center" style={{ color: colors.textSecondary, marginTop: Spacing.s }}>
                    Join us to explore the best of Sri Lanka
                </Body>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.form}
            >
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
                    title="Sign Up"
                    variant="primary"
                    loading={loading}
                    onPress={handleSignUp}
                    style={{ marginTop: Spacing.s }}
                />
            </KeyboardAvoidingView>

            <TouchableOpacity onPress={() => router.back()} style={styles.linkButton}>
                <Body style={{ color: colors.tint }}>Already have an account? Login</Body>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.l,
        justifyContent: 'center',
    },
    header: {
        marginBottom: Spacing.xl,
        alignItems: 'center',
    },
    form: {
        width: '100%',
    },
    input: {
        height: 50,
        borderRadius: BorderRadius.button,
        paddingHorizontal: Spacing.m,
        marginBottom: Spacing.m,
        borderWidth: 1,
    },
    linkButton: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
});
