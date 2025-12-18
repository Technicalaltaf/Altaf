const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let CACHE = {
  status: "loading",
  last_update: null,
  data: []
};

app.get("/", (req, res) => {
  res.send("Bullion Live Bridge OK");
});

app.post("/push", (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).json({ status: "error" });
  }

  CACHE = {
    status: "ok",
    last_update: new Date().toISOString(),
    data
  };

  console.log("Rates updated");
  res.json({ status: "ok" });
});

app.get("/data", (req, res) => {
  res.json(CACHE);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on", PORT);
});
