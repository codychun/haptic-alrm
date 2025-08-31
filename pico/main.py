import bluetooth
from machine import Pin, RTC
import utime
from micropython import const
import struct

# BLE UUIDs - Using standard Bluetooth UUIDs
# You can replace these with custom UUIDs if needed
_ALARM_SERVICE_UUID = bluetooth.UUID(0x1800)  # Generic Access Service
_ALARM_CHAR_UUID = bluetooth.UUID(0x2A00)     # Device Name Characteristic
_TIME_CHAR_UUID = bluetooth.UUID(0x2A08)      # Date Time Characteristic
_COMMAND_CHAR_UUID = bluetooth.UUID(0x2A09)   # Day of Week Characteristic (repurposed)

# Alternative: Custom UUIDs (uncomment to use)
# _ALARM_SERVICE_UUID = bluetooth.UUID("550e8400-e29b-41d4-a716-446655440000")
# _ALARM_CHAR_UUID = bluetooth.UUID("550e8400-e29b-41d4-a716-446655440001")
# _TIME_CHAR_UUID = bluetooth.UUID("550e8400-e29b-41d4-a716-446655440002")
# _COMMAND_CHAR_UUID = bluetooth.UUID("550e8400-e29b-41d4-a716-446655440003")

# Command codes
CMD_SET_ALARM = const(0x01)
CMD_ARM = const(0x02)
CMD_DISARM = const(0x03)
CMD_SNOOZE = const(0x04)
CMD_STOP = const(0x05)
CMD_TEST = const(0x06)

# Hardware setup
motor1a = Pin(13, Pin.OUT)
motor1b = Pin(12, Pin.OUT)
led = Pin("LED", Pin.OUT)
rtc = RTC()

# Global state
alarm_hour = 8
alarm_minute = 0
alarm_armed = False
alarm_ringing = False
alarm_snoozed = False  # Track if alarm is in snooze mode
snooze_minutes = 5

def motor_on():
    motor1a.high()
    motor1b.low()
    print("Motor ON")

def motor_off():
    motor1a.low()
    motor1b.low()
    print("Motor OFF")

def get_datetime():
    datetime = rtc.datetime()
    return datetime[4], datetime[5]  # hours, minutes

def set_alarm_time(hour, minute):
    global alarm_hour, alarm_minute
    alarm_hour = hour
    alarm_minute = minute
    print(f"Alarm set to {hour:02d}:{minute:02d}")

def arm_alarm():
    global alarm_armed
    alarm_armed = True
    led.on()
    print("Alarm ARMED")

def disarm_alarm():
    global alarm_armed, alarm_ringing, alarm_snoozed
    alarm_armed = False
    alarm_ringing = False
    alarm_snoozed = False  # Reset snooze state when disarmed
    motor_off()
    led.off()
    print("Alarm DISARMED")

def snooze_alarm():
    global alarm_ringing, alarm_hour, alarm_minute, alarm_snoozed
    alarm_ringing = False
    motor_off()
    alarm_snoozed = True
    
    # Calculate snooze time (current time + snooze_minutes)
    hours, minutes = get_datetime()
    snooze_time = minutes + snooze_minutes
    
    # Handle hour rollover
    if snooze_time >= 60:
        alarm_hour = (hours + 1) % 24
        alarm_minute = snooze_time % 60
    else:
        alarm_hour = hours
        alarm_minute = snooze_time
    
    print(f"Alarm SNOOZED for {snooze_minutes} minutes - will ring at {alarm_hour:02d}:{alarm_minute:02d}")

def stop_alarm():
    global alarm_ringing, alarm_snoozed
    alarm_ringing = False
    alarm_snoozed = False  # Reset snooze state when stopped
    motor_off()
    print("Alarm STOPPED")

def test_alarm():
    global alarm_ringing
    alarm_ringing = True
    motor_on()
    print("TEST ALARM")

def check_alarm():
    global alarm_ringing
    if not alarm_armed:
        return
    
    hours, minutes = get_datetime()
    
    if hours == alarm_hour and minutes == alarm_minute and not alarm_ringing:
        alarm_ringing = True
        motor_on()
        print("ALARM TRIGGERED!")

def handle_ble_command(data):
    if len(data) < 1:
        return
    
    command = data[0]
    
    if command == CMD_SET_ALARM and len(data) == 3:
        hour, minute = data[1], data[2]
        set_alarm_time(hour, minute)
    elif command == CMD_ARM:
        arm_alarm()
    elif command == CMD_DISARM:
        disarm_alarm()
    elif command == CMD_SNOOZE:
        snooze_alarm()
    elif command == CMD_STOP:
        stop_alarm()
    elif command == CMD_TEST:
        test_alarm()
    else:
        print(f"Unknown command: {command}")
    
def ble_irq(event, data):
    if event == bluetooth.IRQ_CENTRAL_CONNECT:
        print("Connected")
    elif event == bluetooth.IRQ_CENTRAL_DISCONNECT:
        print("Disconnected")
    elif event == bluetooth.IRQ_GATTS_WRITE:
        handle_ble_command(data)

def start_ble():
    ble = bluetooth.BLE()
    ble.active(True)
    ble.irq(ble_irq)
    
    # Register services
    services = (
        (
            _ALARM_SERVICE_UUID,
            (
                (_ALARM_CHAR_UUID, bluetooth.FLAG_READ | bluetooth.FLAG_WRITE),
                (_TIME_CHAR_UUID, bluetooth.FLAG_READ),
                (_COMMAND_CHAR_UUID, bluetooth.FLAG_WRITE),
            ),
        ),
    )
    
    ((handle,),) = ble.gatts_register_services(services)
    
    # Set device name
    ble.gap_set_device_name("PicoBLE")
    
    # Start advertising
    adv_data = bytearray('\x02\x01\x06') + \
               bytearray((len("PicoBLE") + 1, 0x09)) + \
               bytearray("PicoBLE")
    
    ble.gap_advertise(100, adv_data)
    print("BLE advertising started")
    
    return ble

def main():
    print("Starting Pico BLE Alarm Clock...")
    
    # Initialize BLE
    ble = start_ble()
    
    # Main loop
    while True:
        check_alarm()
        utime.sleep(1)

if __name__ == "__main__":
    main()