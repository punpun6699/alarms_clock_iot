const express = require("express");
let dht;

try {
  // Try to load the real sensor (works on Raspberry Pi)
  dht = require("node-dht-sensor").promises;
  console.log("✅ Using real DHT22 sensor");
} catch (err) {
  // Fallback for Mac (no GPIO)
  console.log("⚠️  Using mock sensor (no GPIO detected)");
  dht = {
    async read() {
      return {
        temperature: (20 + Math.random() * 5).toFixed(1), // fake 20–25 °C
        humidity: (40 + Math.random() * 10).toFixed(1)    // fake 40–50 %
      };
    }
  };
}

const app = express();
const PORT = 3000;

// Wrapper for reading sensor
async function readSensor() {
  try {
    // On Pi: (22 = DHT22, GPIO4)
    if (dht.read.length === 2) {
      const res = await dht.read(22, 4);
      return {
        temperature: res.temperature.toFixed(1),
        humidity: res.humidity.toFixed(1)
      };
    }
    // On Mac (mock)
    return await dht.read();
  } catch (err) {
    console.error("Sensor read error:", err);
    return null;
  }
}

// Web route
app.get("/", async (req, res) => {
  const data = await readSensor();
  if (data) {
    res.send(`
      <h1>DHT22 Sensor</h1>
      <p>🌡 Temperature: ${data.temperature} °C</p>
      <p>💧 Humidity: ${data.humidity} %</p>
    `);
  } else {
    res.send("<p>❌ Error reading sensor</p>");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});