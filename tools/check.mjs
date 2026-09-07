/* Behaviour checks: the calculator recomputes, the quiz plays through,
   the myths open, and nothing throws. Run: node tools/check.mjs */

import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const url = pathToFileURL(path.join(root, "index.html")).href;

let pass = 0;
const fails = [];
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fails.push(`${name}${detail ? " — " + detail : ""}`); console.log(`  FAIL ${name}${detail ? " — " + detail : ""}`); }
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto(url, { waitUntil: "networkidle" });

console.log("\nCALCULATOR");
const money = () => page.locator("[data-c-monthly]").innerText();
const before = await money();
ok("monthly figure renders", /\d/.test(before), before);

// Moving the slider must change the money.
await page.locator("[data-c-units]").fill("2");
await page.locator("[data-c-units]").dispatchEvent("input");
const after = await money();
ok("slider changes the total", after !== before, `${before} -> ${after}`);

// Switching currency must change the symbol.
await page.locator("[data-c-currency]").selectOption("GBP");
const gbp = await money();
ok("currency switch changes symbol", gbp.includes("£"), gbp);

// Switching mode must relabel and re-preset.
await page.locator('[data-c-mode="pod"]').click();
const podLabel = await page.locator("[data-c-units-label]").innerText();
ok("mode switch relabels units", /pod/i.test(podLabel), podLabel);
ok("mode switch sets aria-pressed",
  (await page.locator('[data-c-mode="pod"]').getAttribute("aria-pressed")) === "true");

// Nicotine panel must respond to strength, and zero must mean zero.
await page.locator("[data-c-strength]").selectOption("0");
ok("0 mg/mL yields zero nicotine",
  (await page.locator("[data-c-nic-mg]").innerText()).replace(/[^\d.]/g, "") === "0.0" ||
  (await page.locator("[data-c-nic-mg]").innerText()).replace(/[^\d.]/g, "") === "0");
await page.locator("[data-c-strength]").selectOption("20");
ok("20 mg/mL yields non-zero nicotine",
  parseFloat(await page.locator("[data-c-nic-mg]").innerText()) > 0);

// A blank price must not produce NaN anywhere.
await page.locator("[data-c-price]").fill("");
const cells = await page.locator(".calc__cellVal, [data-c-monthly]").allInnerTexts();
ok("empty price does not produce NaN", !cells.join(" ").includes("NaN"), cells.join(" | "));
await page.locator("[data-c-price]").fill("5");

// The chart must actually draw geometry.
const paths = await page.locator("[data-c-chart] path").count();
ok("projection chart draws paths", paths >= 3, `${paths} paths`);

// Horizon slider must extend the series.
await page.locator("[data-c-horizon]").fill("30");
await page.locator("[data-c-horizon]").dispatchEvent("input");
ok("horizon slider updates label",
  (await page.locator("[data-c-horizon-out]").innerText()).includes("30"));

console.log("\nQUIZ");
const total = await page.evaluate(() => window.VB.quiz.questions.length);
ok("quiz renders a question", (await page.locator(".quiz__q").count()) === 1);
ok("quiz renders options", (await page.locator(".opt").count()) >= 2);

// Play the whole quiz by always choosing the first option.
for (let i = 0; i < total; i++) {
  await page.locator(".opt").first().click();
  const fb = await page.locator(".quiz__feedback").count();
  if (!fb) { fails.push(`no feedback shown on question ${i + 1}`); break; }
  await page.locator("[data-q-next]").click();
  await page.waitForTimeout(120);
}
ok("quiz reaches a result screen", (await page.locator(".result__n").count()) === 1);
ok("result lists every question", (await page.locator(".review__item").count()) === total);

await page.locator("[data-q-retry]").click();
ok("retry restarts the quiz", (await page.locator(".opt").count()) >= 2);

console.log("\nCONTENT + A11Y");
ok("no PLACEHOLDER text on the page",
  !(await page.locator("body").innerText()).includes("PLACEHOLDER"));
ok("no unresolved em-dash slots",
  !(await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-s1-body],[data-s2-body],[data-s3-body],[data-s4-body],[data-s5-body],[data-s6-body],[data-s7-body],[data-s8-body],[data-s9-body],[data-s10-body]"))
      .some((el) => el.innerText.trim() === "—"))));
// text-transform: uppercase turns the micro sign into a capital Mu, which
// reads as "M" — so a microgram silently becomes a milligram on screen.
ok("no micro sign inside an uppercased element", await page.evaluate(() => {
  return !Array.from(document.querySelectorAll("*")).some((el) => {
    if (getComputedStyle(el).textTransform !== "uppercase") return false;
    return Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && n.nodeValue.indexOf("µ") !== -1
    );
  });
}));
ok("guessing a myth reveals its verdict", await page.evaluate(() => {
  const d = document.querySelector("[data-disclosure]");
  if (!d) return false;
  const btn = d.querySelector(".guess [data-g='f']");
  if (!btn) return false;
  btn.click();
  const r = d.querySelector(".disclosure__reality");
  return !!r && !r.hidden;
}));
ok("the voltage dial swaps both readings", await page.evaluate(() => {
  const lo = document.querySelector("[data-dial-v='4']");
  const hi = document.querySelector("[data-dial-v='5']");
  const n = document.querySelector("[data-dial-n]");
  if (!lo || !hi || !n) return false;
  hi.click();
  const after = hi.getAttribute("aria-pressed") === "true";
  lo.click();
  return after && lo.getAttribute("aria-pressed") === "true";
}));
ok("every myth opens", await page.evaluate(() => {
  const d = document.querySelectorAll("[data-disclosure]");
  if (!d.length) return false;
  d[0].querySelector(".disclosure__btn").click();
  return d[0].classList.contains("is-open");
}));
ok("all images have alt text", await page.evaluate(() =>
  Array.from(document.images).every((i) => i.hasAttribute("alt"))));
ok("all images actually loaded", await page.evaluate(() =>
  Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0)),
  await page.evaluate(() => Array.from(document.images).filter(i => !i.naturalWidth).map(i => i.src).join(", ")));
ok("single h1", (await page.locator("h1").count()) === 1);
ok("page has a lang attribute",
  (await page.locator("html").getAttribute("lang")) !== null);
ok("no console/page errors", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log("\nKEYBOARD + MOTION");
const kb = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await kb.goto(url, { waitUntil: "networkidle" });
await kb.keyboard.press("Tab");
ok("skip link is the first tab stop",
  (await kb.evaluate(() => document.activeElement.className)) === "skip-link");
ok("skip link becomes visible on focus",
  (await kb.evaluate(() => document.activeElement.getBoundingClientRect().top)) > 0);

await kb.locator("#quiz").scrollIntoViewIfNeeded();
await kb.waitForTimeout(300);
await kb.locator(".opt").first().focus();
await kb.keyboard.press("2");
await kb.waitForTimeout(150);
ok("number keys answer the quiz", (await kb.locator(".quiz__feedback").count()) === 1);
await kb.keyboard.press("Enter");
await kb.waitForTimeout(200);
ok("Enter advances the quiz", (await kb.locator(".opt").count()) >= 2);

ok("focus ring is visible", await kb.evaluate(() => {
  const el = document.querySelector(".btn");
  el.focus();
  return parseFloat(getComputedStyle(el).outlineWidth) >= 2;
}));
await kb.close();

const rm = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
await rm.goto(url, { waitUntil: "networkidle" });
ok("nothing stays hidden under prefers-reduced-motion",
  (await rm.evaluate(() =>
    Array.from(document.querySelectorAll("[data-reveal]"))
      .filter((e) => getComputedStyle(e).opacity === "0").length)) === 0);
await rm.close();

await browser.close();

console.log(`\n${pass} passed, ${fails.length} failed`);
if (fails.length) { fails.forEach((f) => console.log("  ✗ " + f)); process.exitCode = 1; }
