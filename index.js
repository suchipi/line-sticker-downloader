const path = require("path");
const chalk = require("chalk");
const puppeteer = require("puppeteer");
const makeDir = require("make-dir");
const downloadImage = require("image-downloader").image;
const ora = require("ora");
const apng2gif = require("apng2gif");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function createContext(config) {
  const { url, dest = "stickers", animatedWaitDelay, convertToGif } = config;

  return {
    spinner: ora("Downloading stickers..."),
    config: {
      url,
      dest,
      animatedWaitDelay,
      convertToGif,
    },
  };
}

async function scrapeStickerUrls(context) {
  const { url: pageUrl, animatedWaitDelay } = context.config;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(pageUrl);
  const stickerUrls = [];

  const elementHandles = await page.$$('ul > li [style^="background-image"]');
  if (elementHandles.length === 0) {
    throw new Error("Could not find any stickers on the specified page");
  }

  let index = 0;
  const total = elementHandles.length;
  for (const elementHandle of elementHandles) {
    index++;
    context.spinner.text = `Scraping stickers (${index}/${total})...`;

    await elementHandle.evaluate(node => node.click());
    await sleep(animatedWaitDelay);
    const canvasHandles = await page.$$("canvas[data-apng-src]");

    let url;
    if (canvasHandles.length === 2) {
      // First canvas is the product image; skip it
      url = await await page.evaluate(
        (el) => el.getAttribute("data-apng-src"),
        canvasHandles[1]
      );
    } else {
      // Treat as non-animated sticker
      url = await page.evaluate(
        (el) => el.style.backgroundImage.replace(/^url\("|"\)/g, ""),
        elementHandle
      );
    }
    stickerUrls.push(url);
  }

  browser.close();

  return stickerUrls;
}

async function downloadStickers(config = {}) {
  let context;
  try {
    context = createContext(config);
    const {
      spinner,
      config: { dest, convertToGif },
    } = context;
    spinner.start();

    let urls = await scrapeStickerUrls(context);
    urls = Array.from(new Set(urls));

    await makeDir(dest);

    context.spinner.text = `Downloading ${urls.length} stickers...`;
    await Promise.all(
      urls.map((url, i) =>
        downloadImage({
          url,
          dest: path.join(dest, `sticker-${i + 1}.png`),
        })
      )
    );

    if (convertToGif) {
      context.spinner.text = `Converting ${urls.length} stickers to GIF...`;
      await Promise.all(
        urls.map((url, i) => apng2gif(path.join(dest, `sticker-${i + 1}.png`)))
      );
    }

    spinner.succeed(chalk.green(`Saved stickers to ${dest}/`));
  } catch (err) {
    if (context) {
      context.spinner.fail(chalk.red(err.message));
    }
    console.error(err.stack);
    process.exit(1);
  }
}

module.exports = downloadStickers;
