const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const app = express();

app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send("Missing ?url parameter");
  }

  try {
    const response = await fetch(targetUrl);
    const contentType = response.headers.get("content-type") || "text/plain";
    const isHtml = contentType.includes("text/html");

    if (!isHtml) {
      // Просто проксируем всё, что не HTML (картинки, стили, скрипты)
      const buffer = await response.buffer();
      res.set("Content-Type", contentType);
      return res.send(buffer);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const absolutize = (attr, base) => (i, el) => {
      const val = $(el).attr(attr);
      if (val && !val.startsWith("http") && !val.startsWith("data:")) {
        const abs = new URL(val, base).href;
        $(el).attr(attr, `/proxy?url=${abs}`);
      } else if (val?.startsWith("http")) {
        $(el).attr(attr, `/proxy?url=${val}`);
      }
    };

    // Подставляем прокси во все src/href
    $("link").each(absolutize("href", targetUrl));
    $("script").each(absolutize("src", targetUrl));
    $("img").each(absolutize("src", targetUrl));
    $("iframe").each(absolutize("src", targetUrl));
    $("a").each(absolutize("href", targetUrl));

    res.set("Content-Type", "text/html");
    res.send($.html());

  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Proxy server running on port " + PORT);
});
