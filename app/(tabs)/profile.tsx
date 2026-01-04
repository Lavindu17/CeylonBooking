import { BookingCard } from '@/components/BookingCard';
import { HostBookingCard } from '@/components/HostBookingCard';
import { Button } from '@/components/ui/Button';
import { Body, Headline, Title2 } from '@/components/ui/Typography';
import { BorderRadius, SemanticColors, Spacing } from '@/constants/Design';
import { useAuth } from '@/contexts/AuthContext';
import { useHostBookings } from '@/hooks/useHostBookings';
import { useUserBookings } from '@/hooks/useUserBookings';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    // Fetch user bookings
    const { bookings: userBookings, loading: userBookingsLoading } = useUserBookings();

    // Fetch host bookings (bookings for listings owned by this user)
    const { bookings: hostBookings, loading: hostBookingsLoading, updateBookingStatus } = useHostBookings();

    const pendingHostBookingsCount = hostBookings.filter(b => b.status === 'pending').length;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Image
                    source={{ uri: 'https://i.pravatar.cc/150?u=' + user?.email }}
                    style={styles.avatar}
                />
                <Title2 style={{ marginTop: Spacing.m }}>{user?.email?.split('@')[0] || 'Traveler'}</Title2>
                <Body style={{ color: colors.textSecondary }}>{user?.email}</Body>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* My Bookings */}
                <View style={styles.sectionHeader}>
                    <Headline>My Bookings</Headline>
                </View>

                {userBookingsLoading ? (
                    <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                        <ActivityIndicator size="small" color={colors.tint} />
                    </View>
                ) : userBookings.length === 0 ? (
                    <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                        <Body style={{ color: colors.textSecondary, textAlign: 'center', padding: Spacing.m }}>
                            No bookings yet. Start exploring!
                        </Body>
                    </View>
                ) : (
                    <View>
                        {userBookings.map(booking => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))}
                    </View>
                )}

                {/* Booking Requests (Host Section) */}
                {hostBookings.length > 0 && (
                    <>
                        <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
                            <View style={styles.sectionTitleRow}>
                                <Headline>Booking Requests</Headline>
                                {pendingHostBookingsCount > 0 && (
                                    <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                                        <Body style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                                            {pendingHostBookingsCount}
                                        </Body>
                                    </View>
                                )}
                            </View>
                        </View>

                        {hostBookingsLoading ? (
                            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                                <ActivityIndicator size="small" color={colors.tint} />
                            </View>
                        ) : (
                            <View>
                                {hostBookings.map(booking => (
                                    <HostBookingCard
                                        key={booking.id}
                                        booking={booking}
                                        onUpdateStatus={updateBookingStatus}
                                    />
                                ))}
                            </View>
                        )}
                    </>
                )}

                {/* My Listings */}
                <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
                    <Headline>My Listings</Headline>
                </View>

                <TouchableOpacity
                    style={[styles.tile, { backgroundColor: colors.background }]}
                    onPress={() => router.push('/host/create-listing')}
                >
                    <View style={styles.tileContent}>
                        <Ionicons name="add-circle" size={24} color={colors.tint} />
                        <Body>Create New Listing</Body>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>

                <View style={{ marginTop: Spacing.xxl }}>
                    <Button
                        title="Log Out"
                        variant="destructive"
                        onPress={signOut}
                        fullWidth
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        marginBottom: Spacing.m,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: Spacing.s,
    },
    content: {
        padding: Spacing.m,
    },
    sectionHeader: {
        marginBottom: Spacing.s,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
    },
    badge: {
        paddingHorizontal: Spacing.s,
        paddingVertical: 2,
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        padding: Spacing.m,
        borderRadius: BorderRadius.card,
    },
    tile: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.m,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.s,
    },
    tileContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
    },
});

