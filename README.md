# Vaping Is Bad

An interactive, source-checked web presentation about what vaping actually does — to your body, your head, and your bank account — plus a live cost calculator and a quiz.

**→ [Read it](https://kaizennnnnnnnn.github.io/vapingIsBad/)**

---

## What's in it

| Section | What it does |
|---|---|
| The honest opening | Concedes the one true thing about "it's better than cigarettes", then explains why that's the wrong comparison for someone who never smoked |
| What's in the aerosol | Interactive breakdown of the compounds in vape aerosol, with measured concentrations |
| What nicotine does | How dependence forms, and why it forms faster on salt-nicotine devices |
| The visible stuff | Skin, teeth, gums, sleep, breath, stamina — the near-term effects |
| The anxiety loop | Why nicotine feels calming while measurably raising baseline anxiety |
| **The money** | Live calculator: pick your habit, currency and price → daily / weekly / **monthly** / yearly / 5-year spend, what that buys instead, and what it compounds to if invested |
| Myths, checked | Point-by-point corrections, including where the popular anti-vaping claims are themselves overstated |
| What happens when you stop | Recovery timeline from 20 minutes to a year |
| **The quiz** | Multiple-choice, instant sourced feedback, scored, retryable |
| Sources | Every claim on the page, linked |

## How it was built

Every factual claim went through a two-stage pipeline: a research pass against primary literature (PubMed, CDC, NHS, WHO, Cochrane, ASH, peer-reviewed journals), then an independent adversarial fact-check that re-fetched each cited source and re-stated, corrected, or removed the claim.

Claims that couldn't be traced to a real, fetchable source were cut — including several widely-repeated ones. Where the evidence is correlational, animal-only, or extrapolated from cigarette research, the page says so. The goal was a page that survives a sceptical reader, not one that scores rhetorical points.

## Running it locally

No build step, no dependencies, no framework. It's HTML, CSS and three small vanilla JS modules.

```bash
git clone https://github.com/kaizennnnnnnnn/vapingIsBad.git
cd vapingIsBad
python -m http.server 8000      # or: npx serve .
# open http://localhost:8000
```

Opening `index.html` directly from the filesystem works too.

### Checks

```bash
npm install && npx playwright install chromium

npm run check     # 23 behaviour + a11y assertions (calculator, quiz, contrast, alt text)
npm run shots     # screenshots at 375 / 768 / 1024 / 1440 into ./shots
npm run og        # regenerate the social preview image
```

`npm run check` plays the whole quiz through, drives every calculator control,
and fails on console errors, NaN output, missing alt text, broken images, or
leftover placeholder copy. `npm run shots` additionally fails on horizontal
overflow at any breakpoint.

## Structure

```
index.html                 the whole page
assets/css/tokens.css      design tokens — palette, type scale, spacing, motion
assets/css/base.css        reset, typography, layout primitives
assets/css/components.css  reusable parts — stats, facts, bars, disclosures
assets/css/sections.css    hero, calculator, timeline, quiz
assets/js/data.js          all content: facts, chemicals, myths, prices, quiz
assets/js/calculator.js    cost + nicotine + compounding engine
assets/js/quiz.js          quiz state machine
assets/js/reveal.js        scroll progress, reveal-on-enter, disclosures
assets/js/main.js          nav, share, anchors
tools/shoot.mjs            screenshot + overflow harness
tools/check.mjs            behaviour + accessibility assertions
tools/og.mjs               social preview image generator
```

Content lives in `assets/js/data.js` — edit that to change facts, prices, or quiz questions without touching markup.

## Accessibility

Semantic landmarks, keyboard-operable quiz (`1`–`4` to answer, `Enter` to advance), visible focus rings, `prefers-reduced-motion` honoured throughout, contrast checked against WCAG AA at all text sizes.

## A note on the point of this

This is a persuasion piece, and it says so. It is not medical advice and it is not a substitute for talking to a doctor or a stop-smoking service. If you're using vaping to stay off cigarettes, the evidence on that is genuinely different from the evidence on never-smokers picking it up — the page covers that distinction honestly rather than flattening it.

## Credits

Image credits and full source citations are listed at the bottom of the page. All imagery is public domain or openly licensed, attributed in place.

## Licence

Code released under the [MIT Licence](LICENSE). Cited research belongs to its authors; images are used under the licences noted on the page.
