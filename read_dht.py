import adafruit_dht
import board

dht = adafruit_dht.DHT22(board.D4)  # ถ้าใช้ GPIO4
try:
    temperature = dht.temperature
    humidity = dht.humidity
    print(f"Temp: {temperature:.1f} °C, Humidity: {humidity:.1f}%")
except Exception as e:
    print("Failed to read sensor:", e)