/* Renders assets/img/og.png (1200x630) from the hero for link previews. */
import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce",
});
await page.goto(pathToFileURL(path.join(root, "index.html")).href, { waitUntil: "networkidle" });
await page.addStyleTag({
  content: `
    .masthead,.progress,.hero__scroll,.hero__cta,.hero__meta{display:none!important}
    .hero{min-height:630px;padding-block:0;align-items:center}
    .hero__title{font-size:88px}
    .lead{font-size:22px;max-width:46ch}
  `,
});
await page.waitForTimeout(1200);
await page.locator("#open").screenshot({ path: path.join(root, "assets/img/og.png") });
await browser.close();
console.log("wrote assets/img/og.png");
