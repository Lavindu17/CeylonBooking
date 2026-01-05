import { Button } from '@/components/ui/Button';
import { Body, BodyBold, Headline } from '@/components/ui/Typography';
import { BorderRadius, SemanticColors, Spacing } from '@/constants/Design';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
};

export function SettingsModal({ visible, onClose }: Props) {
    const { user, signOut } = useAuth();
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? SemanticColors.dark : SemanticColors.light;

    const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || user?.email?.split('@')[0] || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null);

    const handleUpdateProfile = async () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Display name cannot be empty');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { display_name: displayName.trim() },
            });

            if (error) throw error;

            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEmail = async () => {
        if (!email.trim() || !email.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        if (email === user?.email) {
            Alert.alert('Info', 'Email is the same as your current email');
            return;
        }

        Alert.alert(
            'Update Email',
            'You will receive a confirmation email at your new address. Please verify it to complete the change.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Continue',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const { error } = await supabase.auth.updateUser({
                                email: email.trim(),
                            });

                            if (error) throw error;

                            Alert.alert('Success', 'Verification email sent! Please check your inbox.');
                        } catch (error) {
                            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update email');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleUploadAvatar = async () => {
        try {
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need camera roll permissions to upload your profile picture.');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled) {
                return;
            }

            setUploadingAvatar(true);

            const photo = result.assets[0];

            // Convert image to base64
            const response = await fetch(photo.uri);
            const blob = await response.blob();
            const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as ArrayBuffer);
                reader.onerror = reject;
                reader.readAsArrayBuffer(blob);
            });

            const fileExt = photo.uri.split('.').pop()?.toLowerCase() || 'jpg';
            const filePath = `${user!.id}/avatar.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, arrayBuffer, {
                    contentType: `image/${fileExt}`,
                    upsert: true, // Replace existing file
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const publicUrl = urlData.publicUrl;

            // Update user metadata with avatar URL
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl },
            });

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            Alert.alert('Success', 'Profile picture updated successfully!');
        } catch (error) {
            console.error('Avatar upload error:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload profile picture');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: () => {
                    signOut();
                    onClose();
                },
            },
        ]);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.overlayTouchable}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <View />
                </TouchableOpacity>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={styles.header}>
                        <Headline>Settings</Headline>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        {/* Profile Picture */}
                        <View style={styles.section}>
                            <BodyBold style={{ marginBottom: Spacing.m }}>Profile Picture</BodyBold>
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatarWrapper}>
                                    <Image
                                        source={{
                                            uri: avatarUrl || `https://i.pravatar.cc/150?u=${user?.email}`
                                        }}
                                        style={styles.avatar}
                                    />
                                    {uploadingAvatar && (
                                        <View style={styles.avatarLoading}>
                                            <ActivityIndicator size="large" color="#fff" />
                                        </View>
                                    )}
                                </View>
                                <Button
                                    title={uploadingAvatar ? "Uploading..." : "Change Picture"}
                                    onPress={handleUploadAvatar}
                                    disabled={uploadingAvatar}
                                    loading={uploadingAvatar}
                                    size="small"
                                    variant="secondary"
                                />
                            </View>
                        </View>

                        {/* Divider */}
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Display Name */}
                        <View style={styles.section}>
                            <BodyBold style={{ marginBottom: Spacing.s }}>Display Name</BodyBold>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.backgroundSecondary,
                                        color: colors.textPrimary,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Enter your name"
                                placeholderTextColor={colors.textTertiary}
                            />
                            <Button
                                title="Update Name"
                                onPress={handleUpdateProfile}
                                loading={loading}
                                disabled={loading}
                                size="medium"
                                style={{ marginTop: Spacing.s }}
                            />
                        </View>

                        {/* Divider */}
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Email */}
                        <View style={styles.section}>
                            <BodyBold style={{ marginBottom: Spacing.s }}>Email Address</BodyBold>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.backgroundSecondary,
                                        color: colors.textPrimary,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                placeholderTextColor={colors.textTertiary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <Body style={{ color: colors.textSecondary, fontSize: 13, marginTop: Spacing.xs }}>
                                You'll need to verify your new email address
                            </Body>
                            <Button
                                title="Update Email"
                                onPress={handleUpdateEmail}
                                loading={loading}
                                disabled={loading}
                                size="medium"
                                variant="secondary"
                                style={{ marginTop: Spacing.s }}
                            />
                        </View>

                        {/* Divider */}
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Logout */}
                        <View style={styles.section}>
                            <Button
                                title="Log Out"
                                variant="destructive"
                                onPress={handleLogout}
                                fullWidth
                            />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'flex-end',
    },
    overlayTouchable: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    container: {
        borderTopLeftRadius: BorderRadius.bottomSheet,
        borderTopRightRadius: BorderRadius.bottomSheet,
        paddingBottom: Spacing.xxl,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.l,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.06)',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: Spacing.l,
    },
    section: {
        marginBottom: Spacing.m,
    },
    input: {
        borderWidth: 1,
        borderRadius: BorderRadius.button,
        paddingHorizontal: Spacing.m,
        paddingVertical: 12,
        fontSize: 16,
    },
    divider: {
        height: 1,
        marginVertical: Spacing.l,
    },
    avatarContainer: {
        alignItems: 'center',
        gap: Spacing.m,
    },
    avatarWrapper: {
        position: 'relative',
        width: 120,
        height: 120,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
