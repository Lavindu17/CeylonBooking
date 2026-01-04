import {
    BorderRadius,
    BrandColors,
    Layout,
    SemanticColors,
    Shadows,
    Spacing,
} from '@/constants/Design';
import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    PressableProps,
    StyleSheet,
    useColorScheme,
    ViewStyle,
} from 'react-native';
import { StyledText } from './Typography';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<PressableProps, 'style'> {
    title: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
    style?: ViewStyle;
}

export function Button({
    title,
    variant = 'primary',
    size = 'large',
    loading = false,
    icon,
    fullWidth = false,
    disabled,
    style,
    ...props
}: ButtonProps) {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    const getBackgroundColor = (pressed: boolean) => {
        if (disabled) {
            return colors.backgroundSecondary;
        }

        switch (variant) {
            case 'primary':
                return pressed ? BrandColors.ceylonGreenDark : BrandColors.ceylonGreen;
            case 'secondary':
                return pressed ? colors.border : colors.backgroundSecondary;
            case 'destructive':
                return pressed ? '#CC2E26' : BrandColors.destructive;
            case 'ghost':
                return pressed ? colors.backgroundSecondary : 'transparent';
            default:
                return BrandColors.ceylonGreen;
        }
    };

    const getTextColor = () => {
        if (disabled) {
            return colors.textDisabled;
        }

        switch (variant) {
            case 'primary':
                return '#FFFFFF';
            case 'secondary':
                return colors.textPrimary;
            case 'destructive':
                return '#FFFFFF';
            case 'ghost':
                return colors.tint;
            default:
                return '#FFFFFF';
        }
    };

    const getHeight = () => {
        switch (size) {
            case 'small':
                return 40;
            case 'medium':
                return 44;
            case 'large':
                return Layout.buttonHeight; // 52
            default:
                return Layout.buttonHeight;
        }
    };

    return (
        <Pressable
            disabled={disabled || loading}
            style={({ pressed }) => [
                styles.button,
                {
                    backgroundColor: getBackgroundColor(pressed),
                    height: getHeight(),
                    opacity: pressed ? 0.8 : 1,
                    width: fullWidth ? '100%' : 'auto',
                },
                variant === 'primary' && Shadows.small,
                style,
            ]}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {icon && <>{icon}</>}
                    <StyledText
                        variant={size === 'small' ? 'footnote' : 'headline'}
                        style={{ color: getTextColor(), marginLeft: icon ? Spacing.s : 0 }}
                    >
                        {title}
                    </StyledText>
                </>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.m,
        borderRadius: BorderRadius.button,
        gap: Spacing.s,
    },
});
