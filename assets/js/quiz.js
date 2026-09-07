/* ==========================================================================
   quiz.js — one question at a time, instant feedback, sourced explanations
   Reads window.VB.quiz. Keyboard: 1-4 to answer, Enter to advance.
   ========================================================================== */

(function () {
  "use strict";

  const Q = window.VB && window.VB.quiz;
  if (!Q || !Q.questions || !Q.questions.length) return;

  const root = document.querySelector("[data-quiz]");
  if (!root) return;

  const KEYS = ["A", "B", "C", "D", "E"];

  const ui = {
    counter: root.querySelector("[data-q-counter]"),
    fill: root.querySelector("[data-q-fill]"),
    body: root.querySelector("[data-q-body]"),
    score: root.querySelector("[data-q-score]"),
  };

  const state = { i: 0, answered: false, correct: 0, log: [] };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function progress() {
    const pct = (state.i / Q.questions.length) * 100;
    if (ui.fill) ui.fill.style.width = pct + "%";
    if (ui.counter) {
      ui.counter.textContent =
        state.i < Q.questions.length
          ? "Question " + (state.i + 1) + " / " + Q.questions.length
          : "Complete";
    }
    if (ui.score) {
      ui.score.textContent = state.correct + " correct so far";
    }
  }

  function renderQuestion() {
    const q = Q.questions[state.i];
    state.answered = false;

    ui.body.innerHTML =
      '<h3 class="quiz__q">' + escapeHtml(q.question) + "</h3>" +
      '<div class="quiz__opts" role="group" aria-label="Answer options">' +
      q.options
        .map(
          (o, idx) =>
            '<button class="opt" type="button" data-idx="' + idx + '">' +
            '<span class="opt__key" aria-hidden="true">' + KEYS[idx] + "</span>" +
            "<span>" + escapeHtml(o) + "</span></button>"
        )
        .join("") +
      "</div>" +
      '<div data-q-feedback></div>';

    ui.body.querySelectorAll(".opt").forEach((btn) => {
      btn.addEventListener("click", () => answer(parseInt(btn.getAttribute("data-idx"), 10)));
    });

    progress();
  }

  function answer(idx) {
    if (state.answered) return;
    state.answered = true;

    const q = Q.questions[state.i];
    const right = idx === q.correctIndex;
    if (right) state.correct++;
    state.log.push({ q: q.question, right: right, chosen: q.options[idx], answer: q.options[q.correctIndex] });

    ui.body.querySelectorAll(".opt").forEach((btn) => {
      const i = parseInt(btn.getAttribute("data-idx"), 10);
      btn.disabled = true;
      if (i === q.correctIndex) btn.classList.add("is-correct");
      else if (i === idx) btn.classList.add("is-wrong");
      else btn.classList.add("is-dim");
    });

    const last = state.i === Q.questions.length - 1;
    const fb = ui.body.querySelector("[data-q-feedback]");
    fb.innerHTML =
      '<div class="quiz__feedback' + (right ? " is-right" : "") + '">' +
      '<span class="quiz__verdict">' + (right ? "Correct" : "Not quite") + "</span>" +
      escapeHtml(q.explanation) +
      (q.source
        ? '<span class="quiz__src">' +
          (q.sourceUrl
            ? '<a href="' + escapeHtml(q.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(q.source) + "</a>"
            : escapeHtml(q.source)) +
          "</span>"
        : "") +
      "</div>" +
      '<div class="quiz__foot">' +
      '<span class="quiz__score">' + (state.correct) + " / " + (state.i + 1) + " so far</span>" +
      '<button class="btn btn--solid" type="button" data-q-next>' +
      (last ? "See the result" : "Next question") +
      ' <span class="btn__arrow" aria-hidden="true">&rarr;</span></button></div>';

    const next = fb.querySelector("[data-q-next]");
    next.addEventListener("click", advance);
    next.focus();

    if (ui.score) ui.score.textContent = state.correct + " correct so far";
  }

  function advance() {
    state.i++;
    if (state.i >= Q.questions.length) renderResult();
    else renderQuestion();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function bandFor(score) {
    const pct = score / Q.questions.length;
    return Q.bands.find((b) => pct >= b.min) || Q.bands[Q.bands.length - 1];
  }

  function renderResult() {
    const band = bandFor(state.correct);
    if (ui.fill) ui.fill.style.width = "100%";
    if (ui.counter) ui.counter.textContent = "Complete";
    if (ui.score) ui.score.textContent = state.correct + " / " + Q.questions.length;

    ui.body.innerHTML =
      '<div class="result__score">' +
      '<span class="result__n">' + state.correct + "</span>" +
      '<span class="result__of">/ ' + Q.questions.length + "</span>" +
      "</div>" +
      '<h3 class="quiz__q">' + escapeHtml(band.title) + "</h3>" +
      '<p class="prose" style="max-width:56ch">' + escapeHtml(band.note) + "</p>" +
      '<div class="review">' +
      state.log
        .map(
          (r) =>
            '<div class="review__item">' +
            '<span class="review__mark' + (r.right ? "" : " review__mark--x") + '">' +
            (r.right ? "&#10003;" : "&#10007;") + "</span>" +
            "<span>" + escapeHtml(r.q) +
            (r.right ? "" : '<br><span style="color:var(--jade)">Answer: ' + escapeHtml(r.answer) + "</span>") +
            "</span></div>"
        )
        .join("") +
      "</div>" +
      '<div class="quiz__foot">' +
      '<button class="btn" type="button" data-q-retry>Take it again</button>' +
      '<a class="btn btn--jade" href="#quit">What to do about it <span class="btn__arrow" aria-hidden="true">&rarr;</span></a>' +
      "</div>";

    const retry = ui.body.querySelector("[data-q-retry]");
    retry.addEventListener("click", () => {
      state.i = 0;
      state.correct = 0;
      state.log = [];
      renderQuestion();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (!root.contains(document.activeElement) && document.activeElement !== document.body) return;
    const rect = root.getBoundingClientRect();
    const visible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
    if (!visible) return;

    if (!state.answered && /^[1-4]$/.test(e.key)) {
      const btn = ui.body.querySelector('.opt[data-idx="' + (parseInt(e.key, 10) - 1) + '"]');
      if (btn) { e.preventDefault(); btn.click(); }
    } else if (state.answered && e.key === "Enter") {
      const btn = ui.body.querySelector("[data-q-next]");
      if (btn) { e.preventDefault(); btn.click(); }
    }
  });

  renderQuestion();
})();
