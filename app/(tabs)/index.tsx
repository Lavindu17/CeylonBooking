import { ListingCard } from '@/components/ListingCard';
import { ListingMap } from '@/components/ListingMap';
import { ThemedText } from '@/components/themed-text';
import { useShake } from '@/hooks/useShake';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types/listing';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, TouchableOpacity, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredListings(listings.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.location.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } else {
      setFilteredListings(listings);
    }
  }, [searchQuery, listings]);

  // Shake to Reset
  useShake(() => {
    if (searchQuery) {
      setSearchQuery('');
      Vibration.vibrate();
      alert('Filters cleared!');
    }
  });

  async function fetchListings() {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*');

    if (error) {
      console.error('Error fetching listings:', error);
    } else {
      setListings(data || []);
      setFilteredListings(data || []);
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#000" />
          <TextInput
            placeholder="Where to?"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF385C" style={{ marginTop: 50 }} />
        ) : viewMode === 'list' ? (
          <FlatList
            data={filteredListings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ListingCard listing={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<ThemedText style={{ textAlign: 'center', marginTop: 20 }}>No listings found.</ThemedText>}
          />
        ) : (
          <ListingMap listings={filteredListings} />
        )}
      </View>

      {/* Floating Map/List Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
        >
          <ThemedText style={styles.toggleText}>{viewMode === 'list' ? 'Map' : 'List'}</ThemedText>
          <Ionicons name={viewMode === 'list' ? 'map' : 'list'} size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    padding: 14,
    borderRadius: 30,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchText: {
    fontWeight: '600',
  },
  filterButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 30,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 80, // Space for toggle button
  },
  toggleContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    zIndex: 100,
  },
  toggleButton: {
    backgroundColor: '#222',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleText: {
    color: '#fff',
    fontWeight: '600',
  }
});
