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
const sensor = require("node-dht-sensor");

sensor.read(22, 4, function(err, temperature, humidity) {
  if (!err) {
    console.log(`Temp: ${temperature}°C, Humidity: ${humidity}%`);
  } else {
    console.error("Sensor read error:", err);
  }
});
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