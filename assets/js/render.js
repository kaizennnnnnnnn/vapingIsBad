/* ==========================================================================
   render.js — turns the data layer in data.js into the markup the CSS expects.
   Every list on the page (chemicals, myths, timeline, facts, resources,
   sources) is rendered from one place so content can be edited without
   touching index.html.
   ========================================================================== */

(function () {
  "use strict";

  const D = window.VB;
  if (!D) return;

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  // Authored copy may use **bold**, *italic*, or literal <strong>/<em>.
  // Everything is escaped first, then that narrow whitelist is restored —
  // the content in data.js is authored, but escaping by default keeps this
  // safe if it ever renders anything that isn't.
  const rich = (s) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/&lt;(\/?)(strong|em|b|i)&gt;/g, "<$1$2>");

  const mount = (sel) => document.querySelector(sel);

  const srcLink = (name, url) =>
    url
      ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(name) + "</a>"
      : esc(name);

  /* --- Facts grid --------------------------------------------------------- */

  function renderFacts(sel, items) {
    const host = mount(sel);
    if (!host || !items) return;
    host.innerHTML = items
      .map(
        (f, i) =>
          '<article class="fact" data-reveal>' +
          '<span class="fact__idx">' + String(i + 1).padStart(2, "0") + "</span>" +
          '<h3 class="fact__title">' + rich(f.title) + "</h3>" +
          '<p class="fact__body">' + rich(f.body) + "</p>" +
          (f.evidence
            ? '<span class="tag tag--' + esc(f.evidence) + '">' + esc(f.evidence) + " certainty</span>"
            : "") +
          '<span class="fact__src">' + srcLink(f.source, f.sourceUrl) + "</span>" +
          "</article>"
      )
      .join("");
  }

  /* --- Chemicals ---------------------------------------------------------- */

  function renderChems(sel, items) {
    const host = mount(sel);
    if (!host || !items) return;
    host.innerHTML = items
      .map(
        (c) =>
          '<div class="chem" tabindex="0" data-reveal>' +
          '<span class="chem__formula">' + esc(c.formula) + "</span>" +
          '<h3 class="chem__name">' + esc(c.name) + "</h3>" +
          '<p class="chem__what">' + rich(c.what) + "</p>" +
          '<p class="chem__also"><b>' + esc(c.alsoIn) + "</b></p>" +
          "</div>"
      )
      .join("");
  }

  /* --- Myths -------------------------------------------------------------- */

  function renderMyths(sel, items) {
    const host = mount(sel);
    if (!host || !items) return;
    host.innerHTML = items
      .map(
        (m, i) =>
          '<div class="disclosure" data-disclosure data-reveal>' +
          '<button class="disclosure__btn" type="button" aria-controls="myth-' + i + '">' +
          '<span class="disclosure__myth">' + esc(m.myth) + "</span>" +
          '<span class="disclosure__sign" aria-hidden="true"></span>' +
          "</button>" +
          '<div class="disclosure__panel" id="myth-' + i + '"><div class="disclosure__inner">' +
          '<div class="disclosure__reality">' +
          '<span class="disclosure__verdict' +
          (m.verdict === "Partly true" ? " disclosure__verdict--part" : "") +
          '">' + esc(m.verdict || "False") + "</span>" +
          rich(m.reality) +
          '<span class="quiz__src">' + srcLink(m.source, m.sourceUrl) + "</span>" +
          "</div></div></div></div>"
      )
      .join("");
  }

  /* --- Recovery timeline -------------------------------------------------- */

  function renderTimeline(sel, items) {
    const host = mount(sel);
    if (!host || !items) return;
    host.innerHTML = items
      .map(
        (t) =>
          '<li class="tl" style="--tl-color:var(--' + esc(t.tone || "jade") + ')" data-reveal>' +
          '<span class="tl__dot" aria-hidden="true"></span>' +
          '<span class="tl__when">' + esc(t.when) + "</span>" +
          '<h3 class="tl__what">' + rich(t.what) + "</h3>" +
          '<p class="tl__note">' + rich(t.note) + "</p>" +
          (t.source ? '<span class="tl__src">' + srcLink(t.source, t.sourceUrl) + "</span>" : "") +
          "</li>"
      )
      .join("");
  }

  /* --- Comparison bars ---------------------------------------------------- */

  function renderBars(sel, chart) {
    const host = mount(sel);
    if (!host || !chart) return;
    const max = Math.max.apply(null, chart.points.map((p) => p.value));
    host.innerHTML = chart.points
      .map(
        (p) =>
          "<li>" +
          '<div class="bar__head">' +
          '<span class="bar__label">' + rich(p.label) + "</span>" +
          '<span class="bar__value">' + esc(p.display || p.value.toLocaleString()) + " " + esc(chart.unit) + "</span>" +
          "</div>" +
          '<div class="bar__track"><div class="bar__fill' +
          (p.tone ? " bar__fill--" + esc(p.tone) : "") +
          '" data-bar="' + ((p.value / max) * 100).toFixed(1) + '"></div></div>' +
          "</li>"
      )
      .join("");
  }

  /* --- Resources ---------------------------------------------------------- */

  function renderResources(sel, items) {
    const host = mount(sel);
    if (!host || !items) return;
    host.innerHTML = items
      .map(
        (r) =>
          '<a class="res__item" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer" data-reveal>' +
          '<span class="res__where">' + esc(r.where) + "</span>" +
          '<h3 class="res__name">' + esc(r.name) + "</h3>" +
          '<p class="res__what">' + rich(r.what) + "</p>" +
          (r.how ? '<span class="res__how">' + esc(r.how) + "</span>" : "") +
          "</a>"
      )
      .join("");
  }

  /* --- Sources ------------------------------------------------------------ */

  function renderSources(sel, items) {
    const host = mount(sel);
    if (!host || !items) return;
    host.innerHTML = items
      .map(
        (s, i) =>
          "<li>" +
          '<span class="sources__n">' + String(i + 1).padStart(2, "0") + "</span>" +
          srcLink(s.title, s.url) +
          (s.note ? " — " + esc(s.note) : "") +
          "</li>"
      )
      .join("");
  }

  /* --- Image credits ------------------------------------------------------ */

  function renderCredits(sel, items) {
    const host = mount(sel);
    if (!host || !items || !items.length) return;
    host.innerHTML = items
      .map((c) => "<li>" + srcLink(c.title, c.url) + " — " + esc(c.credit) + "</li>")
      .join("");
  }

  /* --- Boot --------------------------------------------------------------- */

  renderFacts("[data-r-facts-body]", D.bodyFacts);
  renderFacts("[data-r-facts-head]", D.headFacts);
  renderFacts("[data-r-facts-visible]", D.visibleFacts);
  renderChems("[data-r-chems]", D.chemicals);
  renderMyths("[data-r-myths]", D.myths);
  renderTimeline("[data-r-timeline]", D.recovery);
  renderBars("[data-r-bars-nicotine]", D.nicotineChart);
  renderBars("[data-r-bars-prevalence]", D.prevalenceChart);
  renderResources("[data-r-resources]", D.resources);
  renderSources("[data-r-sources]", D.sources);
  renderCredits("[data-r-credits]", D.imageCredits);
})();
