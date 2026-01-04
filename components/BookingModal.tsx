import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types/listing';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type Props = {
    visible: boolean;
    onClose: () => void;
    listing: Listing;
};

export function BookingModal({ visible, onClose, listing }: Props) {
    const { user } = useAuth();
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onDayPress = (day: DateData) => {
        if (!startDate || (startDate && endDate)) {
            setStartDate(day.dateString);
            setEndDate(null);
        } else if (startDate && !endDate) {
            if (day.dateString < startDate) {
                setStartDate(day.dateString);
            } else {
                setEndDate(day.dateString);
            }
        }
    };

    const markedDates: any = {};
    if (startDate) markedDates[startDate] = { startingDay: true, color: '#FF385C', textColor: 'white' };
    if (endDate) markedDates[endDate] = { endingDay: true, color: '#FF385C', textColor: 'white' };
    if (startDate && endDate) {
        let start = new Date(startDate);
        let end = new Date(endDate);
        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            if (dateStr !== startDate && dateStr !== endDate) {
                markedDates[dateStr] = { color: '#FF385C', textColor: 'white', marked: true };
            }
        }
    }

    const calculateTotal = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays * listing.price;
    };

    const handleBooking = async () => {
        if (!startDate || !endDate || !user) return;

        setLoading(true);

        const { error } = await supabase.from('bookings').insert({
            listing_id: listing.id,
            user_id: user.id,
            start_date: startDate,
            end_date: endDate,
            total_price: calculateTotal(),
            status: 'pending'
        });

        setLoading(false);

        if (error) {
            alert('Booking failed: ' + error.message);
        } else {
            alert('Booking Confirmed! Check your email.');
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <ThemedView style={styles.container}>
                    <View style={styles.header}>
                        <ThemedText type="subtitle">Select Dates</ThemedText>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <Calendar
                        onDayPress={onDayPress}
                        markedDates={markedDates}
                        markingType={'period'}
                        theme={{
                            todayTextColor: '#FF385C',
                            arrowColor: '#FF385C',
                        }}
                    />

                    <View style={styles.footer}>
                        <View>
                            <ThemedText type="defaultSemiBold">Total: LKR {calculateTotal().toLocaleString()}</ThemedText>
                            <ThemedText style={{ fontSize: 12 }}>{startDate && endDate ? `${Math.ceil(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} nights` : 'Select dates'}</ThemedText>
                        </View>

                        <TouchableOpacity
                            style={[styles.bookButton, (!startDate || !endDate) && styles.disabledButton]}
                            onPress={handleBooking}
                            disabled={!startDate || !endDate || loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.bookButtonText}>Confirm</ThemedText>}
                        </TouchableOpacity>
                    </View>
                </ThemedView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    footer: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bookButton: {
        backgroundColor: '#FF385C',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    bookButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});
