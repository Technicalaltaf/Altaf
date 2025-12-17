const express = require("express");
const puppeteer = require("puppeteer");
const { execSync } = require("child_process");

const app = express();
const PORT = process.env.PORT || 5000;

let cache = null;
let lastSuccessTime = null;
let lastError = null;
let loading = false;

/* ================= CHROMIUM PATH ================= */
function getChromiumPath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  try {
    return execSync("which chromium").toString().trim();
  } catch {
    return puppeteer.executablePath();
  }
}

/* ================= FETCH DATA ================= */
async function fetchData() {
  let browser;
  loading = true;
  lastError = null;

  console.log("⏳ Fetching bullion data...");

  try {
    browser = await puppeteer.launch({
      headless: "new",
      executablePath: getChromiumPath(),
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled"
      ]
    });

    const page = await browser.newPage();

    /* ---------- Fake human-ish headers ---------- */
    await page.setUserAgent(
      "Mozilla/5.0 (Linux; Android 11; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 Mobile Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "accept-language": "en-IN,en;q=0.9",
      "upgrade-insecure-requests": "1"
    });

    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 2
    });

    await page.goto("http://anjujewellery.in/", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await page.waitForTimeout(6000);

    const data = await page.evaluate(() => {
      function extract(title) {
        const nodes = Array.from(document.querySelectorAll("div"))
          .filter(d => d.innerText && d.innerText.includes(title));

        if (!nodes.length) return null;

        const box = nodes[0].closest("div");
        if (!box) return null;

        const nums = Array.from(box.querySelectorAll("span"))
          .map(s => s.innerText.trim())
          .filter(v => /^[0-9]/.test(v));

        return {
          bid: nums[0] || null,
          ask: nums[1] || null,
          high: nums[2] || null,
          low: nums[3] || null
        };
      }

      return {
        spots: {
          gold: extract("GOLD SPOT"),
          silver: extract("SILVER SPOT"),
          inr: extract("INR SPOT")
        },
        futures: {
          gold: extract("GOLD FUTURE"),
          silver: extract("SILVER FUTURE")
        },
        next: {
          gold: extract("GOLD NEXT"),
          silver: extract("SILVER NEXT")
        }
      };
    });

    /* ---------- Validate data ---------- */
    const valid =
      data &&
      data.spots &&
      (data.spots.gold || data.spots.silver);

    if (!valid) {
      throw new Error("Blocked / Invalid DOM received");
    }

    cache = data;
    lastSuccessTime = new Date().toISOString();
    console.log("✅ Data updated successfully");

  } catch (err) {
    console.error("❌ Fetch failed:", err.message);
    lastError = err.message;
  } finally {
    loading = false;
    if (browser) {
      try { await browser.close(); } catch {}
    }
  }
}

/* ================= SCHEDULER ================= */
async function scheduler() {
  while (true) {
    await fetchData();
    await new Promise(r => setTimeout(r, 10000));
  }
}
scheduler();

/* ================= ROUTES ================= */
app.get("/", (req, res) => {
  res.send("Ambica Live Server OK");
});

app.get("/data", (req, res) => {
  if (loading && !cache) {
    return res.json({ status: "loading" });
  }

  if (!cache) {
    return res.json({
      status: "error",
      error: lastError || "No data yet"
    });
  }

  res.json({
    status: "ok",
    last_update: lastSuccessTime,
    source: "puppeteer",
    data: cache
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
});
