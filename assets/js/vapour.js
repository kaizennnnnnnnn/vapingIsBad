/* ==========================================================================
   vapour.js — the aerosol layer.

   This is not decoration. The page argues that the damage is reversible, so
   the vapour on the page behaves the same way: it is thick over the hero,
   churns through the sections about what is in it, and thins to almost
   nothing by the time you reach "what happens when you stop". Scrolling
   drags it, the cursor pushes it, and it parts around the text: a feathered
   hole is cleared beneath every band-level text block each frame, so the
   contrast under a paragraph does not depend on where the smoke happens to be.

   No dependencies. Everything below degrades to a single static frame under
   prefers-reduced-motion, and to nothing at all if canvas is unavailable.
   ========================================================================== */

(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const canvas = document.createElement("canvas");
  canvas.className = "vapour";
  canvas.setAttribute("aria-hidden", "true");

  const ctx = canvas.getContext && canvas.getContext("2d");
  if (!ctx) return;

  document.body.appendChild(canvas);

  /* --- Config ------------------------------------------------------------ */

  const SPRITE = 256;          // px of the pre-rendered puff
  const RISE = 0.16;           // baseline upward drift, px/frame at 60fps
  const PARALLAX = 0.22;       // how much of the scroll delta the field takes
  const CURSOR_R = 190;        // px radius of the cursor push
  const MAX_DPR = 2;

  // Smoke is tinted along the argument: lit by the alarm colour early, neutral
  // through the middle, and cooling to the recovery green as the page resolves.
  const TINTS = [
    [236, 198, 186], // barely warm, lit from the alarm side
    [206, 214, 228], // neutral grey-blue
    [188, 226, 210], // faintly jade, only near the end
  ];

  /* --- State ------------------------------------------------------------- */

  let W = 0, H = 0, dpr = 1;
  let count = 0;
  let particles = [];
  let sprites = [];
  let clearAt = 0;
  let lastScroll = window.scrollY;
  let shear = 0;               // smoothed scroll velocity
  let mx = -9999, my = -9999;
  let hasCursor = false;
  let t = 0;
  let raf = 0;

  // Text that sits directly on a dark band, with nothing opaque between it
  // and the canvas. Everything inside a slip, card or panel is excluded by
  // construction because those carry their own background.
  const CLEAR_SEL = [
    ".hero .kicker", ".hero .lead", ".hero__meta",
    ".band:not(.band--bone) .grid > .prose",
    ".band:not(.band--bone) .grid > .col-note",
    ".band:not(.band--bone) .shell > .fact__src",
    ".band:not(.band--bone) .figure figcaption",
    ".foot__note", ".foot__bar",
  ].join(",");
  let clearEls = [];
  let clears = [];
  // [outset px, alpha removed], innermost first. Product of (1 - alpha) over
  // all nine is 0.130, i.e. 87% of the smoke gone directly under the text,
  // tailing off across a 104px fringe.
  const FEATHER = [
    [0, "rgba(0,0,0,0.60)"], [6, "rgba(0,0,0,0.28)"], [14, "rgba(0,0,0,0.20)"],
    [24, "rgba(0,0,0,0.16)"], [36, "rgba(0,0,0,0.13)"], [50, "rgba(0,0,0,0.10)"],
    [66, "rgba(0,0,0,0.07)"], [84, "rgba(0,0,0,0.05)"], [104, "rgba(0,0,0,0.03)"],
  ];

  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const lerp = (a, b, k) => a + (b - a) * k;

  /* --- Sprite ------------------------------------------------------------
     One radial gradient per particle per frame is the classic way to make a
     canvas smoke field crawl. Instead each tint is rasterised once, as a
     cluster of overlapping blobs so the silhouette is lumpy rather than a
     perfect circle, and every frame is just drawImage. */

  function makeSprite(rgb) {
    const c = document.createElement("canvas");
    c.width = c.height = SPRITE;
    const g = c.getContext("2d");
    const col = (a) => "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";

    // One dominant, very soft core carries the mass; the small off-centre
    // lobes only break the silhouette. Six equal blobs — the obvious way to
    // do this — reads as a flower, not a puff.
    const blobs = [
      [0.50, 0.50, 0.50, 1.0],
      [0.38, 0.42, 0.30, 0.45],
      [0.63, 0.47, 0.27, 0.40],
      [0.48, 0.63, 0.25, 0.35],
    ];

    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      const x = b[0] * SPRITE, y = b[1] * SPRITE, r = b[2] * SPRITE, k = b[3];
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      // A long, shallow tail is what makes the edge disappear. Anything that
      // reaches zero quickly leaves a visible disc.
      grad.addColorStop(0.00, col(0.115 * k));
      grad.addColorStop(0.22, col(0.075 * k));
      grad.addColorStop(0.45, col(0.036 * k));
      grad.addColorStop(0.68, col(0.013 * k));
      grad.addColorStop(0.86, col(0.004 * k));
      grad.addColorStop(1.00, col(0));
      g.fillStyle = grad;
      g.fillRect(0, 0, SPRITE, SPRITE);
    }
    return c;
  }

  /* --- Particles ---------------------------------------------------------- */

  function spawn(p, seeded) {
    p.x = Math.random() * W;
    // On first fill, scatter through the whole viewport so there is a field
    // immediately rather than a visible wave rising from the bottom edge.
    p.y = seeded ? Math.random() * H : H + Math.random() * H * 0.35;
    p.vx = (Math.random() - 0.5) * 0.24;
    p.vy = -RISE * (0.55 + Math.random() * 0.9);
    p.scale = 0.85 + Math.random() * 1.85;
    p.grow = 0.0010 + Math.random() * 0.0018;
    p.rot = Math.random() * Math.PI * 2;
    p.spin = (Math.random() - 0.5) * 0.0022;
    p.seed = Math.random() * 100;
    p.life = seeded ? Math.random() : 0;
    p.decay = 0.00055 + Math.random() * 0.0009;
    p.tint = 0;
    return p;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Scale the population to the area, so a phone is not asked to composite
    // a desktop-sized field. Coarse pointers get a smaller budget again.
    const area = W * H;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    count = Math.round(clamp(area / (coarse ? 44000 : 24000), 12, coarse ? 26 : 58));

    while (particles.length < count) particles.push(spawn({}, true));
    if (particles.length > count) particles.length = count;

    measure();
  }

  // Where the field should have cleared by: the top of the "what happens when
  // you stop" section. Read from the DOM so editing the page order cannot
  // leave the effect anchored to a stale scroll offset.
  function measure() {
    const stop = document.getElementById("stop");
    clearAt = stop
      ? stop.getBoundingClientRect().top + window.scrollY
      : document.documentElement.scrollHeight * 0.62;
  }

  function density() {
    const eye = window.scrollY + H * 0.5;
    const start = clearAt - H * 1.35;
    const k = clamp((eye - start) / (H * 1.7), 0, 1);
    // Ease so the thinning is felt as a gradual clearing, not a fade-out.
    const eased = k * k * (3 - 2 * k);
    return 1 - eased * 0.93;
  }

  function stage() {
    const max = document.documentElement.scrollHeight - H;
    return max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
  }

  /* --- Bursts -------------------------------------------------------------
     Tapping the page exhales. Rather than growing the array — which would
     push the frame budget over on a fast tapper — the oldest particles are
     recycled to the point of contact, so the population is constant. */

  function tintNow() {
    const s = stage();
    return s < 0.3 ? 0 : s < 0.72 ? 1 : 2;
  }

  function puff(x, y, n) {
    const order = particles
      .map((p, i) => [p.life, i])
      .sort((a, b) => b[0] - a[0])
      .slice(0, n);

    const tint = tintNow();
    for (let k = 0; k < order.length; k++) {
      const p = particles[order[k][1]];
      const ang = Math.random() * Math.PI * 2;
      const sp = 0.7 + Math.random() * 2.4;
      spawn(p, false);
      p.x = x + (Math.random() - 0.5) * 34;
      p.y = y + (Math.random() - 0.5) * 34;
      p.vx = Math.cos(ang) * sp;
      p.vy = Math.sin(ang) * sp - 0.55;
      p.scale = 0.45 + Math.random() * 0.7;
      p.grow = 0.0042 + Math.random() * 0.0038;
      p.decay = 0.0040 + Math.random() * 0.0035;
      p.life = 0;
      p.tint = tint;
    }
    schedule();
  }

  /* --- Frame -------------------------------------------------------------- */

  function draw() {
    raf = 0;
    t += 1;

    const sy = window.scrollY;
    const delta = sy - lastScroll;
    lastScroll = sy;
    // Smooth the velocity so a trackpad fling shears the field instead of
    // snapping it, and so it settles back to rest on its own.
    shear = lerp(shear, clamp(delta, -140, 140), 0.16);
    if (Math.abs(shear) < 0.02) shear = 0;

    const d = density();
    const s = stage();
    // Tint index: alarm-lit early, neutral through the middle, jade at the end.
    const tint = s < 0.3 ? 0 : s < 0.72 ? 1 : 2;

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.life += p.decay;
      if (p.life >= 1) {
        spawn(p, false);
        p.tint = tint;
        continue;
      }

      // Cheap two-frequency turbulence. Real curl noise is not worth the
      // frame budget at this particle count and reads no better once the
      // puffs overlap.
      const n =
        Math.sin(p.y * 0.0052 + t * 0.0055 + p.seed) * 0.020 +
        Math.sin(p.x * 0.0089 - t * 0.0031 + p.seed * 1.7) * 0.012;
      p.vx += n;
      p.vx *= 0.982;
      p.vy *= 0.995;

      if (hasCursor) {
        const dx = p.x - mx, dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < CURSOR_R * CURSOR_R && d2 > 1) {
          const dist = Math.sqrt(d2);
          const f = (1 - dist / CURSOR_R) * 0.55;
          p.vx += (dx / dist) * f;
          p.vy += (dy / dist) * f;
        }
      }

      p.x += p.vx + shear * 0.012;
      p.y += p.vy - shear * PARALLAX * 0.5;
      p.scale += p.grow;
      p.rot += p.spin;

      // Wrap horizontally; recycle vertically.
      if (p.x < -SPRITE) p.x += W + SPRITE * 2;
      else if (p.x > W + SPRITE) p.x -= W + SPRITE * 2;
      if (p.y < -SPRITE * 1.5) { spawn(p, false); p.tint = tint; continue; }

      // In over the first sixth of life, out over the last half.
      const fade =
        p.life < 0.16 ? p.life / 0.16 : p.life > 0.5 ? 1 - (p.life - 0.5) / 0.5 : 1;

      const a = fade * 0.5 * d;
      if (a <= 0.004) continue;

      const sprite = sprites[p.tint] || sprites[1];
      const size = SPRITE * p.scale;

      // Stretch each puff along its own direction of travel. This is what
      // separates smoke from fog: a still particle stays round, a moving one
      // smears, and a hard scroll shears the whole field into streaks.
      const dyEff = p.vy - shear * PARALLAX * 0.5;
      const speed = Math.sqrt(p.vx * p.vx + dyEff * dyEff);
      const stretch = 1 + Math.min(speed * 0.42, 2.1);

      ctx.globalAlpha = a;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.atan2(dyEff, p.vx) + p.rot * 0.12);
      // Preserve area so a stretched puff does not also get denser.
      ctx.scale(stretch, 1 / Math.sqrt(stretch));
      ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;

    // Part the smoke around the type. Nested rects at a falling alpha ramp
    // make a feathered hole — 86% cleared at the centre, 5% at a 66px
    // fringe — for seven fillRects per block and no per-frame blur. Three
    // coarse steps were tried first and read as a slab behind the paragraph.
    if (delta !== 0 || !clears.length) measureClears();
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < clears.length; i++) {
      const r = clears[i];
      if (r.bottom < -110 || r.top > H + 110) continue;
      for (let k = FEATHER.length - 1; k >= 0; k--) {
        const pad = FEATHER[k][0];
        ctx.fillStyle = FEATHER[k][1];
        ctx.fillRect(r.left - pad, r.top - pad, r.width + pad * 2, r.height + pad * 2);
      }
    }
    ctx.globalCompositeOperation = "source-over";

    if (!reduced) schedule();
  }

  function measureClears() {
    if (!clearEls.length) clearEls = Array.prototype.slice.call(document.querySelectorAll(CLEAR_SEL));
    const range = document.createRange();
    clears = clearEls.map((el) => {
      range.selectNodeContents(el);
      const r = range.getBoundingClientRect();
      // An empty or display:none block yields a zero rect; skip it rather
      // than punching a hole at the origin.
      return r.width && r.height ? r : null;
    }).filter(Boolean);
  }

  function schedule() {
    if (!raf && !document.hidden) raf = requestAnimationFrame(draw);
  }

  /* --- Wiring ------------------------------------------------------------- */

  sprites = TINTS.map(makeSprite);
  resize();

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 160);
  });

  // The field is anchored to a section offset, which moves whenever content
  // above it changes height — images loading, a myth opening, the quiz
  // advancing. Re-measuring on those is cheaper than measuring every frame.
  window.addEventListener("load", () => { measure(); clearEls = []; measureClears(); });
  window.addEventListener("resize", () => { clears = []; });
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => measure());
    ro.observe(document.body);
  }

  if (reduced) {
    // One frame, no loop: the atmosphere without the motion.
    draw();
    return;
  }

  window.addEventListener("scroll", schedule, { passive: true });

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch") return;
      mx = e.clientX;
      my = e.clientY;
      hasCursor = true;
    },
    { passive: true }
  );
  window.addEventListener("pointerleave", () => { hasCursor = false; }, { passive: true });

  window.addEventListener(
    "pointerdown",
    (e) => puff(e.clientX, e.clientY, 9),
    { passive: true }
  );

  // One exhale on arrival, from low and left of the headline.
  window.setTimeout(() => puff(W * 0.22, H * 0.86, 14), 620);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else {
      lastScroll = window.scrollY; // don't bank a huge delta from a background tab
      schedule();
    }
  });

  schedule();
})();
