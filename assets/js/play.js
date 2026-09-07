/* ==========================================================================
   play.js — the parts of the page you operate rather than read.

   1. Myths become a guess-first game: call it before the answer appears.
   2. A two-position dial re-runs the formaldehyde experiment at both
      voltages, so the reader discovers the headline artefact themselves.
   3. The recovery timeline's spine fills as you scroll through it.

   Everything degrades: with JS off the myths are plain disclosures, the
   dial is absent from the markup, and the spine is simply full.
   ========================================================================== */

(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- 1. Call it before you look ---------------------------------------- */

  const discs = Array.prototype.slice.call(
    document.querySelectorAll("[data-disclosure]")
  );

  if (discs.length) {
    const tally = document.querySelector("[data-myth-tally]");
    let asked = 0;
    let right = 0;

    const updateTally = () => {
      if (!tally) return;
      tally.textContent = asked
        ? "You have called " + right + " of " + asked + " correctly."
        : "";
      tally.hidden = !asked;
    };
    updateTally();

    discs.forEach((disc) => {
      const reality = disc.querySelector(".disclosure__reality");
      const verdictEl = disc.querySelector(".disclosure__verdict");
      const inner = disc.querySelector(".disclosure__inner");
      if (!reality || !verdictEl || !inner) return;

      const verdict = verdictEl.textContent.trim().toLowerCase();
      // Only "Partly true" is ambiguous; everything else on this page is a
      // flat False, so calling it False is the correct answer.
      const partly = verdict.indexOf("partly") === 0;
      const answerIsTrue = verdict === "true";

      const guess = document.createElement("div");
      guess.className = "guess";
      guess.innerHTML =
        '<span class="guess__q">Call it before you look</span>' +
        '<span class="guess__row">' +
        '<button class="guess__b" type="button" data-g="t">True</button>' +
        '<button class="guess__b" type="button" data-g="f">False</button>' +
        '<button class="guess__skip" type="button" data-g="skip">Just show me</button>' +
        "</span>";

      inner.insertBefore(guess, reality);
      reality.hidden = true;

      guess.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-g]");
        if (!btn) return;
        const choice = btn.getAttribute("data-g");

        reality.hidden = false;

        if (choice === "skip") {
          guess.remove();
          return;
        }

        const saidTrue = choice === "t";
        const correct = partly ? null : saidTrue === answerIsTrue;

        asked++;
        if (correct !== false) right += correct === null ? 0 : 1;
        if (partly) asked--; // don't score the two genuine "it depends" entries
        updateTally();

        guess.classList.add("is-done");
        guess.innerHTML =
          '<span class="guess__result' +
          (correct === false ? " is-wrong" : correct === true ? " is-right" : "") +
          '">' +
          (partly
            ? "Fair either way — this one is genuinely both."
            : correct
            ? "You called it."
            : "Not this time.") +
          "</span>";
      });
    });
  }

  /* --- 2. The dial that makes the headline ------------------------------- */

  const dial = document.querySelector("[data-dial]");
  if (dial) {
    const STOPS = {
      "4": {
        ug: 20,
        note:
          "This is a device set the way people actually run one. The famous " +
          "headline was not measured here.",
      },
      "5": {
        ug: 718,
        note:
          "Thirty-six times higher — and a setting that produces a puff so " +
          "acrid testers spit it out. This is where the headline came from.",
      },
    };
    const MAX = 718;

    const nEl = dial.querySelector("[data-dial-n]");
    const barEl = dial.querySelector("[data-dial-bar]");
    const noteEl = dial.querySelector("[data-dial-note]");
    const btns = Array.prototype.slice.call(dial.querySelectorAll("[data-dial-v]"));

    // The schematic above is the same coil. Turning the dial up runs it hot.
    const route = document.querySelector(".route");

    function setStop(v) {
      const s = STOPS[v];
      if (!s) return;
      if (route) route.classList.toggle("is-hot", v === "5");
      btns.forEach((b) =>
        b.setAttribute("aria-pressed", b.getAttribute("data-dial-v") === v ? "true" : "false")
      );
      if (barEl) barEl.style.width = ((s.ug / MAX) * 100).toFixed(1) + "%";
      if (noteEl) noteEl.textContent = s.note;
      if (!nEl) return;

      if (reduced) {
        nEl.textContent = s.ug.toLocaleString();
        return;
      }
      // Count to the new value so the 36x gap is felt rather than just read.
      const from = parseFloat(String(nEl.textContent).replace(/,/g, "")) || 0;
      const start = performance.now();
      const dur = 620;
      const step = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        nEl.textContent = Math.round(from + (s.ug - from) * eased).toLocaleString();
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    btns.forEach((b) =>
      b.addEventListener("click", () => setStop(b.getAttribute("data-dial-v")))
    );
    setStop("4");
  }

  /* --- 3. The spine fills as you go -------------------------------------- */

  const timeline = document.querySelector(".timeline");
  if (timeline && !reduced) {
    let ticking = false;

    const update = () => {
      ticking = false;
      const r = timeline.getBoundingClientRect();
      const h = window.innerHeight;
      // 0 when the list's top reaches the middle of the screen, 1 when its
      // bottom does — so the fill tracks the item you are actually reading.
      const total = r.height;
      if (total <= 0) return;
      const p = (h * 0.5 - r.top) / total;
      timeline.style.setProperty(
        "--tl-progress",
        (Math.max(0, Math.min(1, p)) * 100).toFixed(2) + "%"
      );
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", update);
    update();
  }
})();
