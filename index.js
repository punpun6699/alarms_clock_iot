const express = require("express");
let dht;

try {
  dht = require("node-dht-sensor").promises;
  console.log("✅ Using real DHT22 sensor v2.00");
} catch (err) {
  console.log("⚠️  Using mock sensor (no GPIO detected)");
  dht = {
    async read() {
      return {
        temperature: (20 + Math.random() * 5).toFixed(1),
        humidity: (40 + Math.random() * 10).toFixed(1)
      };
    }
  };
}

const app = express();
const PORT = 3000;

async function readSensor() {
  try {
    if (dht.read) {
      const res = await dht.read({ sensor: 22, pin: 4 });
      return {
        temperature: res.temperature.toFixed(1),
        humidity: res.humidity.toFixed(1)
      };
    }
    return await dht.read();
  } catch (err) {
    console.error("Sensor read error:", err);
    return null;
  }
}

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
  console.log(`🚀 Server running at http://192.168.90.11:${PORT}`);
});