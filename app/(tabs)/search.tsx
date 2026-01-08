import { SearchResultCard } from '@/components/SearchResultCard';
import { Body, BodyBold, Title2 } from '@/components/ui/Typography';
import { BorderRadius, BrandColors, SemanticColors, Spacing } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useShake } from '@/hooks/useShake';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types/listing';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchLocation, setSearchLocation] = useState('');
    const [beds, setBeds] = useState(1);
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    useEffect(() => {
        fetchListings();
    }, []);

    useEffect(() => {
        filterListings();
    }, [searchLocation, beds, listings]);

    useShake(() => {
        if (searchLocation || beds > 1) {
            clearFilters();
            Vibration.vibrate();
        }
    });

    const clearFilters = () => {
        setSearchLocation('');
        setBeds(1);
    };

    async function fetchListings() {
        setLoading(true);
        const { data, error } = await supabase.from('listings').select(`
            *,
            listing_images (
                id,
                url,
                order
            )
        `);

        if (error) {
            console.error(error);
            setLoading(false);
            return;
        }

        // Get unique host IDs
        const hostIds = [...new Set(data?.map((l: any) => l.host_id) || [])];

        // Fetch profiles for all hosts
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, phone, bio, profile_image_url')
            .in('id', hostIds);

        // Create a map of profiles by id
        const profilesMap = new Map(
            profiles?.map(p => [p.id, p]) || []
        );

        // Add host_profile to each listing
        const listingsWithProfiles = (data || []).map((listing: any) => ({
            ...listing,
            images: listing.listing_images?.sort((a: any, b: any) => a.order - b.order) || [],
            host_profile: profilesMap.get(listing.host_id) || null
        }));

        setListings(listingsWithProfiles);
        setFilteredListings(listingsWithProfiles);
        setLoading(false);
    }

    function filterListings() {
        let filtered = listings;

        if (searchLocation) {
            filtered = filtered.filter(l =>
                l.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
                l.title.toLowerCase().includes(searchLocation.toLowerCase())
            );
        }

        // Filter by beds (>= selected beds)
        if (beds > 1) {
            filtered = filtered.filter(l => l.beds >= beds);
        }

        setFilteredListings(filtered);
    }

    // Stepper Component
    const Stepper = ({ value, onIncrement, onDecrement }: { value: number, onIncrement: () => void, onDecrement: () => void }) => (
        <View style={styles.stepper}>
            <TouchableOpacity onPress={onDecrement} style={[styles.stepBtn, { borderColor: colors.border }]}>
                <Ionicons name="remove" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <BodyBold style={{ width: 30, textAlign: 'center' }}>{value}</BodyBold>
            <TouchableOpacity onPress={onIncrement} style={[styles.stepBtn, { borderColor: colors.border }]}>
                <Ionicons name="add" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Search Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Title2 style={{ marginBottom: Spacing.m }}>Search</Title2>

                {/* Location Filter */}
                <View style={[styles.searchBox, { backgroundColor: colors.backgroundSecondary }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        placeholder="Town or Area"
                        placeholderTextColor={colors.textTertiary}
                        value={searchLocation}
                        onChangeText={setSearchLocation}
                        style={[styles.input, { color: colors.textPrimary }]}
                    />
                    {searchLocation ? (
                        <TouchableOpacity onPress={() => setSearchLocation('')}>
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Beds Filter */}
                <View style={styles.filterRow}>
                    <Body>Min Beds</Body>
                    <Stepper
                        value={beds}
                        onIncrement={() => setBeds(b => Math.min(b + 1, 10))}
                        onDecrement={() => setBeds(b => Math.max(b - 1, 1))}
                    />
                </View>

                {(searchLocation || beds > 1) && (
                    <TouchableOpacity
                        onPress={clearFilters}
                        style={[styles.clearButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
                    >
                        <Ionicons name="refresh" size={16} color={BrandColors.ceylonGreen} />
                        <Body style={{ color: BrandColors.ceylonGreen, marginLeft: Spacing.xs }}>
                            Clear Filters
                        </Body>
                    </TouchableOpacity>
                )}
            </View>

            {/* Results */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={BrandColors.ceylonGreen} />
                </View>
            ) : (
                <FlatList
                    data={filteredListings}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <SearchResultCard listing={item} />}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <Body style={{ color: colors.textSecondary }}>No stays found</Body>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.m,
        paddingBottom: Spacing.m,
        borderBottomWidth: 1,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.m,
        borderRadius: BorderRadius.button,
        marginBottom: Spacing.m,
        gap: Spacing.s,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%' // Ensure text input takes height
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.s,
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.m,
    },
    stepBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.s,
        paddingHorizontal: Spacing.m,
        borderRadius: BorderRadius.button,
        borderWidth: 1,
        marginTop: Spacing.m,
    },
    hintText: {
        fontSize: 12,
        color: SemanticColors.light.textTertiary,
        textAlign: 'center',
        marginTop: Spacing.xs,
    },
    list: {
        paddingHorizontal: Spacing.m,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Spacing.xl,
    }
});
