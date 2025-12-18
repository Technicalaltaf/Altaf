import { io } from "socket.io-client";

const socket = io("wss://starlinesupport.in:10001", {
  transports: ["websocket"],
  reconnection: true,
});

let liveCache = {};

socket.on("connect", () => {
  console.log("Connected");
  socket.emit("room", "anjujewellery");
});

socket.on("Liverate", (data) => {
  liveCache.liverate = data;
});

socket.on("message", (data) => {
  liveCache.products = data.Rate;
});

socket.on("ClientHeaderDetails", (data) => {
  liveCache.header = data;
});
