// BLE Manager - handles conditional imports for different platforms
import { Platform } from 'react-native';

export interface BLEManager {
  startDeviceScan: (serviceUUIDs: string[] | null, options: any, callback: (error: any, device: any) => void) => void;
  stopDeviceScan: () => void;
  destroy: () => void;
}

export interface Device {
  connect: () => Promise<Device>;
  discoverAllServicesAndCharacteristics: () => Promise<Device>;
  writeCharacteristicWithResponseForService: (serviceUUID: string, characteristicUUID: string, data: string) => Promise<any>;
  cancelConnection: () => void;
  name?: string;
}

let BleManagerClass: any = null;
let DeviceClass: any = null;

// Check if we're in Expo Go
const isExpoGo = (global as any).__EXPO_GO__;
const isWeb = Platform.OS === 'web';

// Only try to import BLE if not in Expo Go and not on web
if (!isExpoGo && !isWeb) {
  try {
    const bleModule = require('react-native-ble-plx');
    BleManagerClass = bleModule.BleManager;
    DeviceClass = bleModule.Device;
  } catch (error) {
    console.warn('BLE module not available:', error);
  }
}

// Create a safe BLE manager factory
export function createBLEManager(): BLEManager | null {
  if (!BleManagerClass) {
    console.log(`BLE not available on ${isExpoGo ? 'Expo Go' : isWeb ? 'web' : 'this platform'}`);
    return null;
  }
  
  return new BleManagerClass();
}

export function isBLEAvailable(): boolean {
  return BleManagerClass !== null;
}

export function getPlatformInfo(): string {
  if (isExpoGo) return 'Expo Go';
  if (isWeb) return 'Web';
  return 'Native';
}
