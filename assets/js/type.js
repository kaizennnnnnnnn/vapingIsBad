/* ==========================================================================
   type.js — the display face, made responsive to the reader.

   Two effects, and both are the font doing the work rather than a transform:
   Bricolage Grotesque carries a real width axis, so characters near the
   cursor are genuinely redrawn wider instead of being scaled and smeared.

   1. Cursor proximity widens characters in a display heading.
   2. The struck-out word in the headline cycles, redrawing the strike.

   Neither runs under prefers-reduced-motion, and the character split is
   skipped entirely on coarse pointers — a phone gets clean, unsplit markup.
   ========================================================================== */

(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;

  /* --- 1. Cursor-reactive width ------------------------------------------ */

  const BASE = 84;   // matches font-stretch in base.css
  const PEAK = 100;  // the top of Bricolage's wdth axis
  const RADIUS = 150;

  function splitChars(root) {
    // Walk text nodes only, so <em> and the strike span survive intact.
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        // The cycling word rewrites its own textContent, which would blow
        // away any spans we put inside it.
        if (node.parentElement.closest(".is-struck")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const texts = [];
    let n;
    while ((n = walker.nextNode())) texts.push(n);

    const chars = [];
    texts.forEach((node) => {
      const frag = document.createDocumentFragment();
      for (const c of node.nodeValue) {
        if (c === " " || c === "\n") {
          frag.appendChild(document.createTextNode(c));
          continue;
        }
        const s = document.createElement("span");
        s.className = "ch";
        s.textContent = c;
        frag.appendChild(s);
        chars.push(s);
      }
      node.parentNode.replaceChild(frag, node);
    });
    return chars;
  }

  if (fine && !reduced) {
    document.querySelectorAll(".display").forEach((head) => {
      // The heading's accessible name is computed from its content, which we
      // are about to shred into one span per glyph. Pin the name first.
      const label = head.textContent.replace(/\s+/g, " ").trim();
      if (label) head.setAttribute("aria-label", label);

      const chars = splitChars(head);
      if (!chars.length) return;

      let rects = null;
      let raf = 0;
      let mx = 0;
      let my = 0;

      const measure = () => {
        rects = chars.map((c) => {
          const r = c.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        });
      };

      const frame = () => {
        raf = 0;
        if (!rects) return;
        for (let i = 0; i < chars.length; i++) {
          const p = rects[i];
          const dx = p.x - mx;
          const dy = p.y - my;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > RADIUS) {
            chars[i].style.fontStretch = "";
            continue;
          }
          let k = 1 - d / RADIUS;
          k = k * k * (3 - 2 * k); // smoothstep, so the bulge has soft shoulders
          chars[i].style.fontStretch = (BASE + k * (PEAK - BASE)).toFixed(1) + "%";
        }
      };

      head.addEventListener("pointerenter", (e) => {
        if (e.pointerType === "touch") return;
        measure();
      });

      head.addEventListener(
        "pointermove",
        (e) => {
          if (e.pointerType === "touch" || !rects) return;
          mx = e.clientX;
          my = e.clientY;
          if (!raf) raf = requestAnimationFrame(frame);
        },
        { passive: true }
      );

      head.addEventListener("pointerleave", () => {
        rects = null;
        chars.forEach((c) => (c.style.fontStretch = ""));
      });

      // Rects are viewport-relative and this heading may be mid-scroll.
      window.addEventListener("scroll", () => { if (rects) measure(); }, { passive: true });
    });
  }

  /* --- 2. The cycling strike --------------------------------------------- */

  const struck = document.querySelector("[data-words]");
  if (!struck) return;

  const words = struck
    .getAttribute("data-words")
    .split("|")
    .map((w) => w.trim())
    .filter(Boolean);

  if (words.length < 2 || reduced) return;

  // Hand control over from the CSS keyframe to a transition we can replay.
  struck.classList.add("is-live");
  let i = 0;
  let timer = 0;
  let visible = true;

  const draw = () => struck.classList.add("is-cut");
  const clear = () => struck.classList.remove("is-cut");

  setTimeout(draw, 700);

  function cycle() {
    if (!visible) return;
    clear();
    timer = window.setTimeout(() => {
      i = (i + 1) % words.length;
      struck.textContent = words[i];
      draw();
      timer = window.setTimeout(cycle, 3200);
    }, 560);
  }

  timer = window.setTimeout(cycle, 3900);

  // Nothing to animate once the headline has scrolled away.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (!visible) {
          clearTimeout(timer);
        } else if (!timer) {
          timer = window.setTimeout(cycle, 1200);
        }
      },
      { threshold: 0 }
    ).observe(struck);
  }
})();
