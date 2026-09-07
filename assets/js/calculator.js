/* ==========================================================================
   calculator.js — "what it actually costs" engine
   Reads presets from window.VB.money. Recomputes on every input change.
   Three readouts: spend, nicotine load, and the compounding cost of keeping it.
   ========================================================================== */

(function () {
  "use strict";

  const D = window.VB && window.VB.money;
  if (!D) return;

  const root = document.querySelector("[data-calc]");
  if (!root) return;

  const $ = (sel) => root.querySelector(sel);
  const $$ = (sel) => Array.prototype.slice.call(root.querySelectorAll(sel));

  const el = {
    currency: $("[data-c-currency]"),
    modes: $$("[data-c-mode]"),
    unitRange: $("[data-c-units]"),
    unitOut: $("[data-c-units-out]"),
    unitLabel: $("[data-c-units-label]"),
    price: $("[data-c-price]"),
    priceLabel: $("[data-c-price-label]"),
    priceSymbol: $("[data-c-symbol]"),
    strength: $("[data-c-strength]"),
    ml: $("[data-c-ml]"),
    mlLabel: $("[data-c-ml-label]"),
    heroVal: $("[data-c-monthly]"),
    heroSub: $("[data-c-monthly-sub]"),
    cells: {
      day: $("[data-c-day]"),
      week: $("[data-c-week]"),
      year: $("[data-c-year]"),
      five: $("[data-c-five]"),
    },
    swaps: $("[data-c-swaps]"),
    nic: {
      mg: $("[data-c-nic-mg]"),
      ml: $("[data-c-nic-ml]"),
      cigs: $("[data-c-nic-cigs]"),
      note: $("[data-c-nic-note]"),
    },
    chart: $("[data-c-chart]"),
    chartNote: $("[data-c-chart-note]"),
    horizon: $("[data-c-horizon]"),
  };

  const state = {
    currency: D.defaultCurrency,
    mode: "disposable",
    units: 0,
    price: 0,
    ml: 2,
    strength: 20,
    horizon: 10,
  };

  /* --- helpers ----------------------------------------------------------- */

  const cur = () => D.currencies[state.currency];
  const mode = () => D.modes[state.mode];

  function fmt(n, dp) {
    const c = cur();
    const digits = dp === undefined ? (n < 10 ? 2 : 0) : dp;
    const body = Math.abs(n).toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    return c.symbolAfter ? body + " " + c.symbol : c.symbol + body;
  }

  function fmtCompact(n) {
    if (n >= 1000000) return fmt(Math.round(n / 100000) / 10, 1).replace(/\.0$/, "") + "M";
    return fmt(n, 0);
  }

  /* --- the maths ---------------------------------------------------------- */

  function compute() {
    const weekly = state.units * state.price;
    const daily = weekly / 7;
    const monthly = (weekly * 52) / 12;
    const yearly = weekly * 52;

    // Nicotine comes from the volume actually consumed, not from the puff count
    // printed on the box — claimed puff ratings are marketing, and measured
    // real-world use is an order of magnitude below them.
    const mlPerDay = (state.units * state.ml) / 7;
    const nicMgPerDay = mlPerDay * state.strength;
    const cigEq = nicMgPerDay / D.nicotineMgPerCigaretteEquivalent;

    return { daily, weekly, monthly, yearly, mlPerDay, nicMgPerDay, cigEq };
  }

  /* --- compounding -------------------------------------------------------- */

  function projection(monthly, years, rate) {
    const r = rate / 12;
    const out = [];
    for (let y = 0; y <= years; y++) {
      const n = y * 12;
      const invested = r === 0 ? monthly * n : monthly * ((Math.pow(1 + r, n) - 1) / r);
      out.push({ year: y, spent: monthly * n, invested });
    }
    return out;
  }

  function drawChart(series) {
    const svg = el.chart;
    if (!svg) return;

    const W = 640;
    const H = 260;
    const padL = 54;
    const padR = 14;
    const padT = 14;
    const padB = 30;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;

    // Round the axis up to a human number (1/2/2.5/5 x 10^n) so the ticks
    // read as $40,000 rather than $45,002.
    const raw = Math.max(series[series.length - 1].invested, 1);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const niceMax = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10]
      .map((m) => m * mag)
      .find((v) => v >= raw) || raw;
    const maxV = niceMax;
    const x = (i) => padL + (i / (series.length - 1)) * innerW;
    const y = (v) => padT + innerH - (v / maxV) * innerH;

    const path = (key) =>
      series.map((d, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(d[key]).toFixed(1)).join(" ");

    const area =
      path("invested") +
      " L " + x(series.length - 1).toFixed(1) + " " + (padT + innerH) +
      " L " + x(0).toFixed(1) + " " + (padT + innerH) + " Z";

    const gridVals = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxV);

    const grid = gridVals
      .map((v) => {
        const yy = y(v).toFixed(1);
        return (
          '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + yy + '" y2="' + yy + '"/>' +
          '<text class="chart__tick" x="' + (padL - 8) + '" y="' + (parseFloat(yy) + 3.5) +
          '" text-anchor="end">' + fmtCompact(v) + "</text>"
        );
      })
      .join("");

    const xticks = series
      .filter((d, i) => i === 0 || d.year % Math.ceil(series.length / 6) === 0 || i === series.length - 1)
      .map((d) => {
        const i = series.indexOf(d);
        return (
          '<text class="chart__tick" x="' + x(i).toFixed(1) + '" y="' + (H - 10) +
          '" text-anchor="middle">' + (d.year === 0 ? "now" : d.year + "y") + "</text>"
        );
      })
      .join("");

    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.innerHTML =
      '<g class="chart__grid">' + grid + "</g>" +
      '<path class="chart__area" d="' + area + '"/>' +
      '<path class="chart__spent" d="' + path("spent") + '"/>' +
      '<path class="chart__line" d="' + path("invested") + '"/>' +
      xticks;
  }

  /* --- render -------------------------------------------------------------- */

  function render() {
    const r = compute();
    const m = mode();
    const c = cur();

    if (el.heroVal) el.heroVal.textContent = fmt(r.monthly, r.monthly < 100 ? 2 : 0);
    if (el.heroSub) {
      el.heroSub.textContent =
        r.monthly > 0
          ? "That is " + fmt(r.yearly, 0) + " a year, and " + fmt(r.yearly * 5, 0) + " over five years."
          : "Move the slider to see it.";
    }

    if (el.cells.day) el.cells.day.textContent = fmt(r.daily, 2);
    if (el.cells.week) el.cells.week.textContent = fmt(r.weekly, r.weekly < 100 ? 2 : 0);
    if (el.cells.year) el.cells.year.textContent = fmt(r.yearly, 0);
    if (el.cells.five) el.cells.five.textContent = fmt(r.yearly * 5, 0);

    if (el.nic.mg) el.nic.mg.textContent = r.nicMgPerDay.toFixed(r.nicMgPerDay < 10 ? 1 : 0);
    if (el.nic.ml) el.nic.ml.textContent = r.mlPerDay.toFixed(r.mlPerDay < 10 ? 1 : 0);
    if (el.nic.cigs) el.nic.cigs.textContent = r.cigEq.toFixed(r.cigEq < 10 ? 1 : 0);
    if (el.nic.note) el.nic.note.textContent = D.nicotineNote || "";

    if (el.mlLabel) el.mlLabel.textContent = m.mlQuestion;
    if (el.unitOut) el.unitOut.textContent = state.units + " " + (state.units === 1 ? m.unitSingular : m.unitPlural);
    if (el.unitLabel) el.unitLabel.textContent = m.unitQuestion;
    if (el.priceLabel) el.priceLabel.textContent = m.priceQuestion;
    if (el.priceSymbol) el.priceSymbol.textContent = c.symbol;

    // Swaps — what a year of this buys instead
    if (el.swaps) {
      const yearLocal = r.yearly;
      el.swaps.innerHTML = D.swaps
        .map((s) => {
          const price = s.price[state.currency] != null ? s.price[state.currency] : s.price[D.defaultCurrency];
          const n = price > 0 ? yearLocal / price : 0;
          if (n < 0.08) return "";
          const shown = n >= 10 ? Math.round(n).toLocaleString() : n >= 1 ? n.toFixed(1).replace(/\.0$/, "") : n.toFixed(2);
          return (
            '<div class="swap"><span>' + s.label + "</span>" +
            '<span class="swap__n">' + shown + "&times;</span></div>"
          );
        })
        .join("");
    }

    const series = projection(r.monthly, state.horizon, D.investmentReturn);
    drawChart(series);

    if (el.chartNote) {
      const last = series[series.length - 1];
      el.chartNote.textContent =
        r.monthly > 0
          ? "Redirect " + fmt(r.monthly, 0) + "/month into an index fund at " +
            Math.round(D.investmentReturn * 100) + "% a year and after " + state.horizon +
            " years you would be holding about " + fmt(last.invested, 0) + " — of which " +
            fmt(last.invested - last.spent, 0) + " is growth you got for free. Spent on vapes, it is " +
            fmt(last.spent, 0) + " gone."
          : "";
    }
  }

  /* --- wiring -------------------------------------------------------------- */

  function applyModeDefaults() {
    const m = mode();
    const c = cur();
    const preset = m.price[state.currency] != null ? m.price[state.currency] : m.price[D.defaultCurrency];
    state.price = preset;
    state.units = m.defaultUnits;
    if (el.price) el.price.value = preset;

    const mlPreset = m.ml[state.currency] != null ? m.ml[state.currency] : m.ml[D.defaultCurrency];
    state.ml = mlPreset;
    if (el.ml) el.ml.value = mlPreset;
    if (el.unitRange) {
      el.unitRange.min = m.min;
      el.unitRange.max = m.max;
      el.unitRange.step = m.step;
      el.unitRange.value = m.defaultUnits;
    }
    void c;
  }

  if (el.currency) {
    el.currency.innerHTML = Object.keys(D.currencies)
      .map((k) => '<option value="' + k + '">' + D.currencies[k].label + "</option>")
      .join("");
    el.currency.value = state.currency;
    el.currency.addEventListener("change", () => {
      state.currency = el.currency.value;
      applyModeDefaults();
      render();
    });
  }

  el.modes.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.mode = btn.getAttribute("data-c-mode");
      el.modes.forEach((b) =>
        b.setAttribute("aria-pressed", b === btn ? "true" : "false")
      );
      applyModeDefaults();
      render();
    });
  });

  if (el.unitRange) {
    el.unitRange.addEventListener("input", () => {
      state.units = parseFloat(el.unitRange.value);
      render();
    });
  }

  if (el.price) {
    el.price.addEventListener("input", () => {
      const v = parseFloat(el.price.value);
      state.price = isNaN(v) || v < 0 ? 0 : v;
      render();
    });
  }

  if (el.ml) {
    el.ml.addEventListener("input", () => {
      const v = parseFloat(el.ml.value);
      state.ml = isNaN(v) || v < 0 ? 0 : v;
      render();
    });
  }

  if (el.strength) {
    el.strength.addEventListener("change", () => {
      state.strength = parseFloat(el.strength.value);
      render();
    });
  }

  if (el.horizon) {
    el.horizon.addEventListener("input", () => {
      state.horizon = parseInt(el.horizon.value, 10);
      const out = root.querySelector("[data-c-horizon-out]");
      if (out) out.textContent = state.horizon + " years";
      render();
    });
  }

  // Guess a sensible currency from the browser locale so the first number
  // she sees is already in her own money.
  (function guessCurrency() {
    try {
      const region = (navigator.language || "en-US").split("-")[1];
      const map = D.regionToCurrency || {};
      if (region && map[region] && D.currencies[map[region]]) {
        state.currency = map[region];
        if (el.currency) el.currency.value = state.currency;
      }
    } catch (e) {
      /* locale unavailable — keep the default */
    }
  })();

  applyModeDefaults();
  if (el.strength) state.strength = parseFloat(el.strength.value);
  render();
})();
