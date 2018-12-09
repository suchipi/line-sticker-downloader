const path = require("path");
const chalk = require("chalk");
const puppeteer = require("puppeteer");
const makeDir = require("make-dir");
const downloadImage = require("image-downloader").image;
const ora = require("ora");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const spinner = ora("Downloading stickers...").start();

async function scrapeStickerUrls(pageUrl) {
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
    spinner.text = `Downloading stickers (${index}/${total})...`;

    await elementHandle.click();
    await sleep(process.env.ANIMATED_WAIT_DELAY || 400);
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

async function main() {
  try {
    const url = process.argv[2];
    const dest = process.argv[3] || "stickers";

    const urls = await scrapeStickerUrls(url);
    await makeDir(dest);

    await Promise.all(
      urls.map((url, i) =>
        downloadImage({
          url,
          dest: path.join(dest, `sticker-${i}.png`),
        })
      )
    );

    spinner.succeed(chalk.green(`Saved stickers to ${dest}/`));
  } catch (err) {
    spinner.fail(chalk.red(err.message));
    console.error(err.stack);
    process.exit(1);
  }
}

main();
