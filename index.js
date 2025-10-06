const express = require("express");
const { exec } = require("child_process");
const os = require("os");

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
        // console.log(
        //   `✅ ${lastUpdate.toLocaleTimeString()} | 🌡 ${data.temperature} °C 💧 ${data.humidity} %`
        // );
      } else console.error("Sensor error:", data.error);
    } catch (e) {
      console.error("Parse error:", e, "Output:", stdout);
    }
  });
}

// เริ่มอ่าน sensor และอัปเดตทุก 30 วินาที
fetchSensor();
setInterval(fetchSensor, 30 * 1000);

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

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
   <!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>DHT22 Sensor Dashboard</title>
  <style>
    body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: monospace;
      background-color: #f4f4f4;
      color: #333;
    }

    h1 {
      text-align: center;
      margin-bottom: 20px;
    }

    .dashboard {
      background: white;
      padding: 20px 40px;
      border-radius: 12px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      font-size: 1.2em;
      line-height: 1.6;
      text-align: center;
    }
  </style>
</head>
<body>

  <h1>DHT22 Sensor Dashboard</h1>
  <div class="dashboard">
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
      } catch (e) {
        console.error("Fetch error:", e);
      }
    }

    function updateClock() {
      const now = new Date();
      document.getElementById('clock').textContent = now.toLocaleTimeString();
    }

    fetchData();
    setInterval(fetchData, 30 * 1000);
    updateClock();
    setInterval(updateClock, 1000);
  </script>

</body>
</html>
  `);
});

app.listen(PORT, "0.0.0.0", () => {
  const ip = getLocalIP();
  console.log(`🚀 Server running at http://${ip}:${PORT}`);
});