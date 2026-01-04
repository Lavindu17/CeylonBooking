import { FeaturedCard } from '@/components/FeaturedCard';
import { ListingCard } from '@/components/ListingCard';
import { Body, Title2 } from '@/components/ui/Typography';
import { BorderRadius, BrandColors, SemanticColors, Spacing } from '@/constants/Design';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types/listing';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('listings').select('*');
      if (error) throw error;
      setListings(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const renderHeader = () => (
    <View>
      {/* Search Bar */}
      <Pressable
        style={styles.searchBar}
        onPress={() => router.push('/(tabs)/search')}
      >
        <Ionicons name="search" size={20} color={SemanticColors.light.textPrimary} />
        <Body style={styles.searchText}>Search by town or city</Body>
      </Pressable>

      {/* Featured Section */}
      <View style={styles.section}>
        <Title2 style={styles.sectionTitle}>Popular Getaways</Title2>
        <FlatList
          data={listings.slice(0, 5)}
          renderItem={({ item }) => <FeaturedCard listing={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
          keyExtractor={(item) => `featured-${item.id}`}
        />
      </View>

      {/* Grid Title */}
      <View style={styles.section}>
        <Title2 style={styles.sectionTitle}>Near You</Title2>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={BrandColors.ceylonGreen} />
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <ListingCard listing={item} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BrandColors.ceylonGreen} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SemanticColors.light.backgroundSecondary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SemanticColors.light.background,
    marginHorizontal: Spacing.m,
    marginTop: Spacing.s,
    marginBottom: Spacing.l,
    paddingHorizontal: Spacing.m,
    paddingVertical: 11,
    borderRadius: BorderRadius.button,
    gap: Spacing.s,
    // Soft shadow
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    minHeight: 44,
  },
  searchText: { // Placeholder style
    color: SemanticColors.light.textTertiary,
  },
  section: {
    marginBottom: Spacing.m,
  },
  sectionTitle: {
    marginHorizontal: Spacing.m,
    marginBottom: Spacing.m,
  },
  featuredList: {
    paddingHorizontal: Spacing.m,
  },
  row: {
    gap: Spacing.m,
    paddingHorizontal: Spacing.m,
  },
  gridItem: {
    flex: 1,
    maxWidth: '48%', // Approx half with gap
  },
});
