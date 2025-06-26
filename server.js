const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing ?url parameter");

  try {
    const response = await fetch(targetUrl);
    let html = await response.text();

    const $ = cheerio.load(html);
    const baseUrl = new URL(targetUrl);

    // Преобразуем относительные ссылки в абсолютные
    $("link[href]").each((i, el) => {
      const href = $(el).attr("href");
      if (href && !href.startsWith("http")) {
        $(el).attr("href", new URL(href, baseUrl).href);
      }
    });
    $("script[src]").each((i, el) => {
      const src = $(el).attr("src");
      if (src && !src.startsWith("http")) {
        $(el).attr("src", new URL(src, baseUrl).href);
      }
    });
    $("img[src]").each((i, el) => {
      const src = $(el).attr("src");
      if (src && !src.startsWith("http")) {
        $(el).attr("src", new URL(src, baseUrl).href);
      }
    });
    $("a[href]").each((i, el) => {
      const href = $(el).attr("href");
      if (href && !href.startsWith("http") && !href.startsWith("#")) {
        $(el).attr("href", new URL(href, baseUrl).href);
      }
    });

    html = $.html();
    res.set("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
});

app.listen(PORT, () => {
  console.log("Proxy server running on port " + PORT);
});
