import { BrandColors, SemanticColors, Spacing } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Tab = {
    key: string;
    label: string;
    badge?: number;
};

type Props = {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (key: string) => void;
};

export function TabBar({ tabs, activeTab, onTabChange }: Props) {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    return (
        <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <Pressable
                        key={tab.key}
                        style={styles.tab}
                        onPress={() => onTabChange(tab.key)}
                    >
                        <View style={styles.tabContent}>
                            <Text
                                style={[
                                    styles.tabLabel,
                                    {
                                        color: isActive ? BrandColors.ceylonGreen : colors.textSecondary,
                                        fontWeight: isActive ? '600' : '400',
                                    },
                                ]}
                            >
                                {tab.label}
                            </Text>
                            {tab.badge !== undefined && tab.badge > 0 && (
                                <View style={[styles.badge, { backgroundColor: BrandColors.ceylonGreen }]}>
                                    <Text style={styles.badgeText}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
                                </View>
                            )}
                        </View>
                        {isActive && (
                            <View style={[styles.indicator, { backgroundColor: BrandColors.ceylonGreen }]} />
                        )}
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        paddingHorizontal: Spacing.m,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.m,
        alignItems: 'center',
        position: 'relative',
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    tabLabel: {
        fontSize: 15,
    },
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        paddingHorizontal: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
    },
    indicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
    },
});
