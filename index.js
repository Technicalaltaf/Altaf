const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 5000;

let cache = {
  status: "loading",
  last_update: null,
  rtgs: [],
  retail: []
};

async function fetchData() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });

    await page.goto("https://anjujewellery.in/", {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    await page.waitForTimeout(5000);

    const data = await page.evaluate(() => {

      function extractTable(sectionTitle) {
        const sections = Array.from(document.querySelectorAll("h4, h3"))
          .filter(h => h.innerText.includes(sectionTitle));

        if (!sections.length) return [];

        const table = sections[0].closest("div").querySelector("table");
        if (!table) return [];

        const rows = Array.from(table.querySelectorAll("tbody tr"));

        return rows.map(tr => {
          const tds = tr.querySelectorAll("td");
          return {
            product: tds[0]?.innerText.trim() || "",
            weight: tds[1]?.innerText.trim() || "",
            price: tds[2]?.innerText.replace(/,/g, "").trim() || "",
            time: new Date().toLocaleTimeString()
          };
        });
      }

      return {
        rtgs: extractTable("RTGS"),
        retail: extractTable("RETAIL")
      };
    });

    cache = {
      status: "ok",
      last_update: new Date().toISOString(),
      rtgs: data.rtgs,
      retail: data.retail
    };

    console.log("Rates updated");

  } catch (err) {
    console.log("Fetch error:", err.message);
    cache.status = "error";
  } finally {
    if (browser) await browser.close();
  }
}

setInterval(fetchData, 10000);
fetchData();

app.get("/data", (req, res) => {
  res.json(cache);
});

app.get("/", (req, res) => {
  res.send("Anju Jewellery Scraper Running");
});

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});socket.on("Liverate", (payload) => {
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
