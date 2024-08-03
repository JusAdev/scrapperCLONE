const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
require('dotenv').config();

// Use the stealth plugin
puppeteer.use(StealthPlugin());




const scrapeLogic = async (url, selector, res) => {

  let proxyIp;

  async function getProxyIp() {
      try {
          const response = await axios.get('https://gimmeproxy.com/api/getProxy');
          const ip = response.data.ip;
          const ipPort = response.data.port;
          proxyIp = `--proxy-server=${ip}:${ipPort}`;
          console.log('IP Address:', proxyIp);
      } catch (error) {
          console.error('Error:', error);
          proxyIp = "";
      }
  }

  await getProxyIp();

  console.log(proxyIp);


  const browser = await puppeteer.launch({
    headless: true,
    args: [ proxyIp ],
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


    await page.keyboard.type('Hello World', { delay: 500 });

    // Stealth plugin will handle recaptcha solving
    // await page.solveRecaptchas();

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });
    const pcontent = await page.content();

    if (pcontent.includes('have detected unusual traffic from')){

      if (pcontent.includes('Sorry, we have detected unusual traffic from your network') || pcontent.includes('Please slide to verify')){
        console.log("inclui ##2")
      }else{
        console.log("NAO inclui ##2")
      }

      await page.waitForSelector('#nc_1__scale_text', { timeout: 60000 });
      let sliderElement = await page.$('#nc_1__scale_text')
      let slider = await sliderElement.boundingBox()

      await page.waitForSelector('#nc_1_n1z', { timeout: 60000 });
      let sliderHandle = await page.$('#nc_1_n1z')
      let handle = await sliderHandle.boundingBox()

      await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2)
      await page.mouse.down()
      await page.mouse.move(handle.x + slider.width, handle.y + handle.height / 2, { steps: 50 })
      await page.mouse.up()

    }else{
      console.log("nao inclui unusual");
    }


    // Wait for the selector to appear with a 60-second timeout
    await page.waitForSelector(selector, { timeout: 160000 });

    // Get the text content of the element matching the selector
    const element = await page.$(selector);
    const textContent = await element.evaluate(el => el.textContent);


    let disponivel;
    if (textContent.includes('Sorry, this item is no longer available!') || textContent.includes("Sorry, the page you requested can not be found")) {
      disponivel = 'Produto NÃO disponível.';
      console.log(disponivel);
    } else {
      disponivel = 'Produto disponível.';
    }



    // Print the text content
    const logStatement = `The text content of the selected element is: ${textContent} <br>IP PROXY = ${proxyIp}<br> and DISPONÍVEL = ${disponivel} <br> and content = ${pcontent}`;
    console.log(logStatement);
    res.send(logStatement);
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e} - Proxy ${proxyIp}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
