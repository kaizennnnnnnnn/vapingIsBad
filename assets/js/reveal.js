/* ==========================================================================
   reveal.js — scroll progress, sticky masthead, reveal-on-enter, bar fills
   No dependencies. Everything degrades to "visible" if JS is off.
   ========================================================================== */

(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Reading progress -------------------------------------------------- */

  const bar = document.querySelector("[data-progress]");
  const mast = document.querySelector("[data-masthead]");

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (bar) bar.style.width = pct.toFixed(2) + "%";
      if (mast) mast.classList.toggle("is-stuck", window.scrollY > 40);
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* --- Reveal on enter ---------------------------------------------------- */

  const revealables = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window) || reduced) {
    revealables.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );

    revealables.forEach((el, i) => {
      // Stagger siblings inside the same parent so groups cascade.
      const sibs = el.parentElement
        ? Array.prototype.filter.call(
            el.parentElement.children,
            (c) => c.hasAttribute && c.hasAttribute("data-reveal")
          )
        : [];
      const idx = sibs.indexOf(el);
      if (idx > 0) el.style.setProperty("--reveal-delay", Math.min(idx, 6) * 70 + "ms");
      io.observe(el);
    });
  }

  /* --- Bars animate to their data-pct on entry ---------------------------- */

  const barFills = document.querySelectorAll("[data-bar]");

  function fill(el) {
    el.style.width = (el.getAttribute("data-bar") || "0") + "%";
  }

  if (!("IntersectionObserver" in window)) {
    barFills.forEach(fill);
  } else {
    const bio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          fill(e.target);
          bio.unobserve(e.target);
        });
      },
      { threshold: 0.3 }
    );
    barFills.forEach((el, i) => {
      el.style.setProperty("--bar-delay", Math.min(i, 8) * 90 + "ms");
      bio.observe(el);
    });
  }

  /* --- Timeline dots ------------------------------------------------------ */

  const tls = document.querySelectorAll(".tl");
  if ("IntersectionObserver" in window && tls.length) {
    const tio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.target.classList.toggle("is-in", e.isIntersecting));
      },
      { rootMargin: "-35% 0px -35% 0px" }
    );
    tls.forEach((el) => tio.observe(el));
  }

  /* --- Myth disclosures (animated height, not <details> jank) ------------- */

  document.querySelectorAll("[data-disclosure]").forEach((root) => {
    const btn = root.querySelector(".disclosure__btn");
    const panel = root.querySelector(".disclosure__panel");
    if (!btn || !panel) return;

    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => {
      const open = root.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* --- Count-up for hero-scale figures ------------------------------------ */

  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !reduced) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          cio.unobserve(el);
          const target = parseFloat(el.getAttribute("data-count"));
          const dp = parseInt(el.getAttribute("data-count-dp") || "0", 10);
          const dur = 1200;
          const start = performance.now();
          const step = (now) => {
            const t = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = (target * eased).toLocaleString(undefined, {
              minimumFractionDigits: dp,
              maximumFractionDigits: dp,
            });
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  }
})();
