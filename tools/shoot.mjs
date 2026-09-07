/* Screenshot harness for design review.
   Usage: node tools/shoot.mjs [--full] [width ...]
   Writes PNGs into ./shots (gitignored). Downscales to keep vision input sane. */

import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const out = path.join(root, "shots");
fs.mkdirSync(out, { recursive: true });

const args = process.argv.slice(2);
const full = args.includes("--full");
const widths = args.filter((a) => /^\d+$/.test(a)).map(Number);
const sizes = widths.length ? widths : [375, 768, 1024, 1440];

const target = pathToFileURL(path.join(root, "index.html")).href;

const browser = await chromium.launch();
const errors = [];

for (const w of sizes) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: Math.round(w * 0.72) },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`[${w}px console] ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`[${w}px pageerror] ${e.message}`));
  page.on("requestfailed", (r) =>
    errors.push(`[${w}px netfail] ${r.url().slice(0, 120)} — ${r.failure()?.errorText}`)
  );

  await page.goto(target, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);

  // Force every reveal into its final state so screenshots are deterministic.
  await page.evaluate(() => {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
    document.querySelectorAll("[data-bar]").forEach((el) => {
      el.style.width = el.getAttribute("data-bar") + "%";
    });
  });
  await page.waitForTimeout(500);

  if (full) {
    await page.evaluate(async () => {
      await new Promise((res) => {
        let y = 0;
        const step = () => {
          y += window.innerHeight * 0.8;
          window.scrollTo(0, y);
          if (y < document.body.scrollHeight) setTimeout(step, 60);
          else { window.scrollTo(0, 0); setTimeout(res, 350); }
        };
        step();
      });
    });
    await page.screenshot({ path: path.join(out, `full-${w}.png`), fullPage: true });
  }

  // Per-section shots at desktop width — easier to critique than one tall strip.
  if (w >= 1024) {
    // The masthead is fixed, so it lands in the middle of element screenshots.
    await page.addStyleTag({ content: ".masthead,.progress{display:none!important}" });
    const ids = await page.evaluate(() =>
      Array.from(document.querySelectorAll("section[id]")).map((s) => s.id)
    );
    for (const id of ids) {
      const el = page.locator(`#${id}`);
      try {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(320);
        await el.screenshot({ path: path.join(out, `${w}-${id}.png`) });
      } catch {
        /* section taller than the capture limit — skip */
      }
    }
  }

  await page.screenshot({ path: path.join(out, `view-${w}.png`) });

  const metrics = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    height: document.body.scrollHeight,
  }));
  if (metrics.scrollW > metrics.clientW + 1) {
    errors.push(`[${w}px] HORIZONTAL OVERFLOW: scrollWidth ${metrics.scrollW} > clientWidth ${metrics.clientW}`);
  }
  console.log(`${w}px  height=${metrics.height}px  overflow=${metrics.scrollW > metrics.clientW + 1}`);

  await ctx.close();
}

await browser.close();

if (errors.length) {
  console.log("\n--- ISSUES ---");
  errors.forEach((e) => console.log(e));
  process.exitCode = 1;
} else {
  console.log("\nNo console errors, no failed requests, no horizontal overflow.");
}
