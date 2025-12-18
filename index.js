const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

/* ================= CACHE ================= */
let CACHE = {
  status: "loading",
  last_update: null,
  data: []
};

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.send("Bullion Live Bridge OK");
});

/* ================= RECEIVE FROM BROWSER ================= */
app.post("/push", (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).json({ status: "error", msg: "Invalid payload" });
  }

  CACHE = {
    status: "ok",
    last_update: new Date().toISOString(),
    data
  };

  console.log("✅ Rates updated:", CACHE.last_update);
  res.json({ status: "ok" });
});

/* ================= SERVE TO WEBSITE ================= */
app.get("/data", (req, res) => {
  res.json(CACHE);
});

/* ================= START ================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
