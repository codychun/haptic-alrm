# Test script for Pico 2W motor and LED functionality
from machine import Pin
import utime

# Hardware setup
motor1a = Pin(13, Pin.OUT)
motor1b = Pin(12, Pin.OUT)
led = Pin("LED", Pin.OUT)

def motor_on():
    motor1a.high()
    motor1b.low()
    print("Motor ON")

def motor_off():
    motor1a.low()
    motor1b.low()
    print("Motor OFF")

def test_led():
    print("Testing LED...")
    led.on()
    utime.sleep(1)
    led.off()
    utime.sleep(1)
    print("LED test complete")

def test_motor():
    print("Testing motor...")
    motor_on()
    utime.sleep(2)
    motor_off()
    print("Motor test complete")

def main():
    print("Starting hardware tests...")
    
    # Test LED
    test_led()
    
    # Test motor
    test_motor()
    
    print("All tests complete!")

if __name__ == "__main__":
    main()
