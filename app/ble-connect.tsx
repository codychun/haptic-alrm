import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

const bleManager = new BleManager();

export default function AlarmScreen() {
    const [device, setDevice] = useState<Device | null>(null);

    useEffect(() => {
        const connectToPico = async () => {
            bleManager.startDeviceScan(null, null, async (error, scannedDevice) => {
                if (error) {
                    console.error(error);
                    return;
                }

                if (scannedDevice?.name === 'PicoBLE') {

                    console.log('Pico found, connecting...');
                    bleManager.stopDeviceScan();

                    try {
                        const connectedDevice = await scannedDevice.connect();
                        await connectedDevice.discoverAllServicesAndCharacteristics();
                        setDevice(connectedDevice);
                        console.log('Connected to Pico!');
                    } catch (err) {
                        console.error('Connection error:', err);
                    }
                }
            });
        };

        connectToPico();

        // Cleanup on unmount
        return () => {
        bleManager.destroy();
        };
    }, []);

    return (
        <View>
            <Text>Alarm Screen</Text>
            {device ? <Text>Connected to Pico!</Text> : <Text>Scanning for Pico...</Text>}
        </View>
    );
}