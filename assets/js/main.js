/* ==========================================================================
   main.js — page wiring: active nav, footer year, share, source back-refs
   ========================================================================== */

(function () {
  "use strict";

  /* --- Active section in the masthead ------------------------------------ */

  const links = Array.prototype.slice.call(
    document.querySelectorAll(".masthead__links a[href^='#']")
  );

  if (links.length && "IntersectionObserver" in window) {
    const targets = links
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) => {
            const on = a.getAttribute("href") === "#" + e.target.id;
            a.style.color = on ? "var(--tx-hi)" : "";
          });
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );

    targets.forEach((t) => io.observe(t));
  }

  /* --- Footer year -------------------------------------------------------- */

  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* --- Share / copy link -------------------------------------------------- */

  document.querySelectorAll("[data-share]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const url = window.location.href.split("#")[0];
      const payload = {
        title: document.title,
        text: "The receipts on vaping — what it costs, what it does, and how to stop.",
        url: url,
      };
      const original = btn.textContent;
      try {
        if (navigator.share) {
          await navigator.share(payload);
          return;
        }
        await navigator.clipboard.writeText(url);
        btn.textContent = "Link copied";
      } catch (e) {
        btn.textContent = url;
      }
      setTimeout(() => {
        btn.textContent = original;
      }, 2200);
    });
  });

  /* --- Smooth anchor scroll that respects the fixed masthead -------------- */

  document.querySelectorAll("a[href^='#']:not([href='#'])").forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
      history.replaceState(null, "", a.getAttribute("href"));
    });
  });
})();
