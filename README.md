# Vaping Is Bad

An interactive, source-checked web presentation about what vaping actually does — to your body, your head, and your bank account — plus a live cost calculator and a quiz.

**→ [Read it](https://kaizennnnnnnnn.github.io/vapingIsBad/)**

---

## What's in it

| Section | What it does |
|---|---|
| 01 · Ground rules | Opens by conceding the strongest evidence *for* vaping — 98% less NNAL than smoking, Cochrane high-certainty for smokers switching — then pivots on the line where the UK government tells never-smokers not to start |
| 02 · Composition | The aerosol as a route through the device: a tank → coil → mouthpiece schematic with eight chemicals in three lanes by where each one gets in. The third lane is what *isn't* in it. A two-position voltage dial re-runs the formaldehyde experiment and heats the drawn coil; sound is opt-in |
| 03 · Dependence | Why salt nicotine changed the product, and what the trial data says about quitting unaided |
| 04 · Near term | Sleep, the anxiety loop, heart rate — plus one card on what has never been measured |
| 05 · Lungs & heart | What's established, what isn't shown, and what's conclusive — three findings that disagree with each other |
| **06 · The money** | Live calculator: habit, currency, price → daily / weekly / **monthly** / yearly / 5-year spend, what a year buys instead, nicotine load, and a compounding projection |
| 07 · Myths | Eight claims checked. Several are ones the anti-vaping side gets wrong; one of those is first |
| 08 · Afterwards | Recovery timeline built only from measured findings — ending with the fact that the famous "20 minutes" chart is cigarette research |
| Can't tell you | Four things the page as a whole cannot claim — thirty-year risk, her specific device, how quitting will go for her, and whether she should stop at all if she smoked first — each pinned to the source the confident version would have used |
| **09 · The quiz** | Twelve questions, instant sourced feedback, scored, retryable, keyboard-operable |
| 10 · Resources | Verified quitlines and programmes for the US, UK, Australia and Canada |
| 11 · Sources | All 24 sources, linked |
| Your card | A postmark lands on each section's index sticker when you stop there (not when you scroll past). The card at the foot collects them and links the sections you skipped. Nothing is stored |

## How it was built

Research ran as a fan-out across ten dimensions (respiratory, cardiovascular, dependence, toxicology, oral/dermatological, mental health, reproductive, device safety, epidemiology, economics), producing 194 candidate findings. Every claim that made it onto the page was then re-checked against its cited source — abstracts pulled through the NCBI eutils API, institutional pages read directly.

That check changed things:

- The metals claim was **overstated** in draft. The source says aerosol exceeded health-based limits in "close to 50% or more" of samples, not the specific 68/57/48% figures. Restated to match.
- The recovery section originally opened on "within twenty minutes". That timeline is cigarette research — no vaping equivalent has been run. The page now says so explicitly as its closing item.
- Precise figures that couldn't be traced to a fetchable source were dropped rather than published.

Where evidence is correlational, animal-only, or borrowed from cigarette research, the copy says so in the copy — not in a footnote. Three of the eight myths are ones the *anti*-vaping side gets wrong, and popcorn lung is deliberately first: a page that only corrects one side isn't worth reading.

## Running it locally

No build step, no runtime dependencies, no framework. It is HTML, CSS and five small vanilla JS modules. Playwright is a dev dependency for the checks only.

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

npm run check     # 45 behaviour + a11y assertions (calculator, quiz, keyboard, phone route, stamps, alt text)
npm run shots     # screenshots at 375 / 768 / 1024 / 1440 into ./shots
npm run og        # regenerate the social preview image
```

`npm run check` plays the whole quiz through, drives every calculator control,
and fails on console errors, NaN output, missing alt text, broken images, or
leftover placeholder copy. A phone pass (375px, touch) checks that the route
stands vertical, the dial heats the coil, a touch-hold on the fire button
draws and exhales, and section heads only stamp after you stop at them. `npm run shots` additionally fails on horizontal
overflow at any breakpoint.

## Structure

```
index.html                 the whole page
assets/css/tokens.css      design tokens — palette, type scale, spacing, motion
assets/css/base.css        reset, typography, layout primitives
assets/css/components.css  reusable parts — stats, facts, bars, disclosures
assets/css/sections.css    hero, calculator, timeline, quiz
assets/js/data.js          all content: facts, chemicals, myths, prices, quiz, sources
assets/js/render.js        turns the data layer into markup
assets/js/calculator.js    cost + nicotine + compounding engine
assets/js/quiz.js          quiz state machine
assets/js/vapour.js        the scroll-driven aerosol canvas, the fire button, tilt
assets/js/type.js          cursor-reactive display type + the cycling strike
assets/js/play.js          myth guessing, the voltage dial (+ opt-in sound), lane-in-view, the timeline spine
assets/js/stamps.js        postmarks on section heads, and the card that collects them
assets/js/reveal.js        scroll progress, reveal-on-enter, disclosures
assets/js/main.js          nav, share, anchors
tools/shoot.mjs            screenshot + overflow harness
tools/check.mjs            behaviour + accessibility assertions
tools/og.mjs               social preview image generator
```

Content lives in `assets/js/data.js` — edit that to change facts, prices, or quiz questions without touching markup.

## Accessibility

Semantic landmarks, keyboard-operable quiz (`1`–`4` to answer, `Enter` to advance), skip link as the first tab stop, visible focus rings, `prefers-reduced-motion` honoured throughout, and 28px minimum hit areas on every control.

Colour is the part most likely to rot, so it is pinned: all 36 text-token/surface combinations were solved against WCAG AA and each token in `tokens.css` carries its measured contrast ratio in a comment. Lowest ratio on the page is 4.59:1.

## A note on the point of this

This is a persuasion piece, and it says so. It is not medical advice and it is not a substitute for talking to a doctor or a stop-smoking service. If you're using vaping to stay off cigarettes, the evidence on that is genuinely different from the evidence on never-smokers picking it up — the page covers that distinction honestly rather than flattening it.

## Credits

Imagery is public domain (US FDA; NIH BioArt by Ryan Kissinger / NIAID) and vendored into `assets/img/` rather than hotlinked, so the page has no third-party image dependency. Credits and all 24 source citations are listed at the bottom of the page.

## Licence

Code released under the [MIT Licence](LICENSE). Cited research belongs to its authors; images are used under the licences noted on the page.
