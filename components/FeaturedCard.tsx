import { Headline, Subheadline } from '@/components/ui/Typography';
import { BorderRadius, Layout, Shadows, Spacing } from '@/constants/Design';
import { Listing } from '@/types/listing';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';

const { featuredCardWidth, featuredCardHeight } = Layout;

type Props = {
    listing: Listing;
};

export function FeaturedCard({ listing }: Props) {
    const router = useRouter();

    return (
        <Pressable
            onPress={() => router.push(`/listing/${listing.id}`)}
            style={({ pressed }) => [
                styles.container,
                { opacity: pressed ? 0.9 : 1 }
            ]}
        >
            <ImageBackground
                source={{ uri: listing.image_url ?? 'https://via.placeholder.com/400' }}
                style={styles.image}
                imageStyle={{ borderRadius: BorderRadius.card }}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                >
                    <View style={styles.textContainer}>
                        <Headline style={{ color: '#fff' }} numberOfLines={1}>
                            {listing.title}
                        </Headline>
                        <Subheadline style={{ color: 'rgba(255,255,255,0.8)' }}>
                            {listing.location}
                        </Subheadline>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: featuredCardWidth,
        height: featuredCardHeight,
        marginRight: Spacing.m,
        ...Shadows.small,
        backgroundColor: 'transparent',
    },
    image: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    gradient: {
        height: '50%',
        justifyContent: 'flex-end',
        padding: Spacing.m,
        borderRadius: BorderRadius.card,
    },
    textContainer: {
        gap: 2,
    },
});
