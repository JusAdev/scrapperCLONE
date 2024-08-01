const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
require('dotenv').config();

// Use the stealth plugin
puppeteer.use(StealthPlugin());

const scrapeLogic = async (url, selector, res) => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath:
      process.env.NODE_ENV === 'production'
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  try {
    const page = await browser.newPage();
   
    // Set a default timeout of 60 seconds for all operations
    page.setDefaultTimeout(160000);

    await page.goto(url);

    await page.mouse.move(100, 200);
    await page.mouse.move(150, 250, { steps: 10 });


    await page.solveRecaptchas();

    await page.keyboard.type('Hello World', { delay: 500 });

    // Stealth plugin will handle recaptcha solving
    // await page.solveRecaptchas();

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });
    const pcontent = await page.content();

    // Wait for the selector to appear with a 60-second timeout
    await page.waitForSelector(selector, { timeout: 160000 });

    // Get the text content of the element matching the selector
    const element = await page.$(selector);
    const textContent = await element.evaluate(el => el.textContent);


    let disponivel;
    if (textContent.includes('Sorry, this item is no longer available!') || pcontent.includes("Sorry, the page you requested can not be found")) {
      disponivel = 'Produto NÃO disponível.';
      console.log(disponivel);
    } else {
      disponivel = 'Produto disponível.';
    }



    // Print the text content
    const logStatement = `The text content of the selected element is: ${textContent} <br> and DISPONÍVEL = ${disponivel} <br> and content = ${pcontent}`;
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
