#!/usr/bin/env python3
import Adafruit_DHT
import sys
import json

# กำหนด sensor type และ GPIO pin
SENSOR = Adafruit_DHT.DHT22
PIN = 4  # GPIO4

humidity, temperature = Adafruit_DHT.read_retry(SENSOR, PIN)

if humidity is not None and temperature is not None:
    data = {
        "temperature": round(temperature, 1),
        "humidity": round(humidity, 1)
    }
    print(json.dumps(data))
else:
    print(json.dumps({"error": "Failed to read sensor"}))