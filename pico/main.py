from machine import Pin, RTC
import utime

motor1a = Pin(13, Pin.OUT)
motor1b = Pin(12, Pin.OUT)

led = Pin("LED", Pin.OUT)   # Indicator LED (on board)

rtc = RTC()                 # Real Time Clock

alarm_hr = 13               # App Input
alarm_min = 46

stop = False                # App Input

def motor_on():
    motor1a.high()
    motor1b.low()

def motor_off():
    motor1a.high()
    motor1b.high()
    
def get_datetime():
    datetime = rtc.datetime()
    year, month, day, weekday, hours, minutes, seconds, subseconds = datetime
    return hours, minutes
    
def alarm():
    led.off()
    hours, minutes = get_datetime()
    print(hours, minutes)
    while True:
        hours, minutes = get_datetime()
        if (hours == alarm_hr and minutes == alarm_min):
            # don't need else case -- will cycle to next day
            print("buzz")
            motor_on()
            led.on()
            return

alarm()
# if stop == True:
utime.sleep(5)
motor_off()
led.off()