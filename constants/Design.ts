/**
 * CeylonBooking Design System
 * Apple Human Interface Guidelines-inspired design tokens
 */

import { Platform } from 'react-native';

/**
 * Color System
 */
export const BrandColors = {
    // Primary Brand Color - Ceylon Green
    ceylonGreen: '#1F7A5C',
    ceylonGreenLight: '#2A9B74',
    ceylonGreenDark: '#165B45',

    // Error/Destructive
    destructive: '#FF3B30',
};

/**
 * Semantic Colors (Light & Dark Mode)
 */
export const SemanticColors = {
    light: {
        // Backgrounds
        background: '#FFFFFF',
        backgroundSecondary: '#F2F2F7',
        cardBackground: '#FFFFFF',

        // Text
        textPrimary: '#000000',
        textSecondary: '#6E6E73',
        textTertiary: '#999999',
        textDisabled: '#C7C7CC',

        // UI Elements
        border: '#E5E5EA',
        divider: '#E5E5EA',
        overlay: 'rgba(0, 0, 0, 0.4)',

        // Status
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',

        // Interactive
        link: '#007AFF',
        tint: BrandColors.ceylonGreen,
    },
    dark: {
        // Backgrounds
        background: '#000000',
        backgroundSecondary: '#1C1C1E',
        cardBackground: '#2C2C2E',

        // Text
        textPrimary: '#FFFFFF',
        textSecondary: '#A1A1A6',
        textTertiary: '#6E6E73',
        textDisabled: '#3A3A3C',

        // UI Elements
        border: '#38383A',
        divider: '#38383A',
        overlay: 'rgba(0, 0, 0, 0.6)',

        // Status
        success: '#32D74B',
        warning: '#FF9F0A',
        error: '#FF453A',

        // Interactive
        link: '#0A84FF',
        tint: BrandColors.ceylonGreen,
    },
};

/**
 * Typography System (Apple SF Pro equivalents)
 */
export const Typography = {
    // Large Titles
    largeTitle: {
        fontSize: 34,
        lineHeight: 41,
        fontWeight: '700' as const,
        letterSpacing: 0.37,
    },

    // Titles
    title1: {
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '700' as const,
        letterSpacing: 0.36,
    },
    title2: {
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '600' as const,
        letterSpacing: 0.35,
    },
    title3: {
        fontSize: 20,
        lineHeight: 25,
        fontWeight: '600' as const,
        letterSpacing: 0.38,
    },

    // Headlines & Body
    headline: {
        fontSize: 17,
        lineHeight: 22,
        fontWeight: '600' as const,
        letterSpacing: -0.41,
    },
    body: {
        fontSize: 17,
        lineHeight: 22,
        fontWeight: '400' as const,
        letterSpacing: -0.41,
    },
    bodyBold: {
        fontSize: 17,
        lineHeight: 22,
        fontWeight: '600' as const,
        letterSpacing: -0.41,
    },

    // Subheadline & Footnote
    subheadline: {
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '400' as const,
        letterSpacing: -0.24,
    },
    footnote: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '400' as const,
        letterSpacing: -0.08,
    },

    // Captions
    caption1: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '400' as const,
        letterSpacing: 0,
    },
    caption2: {
        fontSize: 11,
        lineHeight: 13,
        fontWeight: '400' as const,
        letterSpacing: 0.07,
    },
};

/**
 * Spacing System
 */
export const Spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
};

/**
 * Border Radius
 */
export const BorderRadius = {
    small: 8,
    button: 12,
    card: 16,
    image: 16,
    large: 20,
    bottomSheet: 24,
    round: 9999,
};

/**
 * Shadows (Apple-style subtle shadows)
 */
export const Shadows = {
    none: {
        shadowColor: 'transparent',
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 0 },
        elevation: 0,
    },

    small: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
        },
        android: {
            elevation: 2,
        },
        default: {
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
        },
    }),

    medium: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
        },
        android: {
            elevation: 4,
        },
        default: {
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
        },
    }),

    large: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
        },
        android: {
            elevation: 8,
        },
        default: {
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
        },
    }),
};

/**
 * Animation Timings
 */
export const AnimationTimings = {
    fast: 150,
    normal: 300,
    slow: 500,
};

/**
 * Layout Constants
 */
export const Layout = {
    screenPadding: Spacing.m, // 16px
    cardGap: Spacing.m, // 16px
    sectionSpacing: Spacing.l, // 24px

    // Component Heights
    buttonHeight: 52,
    inputHeight: 44,
    tabBarHeight: 72,
    navBarHeight: 44,
    searchBarHeight: 44,

    // Image Sizes
    cardImageHeight: 140,
    featuredCardWidth: 260,
    featuredCardHeight: 160,
    thumbnailSize: 72,
    avatarSize: 48,
    profileAvatarSize: 80,
    carouselHeight: 300,
    mapPreviewHeight: 180,
};

/**
 * Helper to get theme-aware colors
 */
export const getThemedColor = (colorScheme: 'light' | 'dark' | null | undefined) => {
    return colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;
};

/**
 * Currency Formatting
 */
export const formatCurrency = (amount: number): string => {
    return `LKR ${amount.toLocaleString('en-US')}`;
};

/**
 * Price Display
 */
export const formatPricePerNight = (amount: number): string => {
    return `${formatCurrency(amount)} / night`;
};
