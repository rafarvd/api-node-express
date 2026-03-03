const { connect } = require("puppeteer-real-browser");
const express = require("express");

const app = express();

const MINUTOS = 10;
const URL = process.env.URL;
const PROXY = JSON.parse(process.env.PROXY || false);
const ADDRESS = process.env.ADDRESS.split("\n") || "dvknvkjfnkjbfvjhkb";
const INDEX = 4;

async function run() {
  const { page, browser } = await connect({
    headless: true, // 🔥 obrigatório no Render
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process"
    ],
    turnstile: true,
    proxy: PROXY[INDEX] || false,
    customConfig: {},
    connectOption: {
      defaultViewport: { width: 1280, height: 800 },
    },
    plugins: [],
  });

  try {
    await page.goto(URL, { waitUntil: "networkidle2" });

    await page.waitForTimeout(5000);

    await page.type("#address", ADDRESS[INDEX]);

    const value = await page.$eval("#address", el => el.value);
    if (value !== ADDRESS[INDEX]) {
      await page.$eval("#address", el => (el.value = ""));
      await page.type("#address", ADDRESS[INDEX]);
    }

    const tempoTotal = MINUTOS * 60 * 1000;
    const inicio = Date.now();

    while (Date.now() - inicio < tempoTotal) {
      try {
        await page.waitForSelector("circle", { timeout: 2000 });
        await page.click("circle");
      } catch (e) {}
      await page.waitForTimeout(400);
    }

    await page.waitForTimeout(1000);
    // await page.click("button[type='button'] > span");

    await page.waitForTimeout(1000);
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
  run();
  res.send("Executando...");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando");
});
