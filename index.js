const { connect } = require("puppeteer-real-browser");
const express = require("express");

const app = express();

const MINUTOS = 1;
const URL = process.env.URL;
// const PROXY = JSON.parse(process.env.PROXY || false);
const ADDRESS = process.env.ADDRESS;
const INDEX = 4;

async function run() {
  const { page, browser } = await connect({
    headless: false, // 🔥 obrigatório no Render
    args: [
      "--disable-gpu",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-extensions",
      "--disable-images",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
    headless: false,
    turnstile: true,
    disableXvfb: false,
    ignoreAllFlags: false,

    // proxy: PROXY[INDEX] || false,
    customConfig: {},
    connectOption: {
      defaultViewport: null,
    },
    plugins: [],
  });

  try {
    await page.goto(URL, { waitUntil: "networkidle2" });

    await new Promise((r) => setTimeout(r, 5000));

    await page.type("#address", ADDRESS);

    const value = await page.$eval("#address", (el) => el.value);
    if (value !== ADDRESS) {
      await page.$eval("#address", (el) => (el.value = ""));
      await page.type("#address", ADDRESS);
    }

    const tempoTotal = MINUTOS * 60 * 1000;
    const inicio = Date.now();

    while (Date.now() - inicio < tempoTotal) {
      try {
        await page.waitForSelector("circle", { timeout: 2000 });
        await page.click("circle");
      } catch (e) {}
      await new Promise((r) => setTimeout(r, 400));
    }

    await new Promise((r) => setTimeout(r, 1000));
    await page.click("button[type='button'] > span");

    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: "screen.png" });
  } catch (e) {
    console.error("erro", e);
  } finally {
    await browser.close();
  }
}

app.get("/", (req, res) => {
  res.send("Bot ativo");
});

app.get("/run", async (req, res) => {
  await run();
  res.send("Executando...");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando");
});
