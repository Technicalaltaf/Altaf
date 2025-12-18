const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 5000;

// ================= CACHE =================
let live = {
  last_update: null,
  spot: {},
  future: {},
  next: {},
  table: []
};

// ================= SOCKET CLIENT =================
const socketClient = require("socket.io-client");

const ANJU_SOCKET = "https://starlinesupport.in"; 
// ye domain anju ke socket ka base hai (actual socket wahi hota hai)

const socket = socketClient(ANJU_SOCKET, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 2000
});

socket.on("connect", () => {
  console.log("✅ Connected to Anju socket");
});

socket.on("disconnect", () => {
  console.log("❌ Socket disconnected");
});

// ================= LIVE RATE =================
socket.on("Liverate", (data) => {
  data.forEach(item => {
    if (item.symbol === "gold") live.future.gold = item;
    if (item.symbol === "silver") live.future.silver = item;
    if (item.symbol === "goldnext") live.next.gold = item;
    if (item.symbol === "silvernext") live.next.silver = item;
    if (item.symbol === "XAUUSD") live.spot.gold = item;
    if (item.symbol === "XAGUSD") live.spot.silver = item;
    if (item.symbol === "INRSpot") live.spot.inr = item;
  });

  live.last_update = new Date().toISOString();
});

// ================= TABLE (PRODUCT RATES) =================
socket.on("message", (payload) => {
  if (!payload || !payload.Rate) return;

  live.table = payload.Rate.map(r => ({
    name: r.Symbol,
    weight: r.Description,
    ask: r.Ask,
    bid: r.Bid,
    high: r.High,
    low: r.Low,
    time: r.Time,
    type: r.DisplayRateType // fix / mcx
  }));

  live.last_update = new Date().toISOString();
});

// ================= API =================
app.get("/data", (req, res) => {
  if (!live.last_update) {
    return res.json({
      status: "loading",
      socket: "connected",
      data: []
    });
  }

  res.json({
    status: "ok",
    socket: socket.connected ? "connected" : "error",
    last_update: live.last_update,
    data: live
  });
});

app.get("/", (req, res) => {
  res.send("Option B Live Server Running");
});

server.listen(PORT, () => {
  console.log("🚀 Server running on", PORT);
});
