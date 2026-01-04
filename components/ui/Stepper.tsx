import { BodyBold } from '@/components/ui/Typography';
import { SemanticColors, Spacing } from '@/constants/Design';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';

type Props = {
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
    min?: number;
    max?: number;
};

export function Stepper({ value, onIncrement, onDecrement, min = 0, max = 20 }: Props) {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    return (
        <View style={styles.stepper}>
            <TouchableOpacity
                onPress={onDecrement}
                style={[
                    styles.stepBtn,
                    { borderColor: colors.border },
                    value <= min && styles.disabled
                ]}
                disabled={value <= min}
            >
                <Ionicons name="remove" size={20} color={value <= min ? colors.textDisabled : colors.textPrimary} />
            </TouchableOpacity>

            <BodyBold style={{ width: 40, textAlign: 'center' }}>{value}</BodyBold>

            <TouchableOpacity
                onPress={onIncrement}
                style={[
                    styles.stepBtn,
                    { borderColor: colors.border },
                    value >= max && styles.disabled
                ]}
                disabled={value >= max}
            >
                <Ionicons name="add" size={20} color={value >= max ? colors.textDisabled : colors.textPrimary} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
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
    disabled: {
        opacity: 0.5,
        borderColor: '#eee',
    }
});
