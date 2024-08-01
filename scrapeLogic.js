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

    await page.goto(url);

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    // Wait for the selector to appear
    await page.waitForSelector(selector);

    // Get the text content of the element matching the selector
    const element = await page.$(selector);
    const textContent = await element.evaluate((el) => el.textContent);

    // Print the text content
    const logStatement = `The text content of the selected element is: ${textContent}`;
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
