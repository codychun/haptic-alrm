# BLE Haptic Alarm Clock

A Bluetooth Low Energy (BLE) alarm clock system consisting of a React Native mobile app and a Raspberry Pi Pico 2W with vibration motor.

## Features
- **Mobile App**: Set alarm times, arm/disarm alarms, snooze functionality
- **BLE Communication**: Wireless control between mobile app and Pico W
- **Haptic Feedback**: Vibration motor for silent alarm
- **Real-time Status**: Connection status and alarm state indicators
- **Test Mode**: Test the vibration motor without waiting for alarm time

### Pico W Setup
- Raspberry Pi Pico 2W
- Vibration motor (DC motor with eccentric weight)
- Motor driver (DRV8833 or similar H-bridge)
- Breadboard and jumper wires or solder
- Power supply

### Mobile Device
- Android or iOS device with Bluetooth 4.0+
- React Native development environment

### 1. Pico 2W Setup

1. **Flash MicroPython** to your Pico W
2. **Connect hardware** according to `pico/HARDWARE_SETUP.md`
3. **Upload `pico/main.py`** to your Pico W
4. **Power on** the Pico W - it will start advertising as "PicoBLE"

### 2. Mobile App Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on device**:
   ```bash
   npx expo start
   ```

## Usage

### Mobile App
1. **Launch the app** - it will automatically scan for the Pico W
2. **Set alarm time** using the time picker
3. **Arm the alarm** by pressing the ARM button
4. **Test the motor** using the TEST ALARM button
5. **When alarm rings**: Use SNOOZE or STOP buttons

### Pico W
- **LED indicator**: On when alarm is armed
- **Motor control**: Vibrates when alarm triggers
- **BLE server**: Accepts commands from mobile app

## BLE Protocol

### Service UUID: `1800`
- **Alarm Characteristic** (`2A00`): Read/Write alarm settings
- **Time Characteristic** (`2A08`): Read current time
- **Command Characteristic** (`2A09`): Write commands

### Commands
- `0x01`: Set alarm time (followed by hour, minute)
- `0x02`: Arm alarm
- `0x03`: Disarm alarm
- `0x04`: Snooze alarm
- `0x05`: Stop alarm
- `0x06`: Test alarm

## Development

### Adding Features
- **New commands**: Add command codes to both Pico W and mobile app
- **Additional sensors**: Extend the BLE service with new characteristics
- **Multiple alarms**: Modify the data structure to support multiple alarm times

### Troubleshooting

#### Connection Issues
- Ensure Bluetooth is enabled on mobile device
- Check that Pico W is powered and in range
- Verify the device name is "PicoBLE"
- Restart the mobile app if connection fails

#### Motor Issues
- Check wiring connections
- Verify motor driver connections
- Ensure adequate power supply
- Test with direct 3.3V connection first

#### BLE Issues
- Check MicroPython BLE implementation
- Verify UUIDs match between app and Pico W
- Monitor serial output from Pico W for debugging