const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing ?url parameter');

  try {
    const response = await fetch(targetUrl);
    const contentType = response.headers.get('content-type') || 'text/plain';
    res.set('Content-Type', contentType);
    const body = await response.text();
    res.send(body);
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
