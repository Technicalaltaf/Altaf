const { io } = require("socket.io-client");

let cache = {
  status: "loading",
  socket: "connecting",
  last_update: null,
  data: []
};

const SOCKET_URL = "https://starlinesupport.in:10001";

let socket;

function connectSocket() {
  if (socket) return;

  socket = io(SOCKET_URL, {
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

  socket.on("connect", () => {
    cache.socket = "connected";
    socket.emit("room", "anjujewellery");
  });

  socket.on("disconnect", () => {
    cache.socket = "disconnected";
  });

  socket.on("Liverate", payload => {
    if (Array.isArray(payload)) {
      cache = {
        status: "ok",
        socket: "connected",
        last_update: new Date().toISOString(),
        data: payload
      };
    }
  });
}

connectSocket();

module.exports = (req, res) => {
  if (req.url === "/") {
    res.send("Bullion Live Server OK");
  } else if (req.url === "/data") {
    res.json(cache);
  } else {
    res.status(404).send("Not found");
  }
};