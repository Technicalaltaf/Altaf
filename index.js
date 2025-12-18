const express = require("express");
const http = require("http");
const { io } = require("socket.io-client");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const SOCKET_URL = "https://starlinesupport.in";
const SOCKET_PATH = "/socket.io";

let cache = {
  status: "loading",
  socket: "disconnected",
  last_update: null,
  data: []
};

const socket = io(SOCKET_URL, {
  path: SOCKET_PATH,
  transports: ["websocket"],
  reconnection: true
});

socket.on("connect", () => {
  console.log("Socket connected", socket.id);
  cache.socket = "connected";

  // 🔥 THIS IS THE KEY LINE (Anju room)
  socket.emit("room", "anjujewellery");
});

socket.on("disconnect", () => {
  cache.socket = "disconnected";
});

socket.on("Liverate", (payload) => {
  try {
    const rates = Array.isArray(payload) ? payload[1] : payload;
    if (Array.isArray(rates)) {
      cache.status = "ok";
      cache.data = rates;
      cache.last_update = new Date().toISOString();
      console.log("Rates received:", rates.length);
    }
  } catch (e) {
    console.log("Parse error", e.message);
  }
});

app.get("/data", (req, res) => {
  res.json(cache);
});

app.get("/", (req, res) => {
  res.send("Bullion socket running");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server started on", PORT);
});
