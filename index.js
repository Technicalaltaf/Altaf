const express = require("express");
const io = require("socket.io-client");

const app = express();
const PORT = process.env.PORT || 5000;

/* ================= SOCKET CONFIG ================= */
const SOCKET_URL = "https://starlinesupport.in:10001";

let liveData = null;
let lastUpdate = null;
let socketStatus = "disconnected";

/* ================= CONNECT SOCKET ================= */
function connectSocket() {
  console.log("🔌 Connecting to socket...");

  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 3000,
    timeout: 20000,
    extraHeaders: {
      Origin: "http://anjujewellery.in",
      Referer: "http://anjujewellery.in",
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/114 Mobile Safari/537.36"
    }
  });

  socket.on("connect", () => {
    socketStatus = "connected";
    console.log("✅ Socket connected:", socket.id);

    // EXACT browser flow
    socket.emit("Client", "anjujewellery");
    socket.emit("room", "anjujewellery");
  });

  socket.on("disconnect", () => {
    socketStatus = "disconnected";
    console.log("⚠️ Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    socketStatus = "error";
    console.log("❌ Socket error:", err.message);
  });

  socket.on("Liverate", (data) => {
    liveData = data;
    lastUpdate = new Date().toISOString();
    console.log("📈 Live rate updated", lastUpdate);
  });
}

connectSocket();

/* ================= API ROUTES ================= */
app.get("/", (req, res) => {
  res.send("Bullion Socket Server OK");
});

app.get("/data", (req, res) => {
  if (!liveData) {
    return res.json({
      status: "loading",
      socket: socketStatus
    });
  }

  res.json({
    status: "ok",
    socket: socketStatus,
    last_update: lastUpdate,
    data: liveData
  });
});

/* ================= START SERVER ================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
});
