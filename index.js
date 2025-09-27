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
      let lastUpdate = null; // เวลาล่าสุดจาก server

      async function fetchData() {
        try {
          const res = await fetch('/api');
          const data = await res.json();
          if (!data.error) {
            document.getElementById('temp').textContent = data.temperature;
            document.getElementById('hum').textContent = data.humidity;
            lastUpdate = new Date(data.updated);
          }
        } catch(e) {
          console.error("Fetch error:", e);
        }
      }

      function updateTime() {
        if (lastUpdate) {
          const now = new Date();
          const diff = Math.floor((now - lastUpdate) / 1000); // วินาทีที่ผ่านไป
          const displayTime = new Date(lastUpdate.getTime() + diff * 1000);
          document.getElementById('time').textContent = displayTime.toLocaleString();
        }
      }

      // เรียก fetch ข้อมูลทุก 30 วินาที
      fetchData();
      setInterval(fetchData, 30 * 1000);

      // อัปเดตเวลาในหน้าเว็บต่อวินาที
      setInterval(updateTime, 1000);
    </script>
  `);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://192.168.90.11:${PORT}`);
});