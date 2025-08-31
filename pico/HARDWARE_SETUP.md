# Hardware Setup Guide

## Components Needed
- Raspberry Pi Pico 2W
- 2x Vibration Motor (DC motor with eccentric weight)
- Motor Driver (DRV8833 or similar H-bridge)
- Breadboard and jumper wires or solder + wires
- Power supply (USB or external 5V)

## Wiring Diagram

### Motor Driver Connection (DRV8833)
```
Pico 2W GP15 → DRV88833 IN1
Pico 2W GP14 → DRV88833 IN2
Pico 2W GP13 → DRV88833 IN3
Pico 2W GP12 → DRV88833 IN4
Pico 2W VBUS → DRV88833 VCC
Pico 2W GND → DRV88833 GND (Pin 8)
External 5V → DRV88833 VCC2 (Pin 1) - for motor power
```

### Motor Connection
```
DRV88833 OUT1 → MotorB Terminal 1
DRV88833 OUT2 → MotorB Terminal 2
DRV88833 OUT3 → MotorA Terminal 1
DRV88833 OUT4 → MotorA Terminal 2
```

## Pin Functions
- **GP15**: Motor control A
- **GP14**: Motor control A
- **GP13**: Motor control B
- **GP12**: Motor control B
- **Built-in LED**: Status indicator

## Power Considerations
- The Pico W can provide limited current through GPIO pins
- For stronger vibration, use an external motor driver with separate power supply
- Ensure the motor voltage matches your power supply (typically 3.3V or 5V)

## Testing
1. Upload the `main.py` file to your Pico W
2. The built-in LED should turn on when the alarm is armed
3. Use the mobile app to test the motor functionality
4. The motor should vibrate when the alarm triggers or during test mode

## Troubleshooting
- If the motor doesn't vibrate, check the wiring connections
- Ensure the motor is properly secured to prevent damage
- For stronger vibration, consider using a larger motor or adding weights
- Check that the Pico W is powered via USB or external power supply
