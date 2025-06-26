const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const app = express();

app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing ?url parameter");

  try {
    const response = await fetch(targetUrl);
    const contentType = response.headers.get("content-type") || "text/html";

    let body = await response.text();

    if (contentType.includes("text/html")) {
      const $ = cheerio.load(body);

      // Примитивная фильтрация
      $("iframe, script[src*='ads'], img[src*='ads'], .ad, [id*='ad']").remove();

      // Добавим пометку
      $("body").prepend('<div style="position:fixed;top:0;left:0;background:#000;color:#0f0;padding:5px;z-index:9999;">✅ Реклама удалена (сервер)</div>');

      body = $.html();
    }

    res.set("Content-Type", contentType);
    res.send(body);
  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Proxy server running on port " + PORT);
});
