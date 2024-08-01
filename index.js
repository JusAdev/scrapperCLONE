const express = require("express");
const bodyParser = require("body-parser");
const { scrapeLogic } = require("./scrapeLogic");
const app = express();

const PORT = process.env.PORT || 4000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/scrape", (req, res) => {
  const url = req.body.url;
  const selector = req.body.selector;
  scrapeLogic(url, selector, res);
});

app.get("/", (req, res) => {
  res.send(`
    <form action="/scrape" method="post">
      <label for="url">URL:</label>
      <input type="text" id="url" name="url" required>
      <br>
      <label for="selector">CSS Selector:</label>
      <input type="text" id="selector" name="selector" required>
      <br>
      <button type="submit">Scrape</button>
    </form>
  `);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
