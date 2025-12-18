const express = require("express");
const http = require("http");
const { Server } = require("socket.io-client");

const app = express();
const PORT = process.env.PORT || 5000;

/* ===============================
   GLOBAL STATE
================================ */
let liveRates = [];
let lastUpdate = null;
let socketConnected = false;

/* ===============================
   SOCKET.IO CLIENT
================================ */
const SOCKET_URL = "wss://starlinesupport.in";

const socket = Server(SOCKET_URL, {
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
  socketConnected = true;
  console.log("✅ Socket connected");

  // join anju jewellery room
  socket.emit("room", "anjujewellery");
});

socket.on("disconnect", (reason) => {
  socketConnected = false;
  console.log("❌ Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
  socketConnected = false;
  console.error("⚠️ Socket connect error:", err.message);
});

/* ===============================
   LIVE RATE HANDLER
================================ */
socket.on("Liverate", (payload) => {
  try {
    if (Array.isArray(payload)) {
      liveRates = payload;
      lastUpdate = new Date().toISOString();
      console.log("📡 Live rate updated:", payload.length);
    }
  } catch (e) {
    console.error("Rate parse error:", e.message);
  }
});

/* ===============================
   SAFETY NETS (IMPORTANT)
================================ */
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

/* ===============================
   HTTP ROUTES
================================ */

// Health check (Railway needs this)
app.get("/", (req, res) => {
  res.send("Anju Live Server OK");
});

// API for frontend (fetch.php replacement)
app.get("/data", (req, res) => {
  res.json({
    status: "ok",
    socket: socketConnected ? "connected" : "disconnected",
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
