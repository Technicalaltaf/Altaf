// ================= IMPORTS =================
const express = require("express");
const http = require("http");
const { io } = require("socket.io-client");

// ================= CONFIG =================
const PORT = process.env.PORT || 3000;
const SOCKET_URL = "https://starlinesupport.in:10001";

// ================= APP =================
const app = express();
const server = http.createServer(app);

// ================= CACHE =================
let cache = {
  status: "loading",
  socket: "connecting",
  last_update: null,
  data: []
};

// ================= SOCKET CLIENT =================
const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  path: "/socket.io/",
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 3000,
  timeout: 20000,
  extraHeaders: {
    Origin: "http://anjujewellery.in"
  }
});

// ================= SOCKET EVENTS =================
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
  cache.socket = "connected";

  // join room (IMPORTANT)
  socket.emit("room", "anjujewellery");
});

socket.on("disconnect", reason => {
  console.log("❌ Socket disconnected:", reason);
  cache.socket = "disconnected";
});

socket.on("connect_error", err => {
  console.error("⚠️ Socket error:", err.message);
  cache.socket = "error";
});

// ================= LIVE RATE HANDLER =================
socket.on("Liverate", payload => {
  try {
    if (!Array.isArray(payload)) return;

    cache = {
      status: "ok",
      socket: "connected",
      last_update: new Date().toISOString(),
      data: payload
    };

    console.log("📈 Live rate updated", payload.length);
  } catch (e) {
    console.error("Parse error:", e.message);
  }
});

// ================= API ROUTES =================
app.get("/", (req, res) => {
  res.send("Bullion Live Socket Server OK");
});

app.get("/data", (req, res) => {
  res.json(cache);
});

// ================= START SERVER =================
server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
});
  
