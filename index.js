/**
 * OPTION B – SOCKET LISTENER SERVER
 * Stable for Railway
 */

const express = require("express");
const http = require("http");
const { io } = require("socket.io-client");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

/* ================= CONFIG ================= */

// Anju Jewellery socket endpoint
const SOCKET_URL = "https://starlinesupport.in";

// IMPORTANT: same namespace jo Anju use karta hai
const SOCKET_PATH = "/socket.io";

/* ================= STATE ================= */

let cache = {
  status: "loading",
  socket: "disconnected",
  last_update: null,
  data: []
};

/* ================= SOCKET CLIENT ================= */

console.log("Connecting to socket...");

const socket = io(SOCKET_URL, {
  path: SOCKET_PATH,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
  cache.socket = "connected";
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
  cache.socket = "disconnected";
});

/**
 * MAIN LIVE RATE EVENT
 * यही असली data है
 */
socket.on("Liverate", (payload) => {
  try {
    // Payload format: ["Liverate", [ {...}, {...} ]]
    const rates = Array.isArray(payload) ? payload[1] : payload;

    if (Array.isArray(rates)) {
      cache.status = "ok";
      cache.data = rates;
      cache.last_update = new Date().toISOString();

      console.log("Live rate updated:", rates.length);
    }
  } catch (e) {
    console.error("Liverate parse error:", e.message);
  }
});

/**
 * Ignore other noisy events safely
 */
socket.onAny((event, data) => {
  if (event !== "Liverate") return;
});

/* ================= HTTP API ================= */

app.get("/", (req, res) => {
  res.send("Live bullion server running");
});

app.get("/data", (req, res) => {
  res.json(cache);
});

/* ================= START ================= */

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
