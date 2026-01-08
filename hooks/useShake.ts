import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

export function useShake(onShake: () => void, threshold = 2.5) {
    const [subscription, setSubscription] = useState<any>(null);
    const lastShakeTime = useRef<number>(0);
    const SHAKE_DEBOUNCE_MS = 1000; // Prevent multiple triggers within 1 second

    useEffect(() => {
        _subscribe();
        return () => _unsubscribe();
    }, []);

    const _subscribe = () => {
        setSubscription(
            Accelerometer.addListener(accelerometerData => {
                const { x, y, z } = accelerometerData;
                const totalForce = Math.sqrt(x * x + y * y + z * z);

                const now = Date.now();
                if (totalForce > threshold && (now - lastShakeTime.current) > SHAKE_DEBOUNCE_MS) {
                    lastShakeTime.current = now;
                    onShake();
                }
            })
        );
        Accelerometer.setUpdateInterval(100); // 100ms
    };

    const _unsubscribe = () => {
        subscription && subscription.remove();
        setSubscription(null);
    };
}
