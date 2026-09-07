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

  // Certainty drives the slip's top rule, so how well a claim is evidenced is
  // carried by the layout rather than by a badge you have to stop and read.
  const TONE = { high: "var(--jade)", medium: "var(--amber)", low: "var(--tx-lo)" };

  // A small, irregular set of tilts. Cycling through primes-ish offsets keeps
  // adjacent slips from ever landing on the same angle.
  // Floor of 0.6 degrees: below that a tilt across a 360px slip moves the far
  // edge under 3px and reads as anti-aliasing, not intent.
  const TILT = [-0.8, 0.65, -0.6, 0.9, -0.7, 0.6, -0.65, 0.75];

  function slip(f, i, lead) {
    const tone = TONE[f.evidence] || "var(--ink-400)";
    const tilt = lead ? 0 : TILT[i % TILT.length];
    return (
      '<article class="fact' + (lead ? " fact--lead" : "") + '"' +
      ' style="--fact-tone:' + tone + ";--fact-tilt:" + tilt + 'deg"' +
      " data-reveal>" +
      '<span class="fact__idx">' + String(i + 1).padStart(2, "0") + "</span>" +
      '<h3 class="fact__title">' + rich(f.title) + "</h3>" +
      '<div class="fact__side">' +
      '<p class="fact__body">' + rich(f.body) + "</p>" +
      (f.evidence
        ? '<span class="tag tag--' + esc(f.evidence) + '">' + esc(f.evidence) + " certainty</span>"
        : "") +
      '<span class="fact__src">' + srcLink(f.source, f.sourceUrl) + "</span>" +
      "</div></article>"
    );
  }

  /* A grid of equal boxes gives every claim the same weight and reads as a
     template. The first item is promoted to a full-width lead instead, and the
     rest flow down uneven columns so their natural lengths set the rhythm. */
  function renderFacts(sel, items) {
    const host = mount(sel);
    if (!host || !items || !items.length) return;
    const rest = items.slice(1);
    host.innerHTML =
      slip(items[0], 0, true) +
      (rest.length
        ? '<div class="facts__rest">' +
          rest.map((f, i) => slip(f, i + 1, false)).join("") +
          "</div>"
        : "");
  }

  /* --- Chemicals: the route ----------------------------------------------
     Eight chemicals in a grid say nothing about mechanism. Grouped by where
     each one enters the aerosol they become the argument itself: what you
     bought, what the coil added, and what — in fairness — is not there. A
     schematic of the device runs across the top so the three lanes read as
     stations on a route, not columns in a table. ----------------------------- */

  function spineSvg() {
    // The coil: a zigzag between the tank and the mouthpiece, drawn in on
    // reveal and then left glowing.
    const coil =
      "M490 70 L498 48 L514 92 L530 48 L546 92 L562 48 L578 92 L594 48 " +
      "L610 92 L626 48 L642 92 L658 48 L674 92 L690 48 L706 92 L714 70";

    return (
      '<svg class="route__spine" viewBox="0 0 1200 118" aria-hidden="true" focusable="false" data-reveal>' +
      '<defs><filter id="route-glow" x="-20%" y="-80%" width="140%" height="260%">' +
      '<feGaussianBlur stdDeviation="7"/></filter></defs>' +
      // Tank, with a liquid level.
      '<rect class="route__liquid" x="44" y="72" width="292" height="34"/>' +
      '<rect class="route__ink" x="40" y="30" width="300" height="80" rx="5"/>' +
      '<line class="route__ink" x1="340" y1="70" x2="470" y2="70"/>' +
      // Coil housing and the coil itself.
      '<rect class="route__ink" x="470" y="44" width="260" height="52" rx="4"/>' +
      '<path class="route__glow" d="' + coil + '"/>' +
      '<path class="route__coil" d="' + coil + '"/>' +
      '<line class="route__ink" x1="730" y1="70" x2="860" y2="70"/>' +
      // Mouthpiece, then what comes out of it.
      '<path class="route__ink" d="M860 50 L1000 58 L1000 82 L860 90 Z"/>' +
      '<g class="route__puffs">' +
      '<circle class="route__puff" cx="1036" cy="70" r="9"/>' +
      '<circle class="route__puff" cx="1070" cy="61" r="13"/>' +
      '<circle class="route__puff" cx="1110" cy="73" r="17"/>' +
      '<circle class="route__puff" cx="1156" cy="60" r="12"/>' +
      "</g>" +
      "</svg>"
    );
  }

  function renderChems(sel, items) {
    const host = mount(sel);
    if (!host || !items) return;

    const stages = D.chemStages || [];
    const byStage = {};
    items.forEach((c) => {
      (byStage[c.stage] = byStage[c.stage] || []).push(c);
    });

    const chem = (c, i) =>
      '<div class="chem" style="--chem-tilt:' + TILT[(i + 3) % TILT.length] + 'deg" data-reveal>' +
      '<span class="chem__formula">' + esc(c.formula) + "</span>" +
      '<h4 class="chem__name">' + esc(c.name) + "</h4>" +
      '<p class="chem__what">' + rich(c.what) + "</p>" +
      '<p class="chem__also"><b>' + esc(c.alsoIn) + "</b></p>" +
      "</div>";

    host.innerHTML =
      spineSvg() +
      '<div class="route__lanes">' +
      stages
        .map((st, n) => {
          const list = byStage[st.key] || [];
          return (
            '<section class="lane lane--' + esc(st.key) + '" aria-labelledby="lane-' + esc(st.key) + '">' +
            '<header class="lane__head" data-reveal>' +
            '<span class="lane__no">Stage ' + (n + 1) + " / " + stages.length + "</span>" +
            '<h3 class="lane__title" id="lane-' + esc(st.key) + '">' + esc(st.title) + "</h3>" +
            '<p class="lane__sub">' + esc(st.sub) + "</p>" +
            "</header>" +
            '<div class="lane__slips">' + list.map(chem).join("") + "</div>" +
            "</section>"
          );
        })
        .join("") +
      "</div>";
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
