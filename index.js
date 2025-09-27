const express = require("express");

// ตรวจสอบ sensor จริงหรือ fallback mock
let dht;
try {
  dht = require("node-dht-sensor").promises;
  console.log("✅ Using real DHT22 sensor v2.00 (not supported on Pi 5, will fail)");
} catch (err) {
  console.log("⚠️ Using mock sensor (no GPIO detected or Pi 5)");
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

// ฟังก์ชันอ่าน sensor (mock หรือจริง)
async function readSensor() {
  try {
    const data = await dht.read(); // ใช้ mock สำหรับ Pi 5
    return data;
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