const express = require("express");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

let lastData = null;
let lastUpdate = null;

function fetchSensor() {
  exec("python3 read_dht.py", (error, stdout) => {
    if (error) return console.error("Python error:", error);
    try {
      const data = JSON.parse(stdout);
      if (!data.error) {
        lastData = data;
        lastUpdate = new Date();
        console.log(
          `✅ ${lastUpdate.toLocaleTimeString()} | 🌡 ${data.temperature} °C 💧 ${data.humidity} %`
        );
      } else console.error("Sensor error:", data.error);
    } catch (e) {
      console.error("Parse error:", e, "Output:", stdout);
    }
  });
}

// เริ่มอ่าน sensor และอัปเดตทุก 30 วินาที
fetchSensor();
setInterval(fetchSensor, 30 * 1000);

// Route JSON API
app.get("/api", (req, res) => {
  if (lastData) {
    res.json({
      temperature: lastData.temperature.toFixed(1),
      humidity: lastData.humidity.toFixed(1),
      updated: lastUpdate.toLocaleString(),
    });
  } else {
    res.json({ error: "No data yet" });
  }
});

// Route หน้าเว็บ
app.get("/", (req, res) => {
  res.send(`
    <h1>DHT22 Sensor</h1>
    <div>
      🌡 Temperature: <span id="temp">--</span> °C<br>
      💧 Humidity: <span id="hum">--</span> %<br>
      ⏱ Last update: <span id="time">--</span>
    </div>

    <script>
      async function updateData() {
        try {
          const res = await fetch('/api');
          const data = await res.json();
          if (!data.error) {
            document.getElementById('temp').textContent = data.temperature;
            document.getElementById('hum').textContent = data.humidity;
            document.getElementById('time').textContent = data.updated;
          }
        } catch(e) {
          console.error("Fetch error:", e);
        }
      }

      // อัปเดตครั้งแรก
      updateData();
      // อัปเดตทุก 30 วินาที
      setInterval(updateData, 30 * 1000);
    </script>
  `);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://192.168.90.11:${PORT}`);
});