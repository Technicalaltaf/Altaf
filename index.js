let socketCache = {
  status: "loading",
  socket: "connecting",
  last_update: null,
  data: []
};

let tableCache = {
  tables: []
};

// ---- SOCKET HANDLER (AS IS) ----
socket.on("Liverate", payload => {
  socketCache = {
    status: "ok",
    socket: "connected",
    last_update: new Date().toISOString(),
    data: payload
  };
});

// ---- PUPPETEER FETCH (EVERY 10s) ----
async function fetchTables() {
  // tumhara Code-2 ka puppeteer logic
  // sirf tables nikaalo
  tableCache.tables = data.tables;
}

setInterval(fetchTables, 10000);

// ---- FINAL API ----
app.get("/data", (req, res) => {
  res.json({
    status: "ok",
    live: socketCache,   // JSON
    tables: tableCache   // HTML tables
  });
});
