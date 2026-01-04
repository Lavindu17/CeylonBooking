import { SemanticColors, Typography } from '@/constants/Design';
import React from 'react';
import {
    Text,
    TextProps,
    useColorScheme
} from 'react-native';

type TypographyVariant =
    | 'largeTitle'
    | 'title1'
    | 'title2'
    | 'title3'
    | 'headline'
    | 'body'
    | 'bodyBold'
    | 'subheadline'
    | 'footnote'
    | 'caption1'
    | 'caption2';

type TextColor = 'primary' | 'secondary' | 'tertiary' | 'white' | 'tint' | 'error';

interface StyledTextProps extends TextProps {
    variant?: TypographyVariant;
    color?: TextColor;
    align?: 'left' | 'center' | 'right';
}

export function StyledText({
    variant = 'body',
    color = 'primary',
    align = 'left',
    style,
    ...props
}: StyledTextProps) {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    const textColor =
        color === 'primary'
            ? colors.textPrimary
            : color === 'secondary'
                ? colors.textSecondary
                : color === 'tertiary'
                    ? colors.textTertiary
                    : color === 'white'
                        ? '#FFFFFF'
                        : color === 'tint'
                            ? colors.tint
                            : color === 'error'
                                ? colors.error
                                : colors.textPrimary;

    return (
        <Text
            style={[
                Typography[variant],
                { color: textColor, textAlign: align },
                style,
            ]}
            {...props}
        />
    );
}

// Convenience components for common text types
export function LargeTitle(props: Omit<StyledTextProps, 'variant'>) {
    return <StyledText variant="largeTitle" {...props} />;
}

export function Title1(props: Omit<StyledTextProps, 'variant'>) {
    return <StyledText variant="title1" {...props} />;
}

export function Title2(props: Omit<StyledTextProps, 'variant'>) {
    return <StyledText variant="title2" {...props} />;
}

export function Title3(props: Omit<StyledTextProps, 'variant'>) {
    return <StyledText variant="title3" {...props} />;
}

export function Headline(props: Omit<StyledTextProps, 'variant'>) {
    return <StyledText variant="headline" {...props} />;
}

export function Body(props: Omit<StyledTextProps, 'variant'>) {
    return <StyledText variant="body" {...props} />;
}

export function BodyBold(props: Omit<StyledTextProps, 'variant'>) {
    return <StyledText variant="bodyBold" {...props} />;
}

export function Subheadline(props: Omit<StyledTextProps, 'variant'>) {
    return <StyledText variant="subheadline" {...props} />;
}

export function Footnote(props: Omit<StyledTextProps, 'variant'>) {
    return <StyledText variant="footnote" {...props} />;
}

export function Caption1(props: Omit<StyledTextProps, 'variant'>) {
    return <StyledText variant="caption1" {...props} />;
}

export function Caption2(props: Omit<StyledTextProps, 'variant'>) {
    return <StyledText variant="caption2" {...props} />;
}
