const express = require("express");
const { io } = require("socket.io-client");

const app = express();
const PORT = process.env.PORT || 5000;

/* ===============================
   STATE
================================ */
let liveRates = [];
let lastUpdate = null;
let socketStatus = "disconnected";

/* ===============================
   SOCKET.IO CLIENT (CORRECT)
================================ */
const SOCKET_URL = "https://starlinesupport.in";

const socket = io(SOCKET_URL, {
  path: "/socket.io/",
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 3000,
  reconnectionAttempts: Infinity,
  timeout: 20000,
});

/* ===============================
   SOCKET EVENTS
================================ */
socket.on("connect", () => {
  socketStatus = "connected";
  console.log("✅ Socket connected");

  socket.emit("room", "anjujewellery");
});

socket.on("disconnect", (reason) => {
  socketStatus = "disconnected";
  console.log("❌ Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
  socketStatus = "error";
  console.error("⚠️ Socket error:", err.message);
});

/* ===============================
   LIVE RATE DATA
================================ */
socket.on("Liverate", (data) => {
  if (Array.isArray(data)) {
    liveRates = data;
    lastUpdate = new Date().toISOString();
    console.log("📡 Rates updated:", data.length);
  }
});

/* ===============================
   HTTP ROUTES
================================ */
app.get("/", (req, res) => {
  res.send("Anju Live Socket Server OK");
});

app.get("/data", (req, res) => {
  res.json({
    status: "ok",
    socket: socketStatus,
    last_update: lastUpdate,
    data: liveRates,
  });
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/* ===============================
   SAFETY (Railway crash guard)
================================ */
process.on("unhandledRejection", (e) => console.error(e));
process.on("uncaughtException", (e) => console.error(e));
