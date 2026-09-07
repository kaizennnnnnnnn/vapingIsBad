/* ==========================================================================
   stamps.js — a postmark for every section you stop at.

   Each section header carries a numbered sticker. When that header has sat
   in the middle of the viewport for long enough to count as arriving — not
   merely scrolled past on the way to the quiz — a postmark thumps down over
   its corner with the time on it. The card at the foot of the page collects
   them, and says which sections never got one.

   Nothing is stored. Reload and the card is blank again, on purpose.
   ========================================================================== */

(function () {
  "use strict";

  const DWELL_MS = 600;

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  const heads = Array.prototype.slice
    .call(document.querySelectorAll(".shead"))
    .map((head) => {
      const section = head.closest("section[id]");
      const no = head.querySelector(".shead__no");
      if (!section || !no) return null;
      const text = no.textContent.replace(/\s+/g, " ").trim();
      const m = /^(\d+)\s*[—–-]\s*(.+)$/.exec(text);
      return {
        id: section.id,
        head: head,
        no: no,
        num: m ? m[1] : "",
        name: m ? m[2] : text,
        stamped: false,
        when: "",
        timer: 0,
      };
    })
    .filter(Boolean);

  if (!heads.length) return;

  const links = Array.prototype.slice.call(
    document.querySelectorAll(".masthead__links a[href^='#']")
  );
  const card = document.querySelector("[data-card]");
  const line = document.querySelector("[data-card-line]");

  /* --- The mark ------------------------------------------------------------ */

  function mark(num, when, bars) {
    return (
      '<span class="stamp" aria-hidden="true">' +
      '<svg class="stamp__svg" viewBox="0 0 64 64" focusable="false">' +
      '<circle class="stamp__ring" cx="32" cy="32" r="29"/>' +
      '<circle class="stamp__ring stamp__ring--in" cx="32" cy="32" r="24"/>' +
      '<text class="stamp__t stamp__t--no" x="32" y="31">' + esc(num) + "</text>" +
      '<text class="stamp__t stamp__t--time" x="32" y="42">' + esc(when) + "</text>" +
      (bars
        ? '<path class="stamp__bar" d="M63 20 q6 -3 12 0 t12 0 M63 27 q6 -3 12 0 t12 0 ' +
          'M63 34 q6 -3 12 0 t12 0 M63 41 q6 -3 12 0 t12 0"/>'
        : "") +
      "</svg></span>"
    );
  }

  function clock() {
    try {
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch (e) {
      const d = new Date();
      return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    }
  }

  /* --- The card ------------------------------------------------------------ */

  function renderCard() {
    if (!card) return;
    card.innerHTML = heads
      .map(
        (h) =>
          '<li class="card__slot" data-slot="' + esc(h.id) + '">' +
          '<span class="card__mark"></span>' +
          "<span>" +
          '<span class="card__no">' + esc(h.num) + "</span>" +
          '<span class="card__name">' + esc(h.name) + "</span>" +
          '<span class="card__when">Not yet</span>' +
          "</span></li>"
      )
      .join("");
    updateLine();
  }

  function updateLine() {
    if (!line) return;
    const missing = heads.filter((h) => !h.stamped);
    if (!heads.some((h) => h.stamped)) {
      line.innerHTML =
        "Nothing stamped yet. The marks land when you stop at a section, not when you scroll past one.";
      return;
    }
    if (!missing.length) {
      line.innerHTML =
        "<b>Every section, stamped.</b> Whatever order you took them in.";
      return;
    }
    line.innerHTML =
      "Passed without stopping: " +
      missing
        .map((h) => '<a href="#' + esc(h.id) + '">' + esc(h.num) + " " + esc(h.name) + "</a>")
        .join(", ") +
      ".";
  }

  /* --- Stamping ------------------------------------------------------------ */

  function stamp(h) {
    if (h.stamped) return;
    h.stamped = true;
    h.when = clock();

    h.no.insertAdjacentHTML("beforeend", mark(h.num, h.when, true));

    links.forEach((a) => {
      if (a.getAttribute("href") === "#" + h.id) a.classList.add("is-stamped");
    });

    if (card) {
      const slot = card.querySelector('[data-slot="' + h.id + '"]');
      if (slot) {
        slot.classList.add("is-stamped");
        const m = slot.querySelector(".card__mark");
        const w = slot.querySelector(".card__when");
        if (m) m.innerHTML = mark(h.num, h.when, false);
        if (w) w.textContent = "Stamped " + h.when;
      }
    }
    updateLine();
  }

  renderCard();

  if (!("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const h = heads.find((x) => x.head === e.target);
        if (!h || h.stamped) return;
        clearTimeout(h.timer);
        if (e.isIntersecting) {
          h.timer = setTimeout(() => {
            stamp(h);
            io.unobserve(h.head);
          }, DWELL_MS);
        }
      });
    },
    // The band is the middle of the screen: a header has to reach it, and
    // stay, before the section counts as visited.
    { rootMargin: "-22% 0px -48% 0px", threshold: 0 }
  );

  heads.forEach((h) => io.observe(h.head));
})();
