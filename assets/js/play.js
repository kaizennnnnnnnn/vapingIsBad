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

    /* Sound, opt in. Nothing here plays until the toggle is pressed, and the
       toggle is the gesture that unlocks the audio context. The sizzle is
       filtered noise with a handful of pops through it; no audio file. */
    const soundBtn = dial.querySelector("[data-dial-sound]");
    const soundState = dial.querySelector("[data-dial-sound-state]");
    let soundOn = false;
    let ac = null;
    let master = null; // every source goes through this, so "off" is off
    let popBuf = null;

    function audio() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ac) {
        ac = new AC();
        master = ac.createGain();
        master.connect(ac.destination);
      }
      if (ac.state === "suspended") ac.resume().catch(() => {});
      return ac;
    }

    function open(ctx) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(1, now);
      return now;
    }

    function noise(ctx, secs) {
      const n = Math.floor(ctx.sampleRate * secs);
      const buf = ctx.createBuffer(1, n, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      return buf;
    }

    function hush() {
      if (!ac || !master) return;
      const now = ac.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    }

    function sizzle() {
      const ctx = audio();
      if (!ctx) return;
      const now = open(ctx);

      const src = ctx.createBufferSource();
      src.buffer = noise(ctx, 2.3);
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 900;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 2600;
      bp.Q.value = 0.6;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.07);
      gain.gain.setValueAtTime(0.3, now + 0.55);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.1);
      src.connect(hp).connect(bp).connect(gain).connect(master);
      src.start(now);
      src.stop(now + 2.2);

      // The pops: the liquid spitting on the coil.
      if (!popBuf) popBuf = noise(ctx, 0.05);
      for (let i = 0; i < 14; i++) {
        const at = now + 0.06 + Math.random() * 1.5;
        const pop = ctx.createBufferSource();
        pop.buffer = popBuf;
        const pg = ctx.createGain();
        pg.gain.setValueAtTime(0.14 + Math.random() * 0.2, at);
        pg.gain.exponentialRampToValueAtTime(0.0001, at + 0.03);
        pop.connect(pg).connect(master);
        pop.start(at);
        pop.stop(at + 0.05);
      }
    }

    function tick() {
      const ctx = audio();
      if (!ctx) return;
      const now = open(ctx);
      if (!popBuf) popBuf = noise(ctx, 0.05);
      const src = ctx.createBufferSource();
      src.buffer = popBuf;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 3000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.16, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      src.connect(hp).connect(g).connect(master);
      src.start(now);
      src.stop(now + 0.05);
    }

    if (soundBtn) {
      soundBtn.addEventListener("click", () => {
        soundOn = !soundOn;
        soundBtn.setAttribute("aria-pressed", soundOn ? "true" : "false");
        if (soundState) soundState.textContent = soundOn ? "on" : "off";
        if (!soundOn) { hush(); return; }
        // Turning it on while the coil is already hot should be audible.
        if (route && route.classList.contains("is-hot")) sizzle();
        else audio();
      });
    }

    function setStop(v) {
      const s = STOPS[v];
      if (!s) return;
      if (route) route.classList.toggle("is-hot", v === "5");
      if (soundOn) (v === "5" ? sizzle : tick)();
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

  /* --- 2b. The lane in view lights its station ----------------------------
     On a phone the lanes stack, so exactly one is "here" at a time and the
     station pinned beside it can respond. On desktop the three lanes sit
     side by side and would all be here at once, so this only runs narrow;
     hover does the job there. */

  const routeEl = document.querySelector(".route");
  const lanes = routeEl ? Array.prototype.slice.call(routeEl.querySelectorAll(".lane")) : [];
  if (routeEl && lanes.length && "IntersectionObserver" in window) {
    const narrow = window.matchMedia("(max-width: 899.98px)");
    let hereIo = null;

    const keyOf = (lane) => {
      const m = /lane--([a-z]+)/.exec(lane.className);
      return m ? m[1] : "";
    };

    const start = () => {
      if (hereIo) return;
      hereIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            const key = keyOf(e.target);
            if (e.isIntersecting) routeEl.setAttribute("data-here", key);
            else if (routeEl.getAttribute("data-here") === key) routeEl.removeAttribute("data-here");
          });
        },
        { rootMargin: "-38% 0px -42% 0px" }
      );
      lanes.forEach((l) => hereIo.observe(l));
    };

    const stop = () => {
      if (!hereIo) return;
      hereIo.disconnect();
      hereIo = null;
      routeEl.removeAttribute("data-here");
    };

    const sync = () => (narrow.matches ? start() : stop());
    if (narrow.addEventListener) narrow.addEventListener("change", sync);
    else if (narrow.addListener) narrow.addListener(sync);
    sync();
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
