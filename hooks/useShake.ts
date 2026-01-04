import { Accelerometer } from 'expo-sensors';
import { useEffect, useState } from 'react';

export function useShake(onShake: () => void, threshold = 1.78) {
    const [subscription, setSubscription] = useState<any>(null);

    useEffect(() => {
        _subscribe();
        return () => _unsubscribe();
    }, []);

    const _subscribe = () => {
        setSubscription(
            Accelerometer.addListener(accelerometerData => {
                const { x, y, z } = accelerometerData;
                const totalForce = Math.sqrt(x * x + y * y + z * z);

                if (totalForce > threshold) {
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
