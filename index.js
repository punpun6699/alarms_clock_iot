const express = require("express");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

// ฟังก์ชันอ่านค่า DHT22 ผ่าน Python
async function readSensor() {
  return new Promise((resolve) => {
    exec("python3 read_dht.py", (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Python error:", error);
        return resolve(null);
      }
      try {
        const data = JSON.parse(stdout);
        if (data.error) {
          console.error("⚠️ Sensor error:", data.error);
          resolve(null);
        } else {
          resolve(data);
        }
      } catch (e) {
        console.error("❌ Parse error:", e, "Output:", stdout);
        resolve(null);
      }
    });
  });
}

// Route หลัก
app.get("/", async (req, res) => {
  const data = await readSensor();
  if (data) {
    res.send(`
      <h1>DHT22 Sensor</h1>
      <p>🌡 Temperature: ${data.temperature.toFixed(1)} °C</p>
      <p>💧 Humidity: ${data.humidity.toFixed(1)} %</p>
    `);
  } else {
    res.send("<p>❌ Error reading sensor</p>");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://192.168.90.11:${PORT}`);
});