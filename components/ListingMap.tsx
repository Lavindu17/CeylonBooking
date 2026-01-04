import { Listing } from '@/types/listing';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

type Props = {
    listings: Listing[];
};

export function ListingMap({ listings }: Props) {
    // Note: react-native-maps requires a development build
    // For Expo Go, we'll show a message instead
    return (
        <View style={styles.container}>
            <View style={styles.messageContainer}>
                <ThemedText style={styles.message}>
                    📍 Map view requires a development build
                </ThemedText>
                <ThemedText style={styles.subMessage}>
                    Install the correct version of react-native-maps{'\n'}
                    or use a custom development build to enable maps
                </ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f7f7f7',
    },
    message: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 12,
    },
    subMessage: {
        fontSize: 14,
        textAlign: 'center',
        color: '#666',
        lineHeight: 20,
    },
});
