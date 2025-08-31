// app/(tabs)/index.tsx - Example integration with your existing structure
import React, { useEffect, useState } from 'react';
import { Alert, PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { SimplePressable } from '../components/SimplePressable';
import { SimpleTimePickerButton } from '../components/TimePicker';

// BLE Command codes (must match Pico W)
const CMD_SET_ALARM = 0x01;
const CMD_ARM = 0x02;
const CMD_DISARM = 0x03;
const CMD_SNOOZE = 0x04;
const CMD_STOP = 0x05;
const CMD_TEST = 0x06;

// BLE UUIDs (must match Pico W)
// Using standard Bluetooth UUIDs for better compatibility
const ALARM_SERVICE_UUID = '1800';  // Generic Access Service
const ALARM_CHAR_UUID = '2A00';     // Device Name Characteristic
const TIME_CHAR_UUID = '2A08';      // Date Time Characteristic
const COMMAND_CHAR_UUID = '2A09';   // Day of Week Characteristic (repurposed)

// Alternative: Custom UUIDs (uncomment to use)
// const ALARM_SERVICE_UUID = '550e8400-e29b-41d4-a716-446655440000';
// const ALARM_CHAR_UUID = '550e8400-e29b-41d4-a716-446655440001';
// const TIME_CHAR_UUID = '550e8400-e29b-41d4-a716-446655440002';
// const COMMAND_CHAR_UUID = '550e8400-e29b-41d4-a716-446655440003';

const bleManager = new BleManager();

interface AlarmState {
  time: string;
  isArmed: boolean;
  isRinging: boolean;
}

export default function AlarmApp() {
  const [alarm, setAlarm] = useState<AlarmState>({
    time: '08:00',
    isArmed: false,
    isRinging: false,
  });

  const [device, setDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Request BLE permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Bluetooth Permission',
          message: 'This app needs Bluetooth permission to connect to your alarm clock.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  // Send command to Pico W
  const sendCommand = async (command: number, data?: number[]) => {
    if (!device) {
      console.log('No device connected');
      return;
    }

    try {
      const commandData = [command, ...(data || [])];
      const buffer = Buffer.from(commandData);
      
      await device.writeCharacteristicWithResponseForService(
        ALARM_SERVICE_UUID,
        COMMAND_CHAR_UUID,
        buffer.toString('base64')
      );
      
      console.log(`Command sent: ${command}`);
    } catch (error) {
      console.error('Error sending command:', error);
    }
  };

  // Connect to Pico W
  const connectToPico = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Bluetooth permission is required to connect to the alarm clock.');
      return;
    }

    setIsScanning(true);
    console.log('Scanning for Pico W...');

    bleManager.startDeviceScan(null, null, async (error, scannedDevice) => {
      if (error) {
        console.error('Scan error:', error);
        setIsScanning(false);
        return;
      }

      if (scannedDevice?.name === 'PicoBLE') {
        console.log('Pico W found, connecting...');
        bleManager.stopDeviceScan();
        setIsScanning(false);

        try {
          const connectedDevice = await scannedDevice.connect();
          await connectedDevice.discoverAllServicesAndCharacteristics();
          setDevice(connectedDevice);
          setIsConnected(true);
          console.log('Connected to Pico W!');
          
          // Set initial alarm time
          const [hours, minutes] = alarm.time.split(':').map(Number);
          await sendCommand(CMD_SET_ALARM, [hours, minutes]);
        } catch (err) {
          console.error('Connection error:', err);
          Alert.alert('Connection Failed', 'Could not connect to the alarm clock. Please try again.');
        }
      }
    });

    // Stop scanning after 10 seconds
    setTimeout(() => {
      if (isScanning) {
        bleManager.stopDeviceScan();
        setIsScanning(false);
        if (!isConnected) {
          Alert.alert('Device Not Found', 'Could not find Pico W. Make sure it is powered on and in range.');
        }
      }
    }, 10000);
  };

  useEffect(() => {
    connectToPico();

    // Cleanup on unmount
    return () => {
      bleManager.destroy();
    };
  }, []);

  const handleTimeChange = async (newTime: string) => {
    setAlarm(prev => ({ ...prev, time: newTime }));
    
    if (isConnected) {
      const [hours, minutes] = newTime.split(':').map(Number);
      await sendCommand(CMD_SET_ALARM, [hours, minutes]);
    }
    
    console.log('Time changed to:', newTime);
  };

  const toggleArm = async () => {
    const newArmedState = !alarm.isArmed;
    setAlarm(prev => ({ ...prev, isArmed: newArmedState }));
    
    if (isConnected) {
      await sendCommand(newArmedState ? CMD_ARM : CMD_DISARM);
    }
    
    console.log('Alarm armed:', newArmedState);
  };

  const handleSnooze = async () => {
    setAlarm(prev => ({ ...prev, isRinging: false }));
    
    if (isConnected) {
      await sendCommand(CMD_SNOOZE);
    }
    
    console.log('Alarm snoozed');
    Alert.alert('Snoozed', 'Alarm will ring again in 5 minutes');
  };

  const handleStop = async () => {
    setAlarm(prev => ({ ...prev, isRinging: false, isArmed: false }));
    
    if (isConnected) {
      await sendCommand(CMD_STOP);
    }
    
    console.log('Alarm stopped');
  };

  const testAlarm = async () => {
    const newRingingState = !alarm.isRinging;
    setAlarm(prev => ({ ...prev, isRinging: newRingingState }));
    
    if (isConnected) {
      await sendCommand(CMD_TEST);
    }
    
    console.log('Test alarm:', newRingingState);
  };

  const reconnect = () => {
    if (device) {
      device.cancelConnection();
    }
    setDevice(null);
    setIsConnected(false);
    connectToPico();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Haptic Alarm</Text>
      
      {/* Connection Status */}
      <View style={styles.section}>
        <View style={[styles.statusIndicator, { backgroundColor: isConnected ? '#44ff44' : '#ff4444' }]}>
          <Text style={styles.statusText}>
            {isConnected ? 'CONNECTED' : isScanning ? 'SCANNING...' : 'DISCONNECTED'}
          </Text>
        </View>
        {!isConnected && (
          <SimplePressable onPress={reconnect} style={[styles.button, styles.reconnectButton]}>
            <Text style={styles.buttonText}>RECONNECT</Text>
          </SimplePressable>
        )}
      </View>
      
      {/* Time Setting */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Set Time</Text>
        <SimpleTimePickerButton
          time={alarm.time}
          onTimeChange={handleTimeChange}
          style={styles.timeButton}
        />
      </View>

      {/* Arm/Disarm */}
      <View style={styles.section}>
        <SimplePressable
          onPress={toggleArm}
          style={[
            styles.button,
            { backgroundColor: alarm.isArmed ? '#ff4444' : '#44ff44' }
          ]}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>
            {alarm.isArmed ? 'DISARM' : 'ARM'}
          </Text>
        </SimplePressable>
      </View>

      {/* Status */}
      <View style={styles.section}>
        <Text style={styles.status}>
          Status: {alarm.isArmed ? 'ARMED' : 'DISABLED'} at {alarm.time}
        </Text>
        {alarm.isRinging && (
          <Text style={styles.ringing}> ALARM RINGING! </Text>
        )}
      </View>

      {/* Alarm Controls */}
      {alarm.isRinging && (
        <View style={styles.section}>
          <SimplePressable onPress={handleSnooze} style={[styles.button, styles.snoozeButton]}>
            <Text style={styles.buttonText}>SNOOZE</Text>
          </SimplePressable>
          
          <SimplePressable onPress={handleStop} style={[styles.button, styles.stopButton]}>
            <Text style={styles.buttonText}>STOP</Text>
          </SimplePressable>
        </View>
      )}

      {/* Test Button */}
      <View style={styles.section}>
        <SimplePressable 
          onPress={testAlarm} 
          style={[styles.button, styles.testButton]}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>
            {alarm.isRinging ? 'STOP TEST' : 'TEST ALARM'}
          </Text>
        </SimplePressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  statusIndicator: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  reconnectButton: {
    backgroundColor: '#007AFF',
  },
  timeButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  snoozeButton: {
    backgroundColor: '#ffa500',
  },
  stopButton: {
    backgroundColor: '#ff4444',
  },
  testButton: {
    backgroundColor: '#666',
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  ringing: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ff0000',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ffe0e0',
    borderRadius: 8,
  },
});