import { BrandColors, SemanticColors } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LargeTitle } from './ui/Typography';

export default function LoadingScreen() {
    const opacity = useSharedValue(0);
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 300 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.View style={[styles.content, animatedStyle]}>
                <LargeTitle style={{ color: BrandColors.ceylonGreen }}>CeylonStay</LargeTitle>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
});
