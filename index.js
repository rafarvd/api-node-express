const express = require("express");
const { connect } = require("puppeteer-real-browser");

const app = express();

const URL = process.env.URL;
const PROXIES = JSON.parse(process.env.PROXY || "[]");
const ADDRESSES = process.env.ADDRESS.split("\n");

const MAX_CONCURRENT = 5;
const MINUTOS = 15;

async function runBot(index) {
  const { browser, page } = await connect({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ],
    proxy: PROXIES[index] || undefined,
  });

  try {
    await page.goto(URL, { waitUntil: "networkidle2" });

    await page.type("#address", ADDRESSES[index]);

    const tempoTotal = MINUTOS * 60 * 1000;
    const inicio = Date.now();

    while (Date.now() - inicio < tempoTotal) {
      try {
        await page.click("circle");
      } catch {}
      await new Promise(r => setTimeout(r, 400));
    }

  } catch (e) {
    console.log("Erro bot", index);
  } finally {
    await browser.close();
  }
}

async function runAllBots() {
  for (let i = 0; i < ADDRESSES.length; i += MAX_CONCURRENT) {
    const lote = ADDRESSES.slice(i, i + MAX_CONCURRENT);
    await Promise.all(
      lote.map((_, idx) => runBot(i + idx))
    );
  }
}

app.get("/", async (req, res) => {
  res.send("Service running");
});

app.get("/run", async (req, res) => {
  runAllBots();
  res.send("Bots iniciados");
});

app.listen(3000, () => console.log("Server on"));
