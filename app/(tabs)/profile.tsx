import { BookingCard } from '@/components/BookingCard';
import { HostBookingCard } from '@/components/HostBookingCard';
import { MyListingCard } from '@/components/MyListingCard';
import { SettingsModal } from '@/components/SettingsModal';
import { TabBar } from '@/components/ui/TabBar';
import { Body, Headline, Title2 } from '@/components/ui/Typography';
import { BorderRadius, BrandColors, SemanticColors, Spacing } from '@/constants/Design';
import { useAuth } from '@/contexts/AuthContext';
import { useHostBookings } from '@/hooks/useHostBookings';
import { useUserBookings } from '@/hooks/useUserBookings';
import { useUserListings } from '@/hooks/useUserListings';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    // Tab state
    const [activeTab, setActiveTab] = useState('trips');

    // Settings modal state
    const [settingsVisible, setSettingsVisible] = useState(false);

    // Fetch user bookings
    const { bookings: userBookings, loading: userBookingsLoading, refetch: refetchUserBookings } = useUserBookings();

    // Fetch host bookings (bookings for listings owned by this user)
    const { bookings: hostBookings, loading: hostBookingsLoading, updateBookingStatus, refetch: refetchHostBookings } = useHostBookings();

    // Fetch user's listings
    const { listings: userListings, loading: userListingsLoading, refetch: refetchUserListings, deleteListing } = useUserListings();

    const [refreshing, setRefreshing] = useState(false);

    const pendingHostBookingsCount = hostBookings.filter(b => b.status === 'pending').length;

    // Tabs configuration
    const tabs = [
        { key: 'trips', label: 'My Trips' },
        { key: 'requests', label: 'Requests', badge: pendingHostBookingsCount },
        { key: 'listings', label: 'Listings' },
    ];

    const onRefresh = async () => {
        setRefreshing(true);
        if (activeTab === 'trips') {
            await refetchUserBookings();
        } else if (activeTab === 'requests') {
            await refetchHostBookings();
        } else if (activeTab === 'listings') {
            await refetchUserListings();
        }
        setRefreshing(false);
    };

    const renderEmptyState = (icon: string, primary: string, secondary?: string) => (
        <View style={[styles.emptyCard, { backgroundColor: colors.background }]}>
            <Ionicons name={icon as any} size={48} color={colors.textDisabled} />
            <Body style={{ color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.m }}>
                {primary}
            </Body>
            {secondary && (
                <Body style={{ color: colors.textTertiary, textAlign: 'center', fontSize: 13, marginTop: Spacing.xs }}>
                    {secondary}
                </Body>
            )}
        </View>
    );

    const renderTripsTab = () => (
        <ScrollView
            contentContainerStyle={styles.tabContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BrandColors.ceylonGreen} />
            }
        >
            <Headline style={styles.tabTitle}>My Bookings</Headline>

            {userBookingsLoading ? (
                renderEmptyState('time-outline', 'Loading...')
            ) : userBookings.length === 0 ? (
                renderEmptyState('calendar-outline', 'No bookings yet', 'Start exploring amazing stays!')
            ) : (
                <View>
                    {userBookings.map(booking => (
                        <BookingCard key={booking.id} booking={booking} />
                    ))}
                </View>
            )}
        </ScrollView>
    );

    const renderRequestsTab = () => (
        <ScrollView
            contentContainerStyle={styles.tabContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BrandColors.ceylonGreen} />
            }
        >
            <Headline style={styles.tabTitle}>Booking Requests</Headline>

            {hostBookingsLoading ? (
                renderEmptyState('time-outline', 'Loading...')
            ) : hostBookings.length === 0 ? (
                renderEmptyState('business-outline', 'No booking requests', 'Create a listing to start hosting!')
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
        </ScrollView>
    );

    const renderListingsTab = () => {
        const handleDeleteListing = async (listingId: string) => {
            const result = await deleteListing(listingId);
            if (result.success) {
                Alert.alert('Success', 'Listing deleted successfully');
            } else {
                Alert.alert('Error', result.error || 'Failed to delete listing');
            }
        };

        return (
            <ScrollView
                contentContainerStyle={styles.tabContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BrandColors.ceylonGreen} />
                }
            >
                <Headline style={styles.tabTitle}>My Listings</Headline>

                <TouchableOpacity
                    style={[styles.tile, { backgroundColor: colors.background }]}
                    onPress={() => router.push('/host/create-listing')}
                >
                    <View style={styles.tileContent}>
                        <Ionicons name="add-circle" size={24} color={BrandColors.ceylonGreen} />
                        <Body>Create New List</Body>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>

                {/* User's Listings */}
                {userListingsLoading ? (
                    renderEmptyState('time-outline', 'Loading...')
                ) : userListings.length === 0 ? (
                    renderEmptyState('home-outline', 'No listings yet', 'Create your first listing to start hosting!')
                ) : (
                    <View style={{ marginTop: Spacing.m }}>
                        {userListings.map(listing => (
                            <MyListingCard
                                key={listing.id}
                                listing={listing}
                                onDelete={handleDeleteListing}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity
                    style={[styles.settingsButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={() => setSettingsVisible(true)}
                >
                    <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
                </TouchableOpacity>

                <Image
                    source={{ uri: 'https://i.pravatar.cc/150?u=' + user?.email }}
                    style={styles.avatar}
                />
                <Title2 style={{ marginTop: Spacing.m }}>
                    {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Traveler'}
                </Title2>
                <Body style={{ color: colors.textSecondary }}>{user?.email}</Body>
            </View>

            {/* Tab Bar */}
            <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            <View style={styles.tabContainer}>
                {activeTab === 'trips' && renderTripsTab()}
                {activeTab === 'requests' && renderRequestsTab()}
                {activeTab === 'listings' && renderListingsTab()}
            </View>

            {/* Settings Modal */}
            <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
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
        position: 'relative',
    },
    settingsButton: {
        position: 'absolute',
        top: Spacing.m,
        right: Spacing.m,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: Spacing.s,
    },
    tabContainer: {
        flex: 1,
    },
    tabContent: {
        padding: Spacing.m,
        paddingBottom: Spacing.xxl,
    },
    tabTitle: {
        marginBottom: Spacing.m,
    },
    emptyCard: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.card,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
    },
    tile: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.l,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.m,
    },
    tileContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.m,
    },
    divider: {
        height: 1,
        marginVertical: Spacing.l,
    },
});
