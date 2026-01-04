import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { Button, StyleSheet } from 'react-native';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title">Profile</ThemedText>
            <ThemedText style={styles.email}>{user?.email}</ThemedText>
            <Button title="Sign Out" onPress={signOut} color="#FF385C" />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    email: {
        fontSize: 18,
        marginBottom: 20,
    },
});
