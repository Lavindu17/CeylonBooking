import { Button } from '@/components/ui/Button';
import { Body, Caption1, Title2 } from '@/components/ui/Typography';
import { BorderRadius, BrandColors, SemanticColors, Spacing } from '@/constants/Design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserProfile } from '@/types/profile';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
    host: UserProfile | null;
    hostName?: string;
    hostEmail?: string;
};

export function HostProfileModal({ visible, onClose, host, hostName, hostEmail }: Props) {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    const handleCall = () => {
        if (!host?.phone) {
            Alert.alert('No Phone Number', 'This host hasn\'t added their phone number yet.');
            return;
        }

        Alert.alert(
            'Call Host',
            `Would you like to call ${hostName || 'the host'}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Call',
                    onPress: () => {
                        Linking.openURL(`tel:${host.phone}`);
                    },
                },
            ]
        );
    };

    const formatPhoneNumber = (phone: string): string => {
        // Format +94771234567 to +94 77 123 4567
        if (phone.startsWith('+94') && phone.length === 12) {
            return `+94 ${phone.substring(3, 5)} ${phone.substring(5, 8)} ${phone.substring(8)}`;
        }
        return phone;
    };

    if (!host) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.overlayTouchable}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <View />
                </TouchableOpacity>

                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    {/* Close Button */}
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close-circle" size={32} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {/* Host Name */}
                    <Title2 style={{ textAlign: 'center', marginTop: Spacing.l }}>
                        {hostName || 'Host'}
                    </Title2>

                    {/* Contact Information */}
                    <View style={styles.infoSection}>
                        {/* Email */}
                        {hostEmail && (
                            <View style={[styles.infoRow, { backgroundColor: colors.backgroundSecondary }]}>
                                <Ionicons name="mail" size={20} color={BrandColors.ceylonGreen} />
                                <View style={{ marginLeft: Spacing.m, flex: 1 }}>
                                    <Caption1 style={{ color: colors.textSecondary }}>Email</Caption1>
                                    <Body style={{ marginTop: 2 }}>{hostEmail}</Body>
                                </View>
                            </View>
                        )}

                        {/* Phone */}
                        <View style={[styles.infoRow, { backgroundColor: colors.backgroundSecondary }]}>
                            <Ionicons name="call" size={20} color={BrandColors.ceylonGreen} />
                            <View style={{ marginLeft: Spacing.m, flex: 1 }}>
                                <Caption1 style={{ color: colors.textSecondary }}>Phone</Caption1>
                                <Body style={{ marginTop: 2 }}>
                                    {host.phone ? formatPhoneNumber(host.phone) : 'Not provided'}
                                </Body>
                            </View>
                        </View>

                        {/* Bio (if available) */}
                        {host.bio && (
                            <View style={[styles.infoRow, { backgroundColor: colors.backgroundSecondary }]}>
                                <Ionicons name="information-circle" size={20} color={BrandColors.ceylonGreen} />
                                <View style={{ marginLeft: Spacing.m, flex: 1 }}>
                                    <Caption1 style={{ color: colors.textSecondary }}>About</Caption1>
                                    <Body style={{ marginTop: 2 }}>{host.bio}</Body>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Call Button */}
                    {host.phone && (
                        <View style={styles.actionSection}>
                            <Button
                                title="Call Host"
                                onPress={handleCall}
                                icon={<Ionicons name="call" size={20} color="white" />}
                                fullWidth
                            />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.l,
    },
    overlayTouchable: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        width: '100%',
        maxWidth: 400,
        borderRadius: BorderRadius.large,
        padding: Spacing.xl,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: Spacing.m,
        right: Spacing.m,
        zIndex: 10,
    },
    avatarContainer: {
        alignItems: 'center',
        marginTop: Spacing.m,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: BrandColors.ceylonGreen,
    },
    infoSection: {
        marginTop: Spacing.xl,
        gap: Spacing.m,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: Spacing.m,
        borderRadius: BorderRadius.card,
    },
    actionSection: {
        marginTop: Spacing.xl,
        paddingTop: Spacing.l,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
    },
});
