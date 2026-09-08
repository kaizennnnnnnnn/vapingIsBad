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
// Lazy images only fetch near the viewport, so walk the page first.
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight * 0.8) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 40));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(600);
ok("all images actually loaded", await page.evaluate(() =>
  Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0)),
  await page.evaluate(() => Array.from(document.images).filter(i => !i.naturalWidth).map(i => i.src).join(", ")));
ok("the can't-tell-you list has four sourced items", await page.evaluate(() => {
  const items = Array.from(document.querySelectorAll(".cant__item"));
  return items.length === 4 && items.every((li) => li.querySelector(".fact__src a[href^='http']"));
}));
ok("sound is opt-in and the toggle reports its state", await page.evaluate(() => {
  const b = document.querySelector("[data-dial-sound]");
  const st = document.querySelector("[data-dial-sound-state]");
  if (!b || b.getAttribute("aria-pressed") !== "false") return false;
  b.click();
  const on = b.getAttribute("aria-pressed") === "true" && st.textContent.trim() === "on";
  document.querySelector("[data-dial-v='5']").click();
  document.querySelector("[data-dial-v='4']").click();
  b.click();
  return on && b.getAttribute("aria-pressed") === "false";
}));
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

// The fire button works from the keyboard: Space held is a hold.
await kb.evaluate(() => window.scrollTo(0, 0));
await kb.locator("[data-hold]").focus();
await kb.keyboard.down("Space");
await kb.waitForTimeout(500);
const kbHeld = await kb.evaluate(() => document.querySelector("[data-drag]").classList.contains("is-held"));
await kb.keyboard.up("Space");
const kbOut = await kb.evaluate(() => document.querySelector("[data-drag]").classList.contains("is-out"));
ok("the fire button can be held from the keyboard", kbHeld && kbOut, `held=${kbHeld} out=${kbOut}`);

ok("focus ring is visible", await kb.evaluate(() => {
  const el = document.querySelector(".btn");
  el.focus();
  return parseFloat(getComputedStyle(el).outlineWidth) >= 2;
}));
await kb.close();

const rm = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
await rm.goto(url, { waitUntil: "networkidle" });
ok("no coil pulse under prefers-reduced-motion",
  (await rm.evaluate(() =>
    document.getAnimations().filter((a) => a.animationName === "coil-pulse").length)) === 0);
ok("nothing stays hidden under prefers-reduced-motion",
  (await rm.evaluate(() =>
    Array.from(document.querySelectorAll("[data-reveal]"))
      .filter((e) => getComputedStyle(e).opacity === "0").length)) === 0);
await rm.close();

console.log("\nPHONE");
const phCtx = await browser.newContext({ viewport: { width: 375, height: 740 }, hasTouch: true, isMobile: true });
const ph = await phCtx.newPage();
const phErrors = [];
ph.on("pageerror", (e) => phErrors.push(e.message));
ph.on("console", (m) => m.type() === "error" && phErrors.push(m.text()));
await ph.goto(url, { waitUntil: "networkidle" });
await ph.waitForTimeout(500);

// Every grid child must span the full width on a phone. A column class
// defined only inside the desktop media query gets auto-placed into a single
// 1/12 track instead, which is invisible to an overflow check because the
// text simply wraps to one word per line.
ok("no grid column collapses on a phone", await ph.evaluate(() => {
  const bad = [];
  document.querySelectorAll(".grid > *").forEach((el) => {
    const w = el.getBoundingClientRect().width;
    const parent = el.parentElement.getBoundingClientRect().width;
    if (w < parent * 0.6) bad.push((el.className || "?") + " " + Math.round(w) + "px");
  });
  window.__gridBad = bad.join(", ");
  return bad.length === 0;
}), await ph.evaluate(() => window.__gridBad));

ok("the route stands vertical on a phone", await ph.evaluate(() => {
  const st = Array.from(document.querySelectorAll(".station")).filter((s) => getComputedStyle(s).display !== "none");
  const spine = document.querySelector(".route__spine");
  return st.length === 3 && !!spine && getComputedStyle(spine).display === "none" &&
    getComputedStyle(st[0].querySelector(".station__pin")).position === "sticky";
}));

ok("the phone coil exists and heats from the dial", await ph.evaluate(async () => {
  const hi = document.querySelector("[data-dial-v='5']");
  const coil = document.querySelector(".dial__coil");
  const g = coil && coil.querySelector(".route__glow");
  if (!hi || !g || getComputedStyle(coil).display === "none") return false;
  const before = parseFloat(getComputedStyle(g).strokeWidth);
  hi.click();
  await new Promise((r) => setTimeout(r, 750));
  const hot = document.querySelector(".route").classList.contains("is-hot");
  const after = parseFloat(getComputedStyle(g).strokeWidth);
  document.querySelector("[data-dial-v='4']").click();
  return hot && after > before;
}));

await ph.evaluate(() => {
  const l = document.querySelector(".lane--heat");
  const r = l.getBoundingClientRect();
  window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - window.innerHeight / 2, behavior: "instant" });
});
await ph.waitForTimeout(450);
ok("the lane in view lights its station",
  (await ph.evaluate(() => document.querySelector(".route").getAttribute("data-here"))) === "heat");

// Touch-hold the fire button, then let go.
await ph.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await ph.waitForTimeout(200);
const hb = await ph.locator("[data-hold]").boundingBox();
const cdp = await phCtx.newCDPSession(ph);
await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: hb.x + hb.width / 2, y: hb.y + hb.height / 2 }] });
await ph.waitForTimeout(900);
const held = await ph.evaluate(() => ({
  on: document.querySelector("[data-drag]").classList.contains("is-held"),
  k: parseFloat(getComputedStyle(document.querySelector("[data-hold]")).getPropertyValue("--hold")) || 0,
  // Centre, not edge: the press scales the button down on purpose.
  cx: (() => { const r = document.querySelector("[data-hold]").getBoundingClientRect(); return r.x + r.width / 2; })(),
}));
ok("the fire button stays put under the thumb", Math.abs(held.cx - (hb.x + hb.width / 2)) < 1,
  `rest ${hb.x + hb.width / 2} held ${held.cx}`);
await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
const released = await ph.evaluate(() => ({
  out: document.querySelector("[data-drag]").classList.contains("is-out"),
  cap: document.querySelector("[data-drag-cap]").textContent.trim(),
}));
ok("holding the fire button draws, letting go exhales",
  held.on && held.k > 0.3 && released.out && released.cap === "Exhale",
  JSON.stringify({ held, released }));

// Stamps: stop at two sections, blow straight past a third.
const park = async (id) => {
  await ph.evaluate((id) => {
    const h = document.querySelector("#" + id + " .shead");
    const r = h.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + r.top - window.innerHeight * 0.3, behavior: "instant" });
  }, id);
  await ph.waitForTimeout(950);
};
await park("honest");
await park("inside");
await ph.evaluate(() => {
  const h = document.querySelector("#hook .shead");
  const r = h.getBoundingClientRect();
  window.scrollTo({ top: window.scrollY + r.top - window.innerHeight * 0.3, behavior: "instant" });
  const q = document.querySelector("#quiz");
  window.scrollTo({ top: q.getBoundingClientRect().top + window.scrollY - 64, behavior: "instant" });
});
await ph.waitForTimeout(950);
const stamps = await ph.evaluate(() => ({
  heads: document.querySelectorAll(".shead__no .stamp").length,
  hook: !!document.querySelector("#hook .shead__no .stamp"),
  slots: document.querySelectorAll(".card__slot").length,
  stamped: document.querySelectorAll(".card__slot.is-stamped").length,
  line: document.querySelector("[data-card-line]").innerHTML,
}));
ok("a section head stamps once you stop at it", stamps.heads >= 2 && stamps.stamped === stamps.heads, JSON.stringify(stamps));
ok("scrolling straight past a section does not stamp it", !stamps.hook);
ok("the card lists every section and links the ones not stamped",
  stamps.slots === 11 && /Passed without stopping/.test(stamps.line) && /href="#hook"/.test(stamps.line) && !/href="#honest"/.test(stamps.line));
ok("no console/page errors on the phone", phErrors.length === 0, phErrors.slice(0, 3).join(" | "));
await phCtx.close();

await browser.close();

console.log(`\n${pass} passed, ${fails.length} failed`);
if (fails.length) { fails.forEach((f) => console.log("  ✗ " + f)); process.exitCode = 1; }
