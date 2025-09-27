const express = require("express");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

let lastData = null;   // ค่า sensor ล่าสุด
let lastUpdate = null; // เวลาอัปเดตล่าสุด

// ฟังก์ชันอ่าน sensor ผ่าน Python
function fetchSensor() {
  exec("python3 read_dht.py", (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Python error:", error);
      return;
    }
    try {
      const data = JSON.parse(stdout);
      if (data.error) {
        console.error("⚠️ Sensor error:", data.error);
      } else {
        lastData = data;
        lastUpdate = new Date();
        console.log(
          `✅ Updated: ${lastUpdate.toLocaleTimeString()} | 🌡 ${data.temperature} °C 💧 ${data.humidity} %`
        );
      }
    } catch (e) {
      console.error("❌ Parse error:", e, "Output:", stdout);
    }
  });
}

// เริ่มต้น fetch ครั้งแรก
fetchSensor();

// ตั้งเวลา fetch ใหม่ทุก 30 วินาที
setInterval(fetchSensor, 30 * 1000);

// Route หลัก
app.get("/", (req, res) => {
  if (lastData) {
    res.send(`
      <h1>DHT22 Sensor</h1>
      <p>🌡 Temperature: ${lastData.temperature.toFixed(1)} °C</p>
      <p>💧 Humidity: ${lastData.humidity.toFixed(1)} %</p>
      <p>⏱ Last update: ${lastUpdate.toLocaleString()}</p>
    `);
  } else {
    res.send("<p>❌ No sensor data available yet</p>");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://192.168.90.11:${PORT}`);
});