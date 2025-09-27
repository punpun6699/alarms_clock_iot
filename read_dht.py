import time
import adafruit_dht
import board
import json
import sys

# สร้าง object DHT22 (GPIO4 = Pin7)
dht = adafruit_dht.DHT22(board.D4)

try:
    temp = dht.temperature
    humidity = dht.humidity
    data = {"temperature": temp, "humidity": humidity}
    print(json.dumps(data))
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)