const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (url, selector, res) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    const page = await browser.newPage();

    // Set a default timeout of 60 seconds for all operations
    page.setDefaultTimeout(160000);

    await page.goto(url);

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });
    const pcontent = await page.content();

    // Wait for the selector to appear with a 60-second timeout
    await page.waitForSelector(selector, { timeout: 160000 });

    // Get the text content of the element matching the selector
    const element = await page.$(selector);
    const textContent = await element.evaluate((el) => el.textContent);

    // Print the text content
    const logStatement = `The text content of the selected element is: ${textContent} <br> and content = ${pcontent}`;
    console.log(logStatement);
    res.send(logStatement);
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
