// app/(tabs)/index.tsx - Example integration with your existing structure
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SimplePressable } from '../components/SimplePressable';
import { SimpleTimePickerButton } from '../components/TimePicker';
import { BleManager, Device } from 'react-native-ble-plx';

// AlarmApp.tsx - Main component\

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

  const handleTimeChange = (newTime: string) => {
    setAlarm(prev => ({ ...prev, time: newTime }));
    console.log('Time changed to:', newTime);
  };

  const toggleArm = () => {
    setAlarm(prev => ({ ...prev, isArmed: !prev.isArmed }));
    console.log('Alarm armed:', !alarm.isArmed);
    // Here you would send BLE signal to microcontroller
  };

  const handleSnooze = () => {
    setAlarm(prev => ({ ...prev, isRinging: false }));
    console.log('Alarm snoozed');
    // Here you would send BLE snooze signal
    Alert.alert('Snoozed', 'Alarm will ring again in 5 minutes');
  };

  const handleStop = () => {
    setAlarm(prev => ({ ...prev, isRinging: false, isArmed: false }));
    console.log('Alarm stopped');
    // Here you would send BLE stop signal
  };

  const testAlarm = () => {
    setAlarm(prev => ({ ...prev, isRinging: !prev.isRinging }));
    console.log('Test alarm:', !alarm.isRinging);
    // Here you would send BLE test signal
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Haptic Alarm</Text>
      
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
        <SimplePressable onPress={testAlarm} style={[styles.button, styles.testButton]}>
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