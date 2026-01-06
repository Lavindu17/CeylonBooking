import { BookingModal } from '@/components/BookingModal';
import { Button } from '@/components/ui/Button';
import { Body, Caption1, Headline, Title2 } from '@/components/ui/Typography';
import { BorderRadius, BrandColors, formatPricePerNight, Layout, SemanticColors, Shadows, Spacing } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types/listing';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function ListingDetails() {
    const { id } = useLocalSearchParams();
    const [listing, setListing] = useState<Listing | null>(null);
    const [isBookingModalVisible, setBookingModalVisible] = useState(false);
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    useEffect(() => {
        if (id) fetchListing();
    }, [id]);

    async function fetchListing() {
        // Fetch listing data with images
        const { data: listingData, error: listingError } = await supabase
            .from('listings')
            .select(`
                *,
                listing_images (
                    id,
                    storage_path,
                    url,
                    order
                )
            `)
            .eq('id', id)
            .single();

        if (listingError) {
            console.error(listingError);
            return;
        }

        // Sort images by order
        if (listingData.listing_images) {
            listingData.listing_images.sort((a: any, b: any) => a.order - b.order);
        }

        // Fetch host data using RPC function
        const { data: hostData, error: hostError } = await supabase
            .rpc('get_user_public_info', { user_id: listingData.host_id })
            .single();

        if (hostError) {
            console.error('Host data error:', hostError);
            // Set listing without host data
            setListing({
                ...listingData,
                images: listingData.listing_images || []
            });
        } else if (hostData) {
            // Combine listing with host data
            setListing({
                ...listingData,
                images: listingData.listing_images || [],
                host: {
                    id: (hostData as any).id,
                    email: (hostData as any).email,
                    raw_user_meta_data: {
                        display_name: (hostData as any).display_name,
                        avatar_url: (hostData as any).avatar_url
                    }
                }
            });
        } else {
            // No host data found
            setListing({
                ...listingData,
                images: listingData.listing_images || []
            });
        }
    }

    if (!listing) return (
        <View style={[styles.loading, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={BrandColors.ceylonGreen} />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    title: '',
                    headerTransparent: true,
                    headerTintColor: '#fff',
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.roundButton}
                        >
                            <Ionicons name="arrow-back" size={20} color="#000" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity style={styles.roundButton}>
                            <Ionicons name="heart-outline" size={20} color="#000" />
                        </TouchableOpacity>
                    )
                }}
            />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Image Carousel */}
                {listing.images && listing.images.length > 0 ? (
                    <View>
                        <FlatList
                            data={listing.images}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <Image
                                    source={{ uri: item.url }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            )}
                        />
                        {listing.images.length > 1 && (
                            <View style={styles.paginationDots}>
                                {listing.images.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.dot,
                                            index === 0 && styles.activeDot
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                ) : (
                    <Image
                        source={{ uri: listing.image_url ?? 'https://images.unsplash.com/photo-1449156493391-d2cfa28e468b' }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.content}>
                    <Title2>{listing.title}</Title2>
                    <Body style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
                        {listing.location}
                    </Body>

                    <Caption1 style={{ color: colors.textSecondary }}>
                        {listing.beds} Beds · {listing.baths || 1} Bath
                    </Caption1>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Host Section */}
                    <View style={styles.hostSection}>
                        <View style={styles.hostInfo}>
                            <Image
                                source={{
                                    uri: listing.host?.raw_user_meta_data?.avatar_url
                                        || `https://i.pravatar.cc/150?u=${listing.host?.email}`
                                }}
                                style={styles.avatar}
                            />
                            <View>
                                <Headline>
                                    Hosted by {listing.host?.raw_user_meta_data?.display_name
                                        || listing.host?.email?.split('@')[0]
                                        || 'Host'}
                                </Headline>
                                <Caption1 style={{ color: colors.textSecondary }}>{listing.host?.email}</Caption1>
                            </View>
                        </View>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.backgroundSecondary }]}>
                            <Ionicons name="call" size={20} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <Headline style={{ marginBottom: Spacing.m }}>What this place offers</Headline>
                    <View style={styles.facilities}>
                        {listing.facilities?.map((fac, index) => (
                            <View key={index} style={[styles.facilityItem, { width: '48%' }]}>
                                <Ionicons name="checkmark-circle-outline" size={20} color={colors.textSecondary} />
                                <Body style={{ fontSize: 15 }}>{fac}</Body>
                            </View>
                        )) || <Body style={{ color: colors.textSecondary }}>No specific amenities listed.</Body>}
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <Headline style={{ marginBottom: Spacing.m }}>Location</Headline>
                    {listing.latitude && listing.longitude ? (
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: listing.latitude,
                                longitude: listing.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                        >
                            <Marker
                                coordinate={{
                                    latitude: listing.latitude,
                                    longitude: listing.longitude,
                                }}
                                title={listing.title}
                                description={listing.location}
                            />
                        </MapView>
                    ) : (
                        <View style={[styles.mapPlaceholder, { backgroundColor: colors.backgroundSecondary }]}>
                            <Ionicons name="map" size={32} color={colors.textDisabled} />
                            <Body style={{ color: colors.textSecondary, marginTop: Spacing.s }}>Location not available</Body>
                        </View>
                    )}

                    <Body style={{ marginTop: Spacing.m, lineHeight: 22 }}>
                        {listing.description}
                    </Body>
                </View>
            </ScrollView>

            {/* Sticky Booking Bar */}
            {!isBookingModalVisible && (
                <View style={[styles.footer, {
                    backgroundColor: colors.background, // Should use blur if possible, but solid is fine
                    borderTopColor: colors.border,
                    ...styles.shadowTop
                }]}>
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                            <Title2 style={{ fontSize: 20 }}>{formatPricePerNight(listing.price).split('/')[0]}</Title2>
                            <Caption1 style={{ color: colors.textSecondary }}>/ night</Caption1>
                        </View>
                        <Caption1 style={{ color: colors.textSecondary }}>Oct 15 - 20</Caption1>
                    </View>

                    <Button
                        title="Book Now"
                        onPress={() => setBookingModalVisible(true)}
                        style={{ width: 140 }}
                    />
                </View>
            )}

            <BookingModal
                visible={isBookingModalVisible}
                onClose={() => setBookingModalVisible(false)}
                listing={listing}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width,
        height: Layout.carouselHeight, // 300
    },
    roundButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        ...(Shadows.small as object)
    },
    content: {
        padding: Spacing.l,
    },
    divider: {
        height: 1,
        marginVertical: Spacing.l,
    },
    hostSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    hostInfo: {
        flexDirection: 'row',
        gap: Spacing.m,
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    facilities: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.s,
    },
    facilityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
        marginBottom: Spacing.s,
    },
    map: {
        height: 180,
        borderRadius: BorderRadius.card,
        overflow: 'hidden',
    },
    mapPlaceholder: {
        height: 180,
        borderRadius: BorderRadius.card,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.m,
        paddingBottom: Spacing.xl, // Safe area
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paginationDots: {
        position: 'absolute',
        bottom: 16,
        flexDirection: 'row',
        alignSelf: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    activeDot: {
        backgroundColor: '#fff',
        width: 20,
    },
    shadowTop: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 5,
    }
});
