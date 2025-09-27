const express = require("express");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

let lastData = null;
let lastUpdate = null;

// ฟังก์ชันอ่าน sensor ผ่าน Python
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

// API สำหรับ client
app.get("/api", (req, res) => {
  if (lastData) {
    res.json({
      temperature: lastData.temperature.toFixed(1),
      humidity: lastData.humidity.toFixed(1),
      updated: lastUpdate.toISOString(),
    });
  } else {
    res.json({ error: "No data yet" });
  }
});

// หน้าเว็บ
app.get("/", (req, res) => {
  res.send(`
    <h1>DHT22 Sensor Dashboard</h1>
    <div style="font-family: monospace; font-size: 1.2em;">
      🌡 Temperature: <span id="temp">--</span> °C<br>
      💧 Humidity: <span id="hum">--</span> %<br>
      ⏱ Last update: <span id="time">--</span><br>
      🕒 Current time: <span id="clock">--:--:--</span>
    </div>

    <script>
      let lastUpdate = null;

      async function fetchData() {
        try {
          const res = await fetch('/api');
          const data = await res.json();
          if (!data.error) {
            document.getElementById('temp').textContent = data.temperature;
            document.getElementById('hum').textContent = data.humidity;
            lastUpdate = new Date(data.updated);
            document.getElementById('time').textContent = lastUpdate.toLocaleString();
          }
        } catch(e) {
          console.error("Fetch error:", e);
        }
      }

      function updateClock() {
        const now = new Date();
        document.getElementById('clock').textContent = now.toLocaleTimeString();
      }

      // fetch sensor ทุก 30 วินาที
      fetchData();
      setInterval(fetchData, 30 * 1000);

      // อัปเดตนาฬิกา real-time ต่อวินาที
      updateClock();
      setInterval(updateClock, 1000);
    </script>
  `);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(\`🚀 Server running at http://192.168.90.11:${PORT}\`);
});