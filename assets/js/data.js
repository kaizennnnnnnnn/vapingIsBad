/* ==========================================================================
   data.js — every fact on this page, in one place.

   SOURCING RULE: nothing goes in here unless the number was checked against
   the cited source. Claims that could not be traced were cut, including
   several popular ones. Where evidence is correlational, animal-only, or
   borrowed from cigarette research, the copy says so.
   ========================================================================== */

window.VB = {
  /* ---- The money engine ------------------------------------------------ */
  money: {
    defaultCurrency: "GBP",
    investmentReturn: 0.07,

    nicotineNote:
      "Worked out from the volume you actually get through, not from the puff " +
      "count on the box — those are advertising. A 2024 survey of US listings " +
      "found devices claiming an average of 13,980 puffs.",

    regionToCurrency: {
      US: "USD", GB: "GBP", IE: "EUR", DE: "EUR", FR: "EUR", ES: "EUR",
      IT: "EUR", NL: "EUR", PL: "PLN", CA: "CAD", AU: "AUD", NZ: "NZD",
      PH: "PHP", IN: "INR", ZA: "ZAR", SG: "SGD", MY: "MYR"
    },

    currencies: {
      GBP: { symbol: "£", label: "Pound sterling (£)" },
      USD: { symbol: "$", label: "US dollar ($)" },
      EUR: { symbol: "€", label: "Euro (€)" },
      CAD: { symbol: "CA$", label: "Canadian dollar (CA$)" },
      AUD: { symbol: "A$", label: "Australian dollar (A$)" },
      NZD: { symbol: "NZ$", label: "New Zealand dollar (NZ$)" },
      PLN: { symbol: "zł ", label: "Polish złoty (zł)", symbolAfter: true },
      PHP: { symbol: "₱", label: "Philippine peso (₱)" },
      INR: { symbol: "₹", label: "Indian rupee (₹)" },
      ZAR: { symbol: "R", label: "South African rand (R)" },
      SGD: { symbol: "S$", label: "Singapore dollar (S$)" },
      MYR: { symbol: "RM", label: "Malaysian ringgit (RM)" }
    },

    modes: {
      disposable: {
        unitQuestion: "Disposables a week",
        unitSingular: "device", unitPlural: "devices",
        priceQuestion: "Price each",
        mlQuestion: "Liquid per device",
        min: 1, max: 21, step: 1, defaultUnits: 3,
        // Device size varies enormously by market — a UK disposable is capped at
        // 2 mL, a US one averages well over ten. Three a week is a sensible
        // starting point in a 2 mL market and absurd in a 12 mL one, so the
        // opening guess is set per market. Everything stays editable.
        defaultUnitsBy: { USD: 1, CAD: 1, PHP: 1, INR: 1, ZAR: 1, SGD: 1, MYR: 1 },
        price: { GBP: 5.5, USD: 14, EUR: 7, CAD: 18, AUD: 25, NZD: 28, PLN: 30, PHP: 350, INR: 700, ZAR: 180, SGD: 18, MYR: 40 },
        ml: { GBP: 2, USD: 12, EUR: 2, CAD: 10, AUD: 2, NZD: 2, PLN: 2, PHP: 10, INR: 10, ZAR: 10, SGD: 10, MYR: 10 }
      },
      pod: {
        unitQuestion: "Pods a week",
        unitSingular: "pod", unitPlural: "pods",
        priceQuestion: "Price per pod",
        mlQuestion: "Liquid per pod",
        min: 1, max: 35, step: 1, defaultUnits: 6,
        price: { GBP: 3, USD: 6.9, EUR: 3.5, CAD: 7, AUD: 9, NZD: 10, PLN: 14, PHP: 180, INR: 350, ZAR: 90, SGD: 9, MYR: 20 },
        ml: { GBP: 2, USD: 2, EUR: 2, CAD: 2, AUD: 2, NZD: 2, PLN: 2, PHP: 2, INR: 2, ZAR: 2, SGD: 2, MYR: 2 }
      },
      bottle: {
        unitQuestion: "Bottles a week",
        unitSingular: "bottle", unitPlural: "bottles",
        priceQuestion: "Price per bottle",
        mlQuestion: "Bottle size",
        min: 1, max: 14, step: 1, defaultUnits: 2,
        price: { GBP: 4, USD: 12, EUR: 5, CAD: 15, AUD: 16, NZD: 18, PLN: 20, PHP: 250, INR: 500, ZAR: 130, SGD: 12, MYR: 30 },
        ml: { GBP: 10, USD: 30, EUR: 10, CAD: 30, AUD: 30, NZD: 30, PLN: 10, PHP: 30, INR: 30, ZAR: 30, SGD: 30, MYR: 30 }
      }
    },

    /* Illustrative comparisons. Prices are rough and vary wildly — the point
       is the order of magnitude, not the decimal place. */
    swaps: [
      { label: "A night out with your friends", price: { GBP: 60, USD: 80, EUR: 70, CAD: 100, AUD: 110, NZD: 120, PLN: 300, PHP: 3000, INR: 4000, ZAR: 900, SGD: 100, MYR: 250 } },
      { label: "A pair of decent trainers", price: { GBP: 90, USD: 110, EUR: 105, CAD: 150, AUD: 170, NZD: 180, PLN: 450, PHP: 5500, INR: 7000, ZAR: 1600, SGD: 150, MYR: 400 } },
      { label: "A month of a gym membership", price: { GBP: 35, USD: 45, EUR: 40, CAD: 55, AUD: 65, NZD: 70, PLN: 150, PHP: 2000, INR: 2000, ZAR: 600, SGD: 90, MYR: 150 } },
      { label: "A return flight somewhere warm", price: { GBP: 180, USD: 300, EUR: 200, CAD: 400, AUD: 500, NZD: 550, PLN: 900, PHP: 12000, INR: 20000, ZAR: 5000, SGD: 350, MYR: 900 } },
      { label: "A driving lesson", price: { GBP: 38, USD: 70, EUR: 45, CAD: 70, AUD: 75, NZD: 80, PLN: 160, PHP: 1500, INR: 800, ZAR: 400, SGD: 80, MYR: 120 } },
      { label: "A month of streaming, all of it", price: { GBP: 30, USD: 45, EUR: 35, CAD: 50, AUD: 55, NZD: 60, PLN: 130, PHP: 900, INR: 900, ZAR: 400, SGD: 45, MYR: 80 } }
    ]
  },

  /* ---- 02 · What is actually in the aerosol ---------------------------- */
  chemicals: [
    {
      formula: "C₃H₈O₂ + C₃H₈O₃",
      name: "Propylene glycol and glycerine",
      what: "The fog itself. Both are harmless to swallow — they are in food and fog machines. The problem is that heating them is how every compound below gets made.",
      alsoIn: "heat the solvent, and it stops being the solvent"
    },
    {
      formula: "CH₂O",
      name: "Formaldehyde",
      what: "Made by cooking the solvent. The famous claim that vapes emit more of it than cigarettes came from a machine run at 5.0 V, a setting real users reject as unsmokable. At a realistic 4.0 V it fell from 718 to 20 µg per 10 puffs. But the honest replacement number still isn't comfortable: a day of realistic vaping came out only about a third below a 20-a-day smoker.",
      alsoIn: "thermal breakdown, worse the harder you run the coil"
    },
    {
      formula: "Ni",
      name: "Nickel",
      what: "Not in the liquid you bought — picked up on the way out. In 56 devices taken from daily users, median nickel was 68.4 µg/kg in the aerosol against 2.03 µg/kg in the bottle it came from.",
      alsoIn: "the heating coil, shedding into what you inhale"
    },
    {
      formula: "Pb · Cr · Mn",
      name: "Lead, chromium, manganese",
      what: "Same route as the nickel. Across those 56 real-world devices, aerosol metal levels exceeded health-based limits in close to half the samples or more, for chromium, manganese, nickel and lead.",
      alsoIn: "coil, solder and plating"
    },
    {
      formula: "C₄H₆O₂",
      name: "Diacetyl",
      what: "The butter-flavour chemical. Found in 39 of 51 flavours in a Harvard analysis, at up to 239 µg per device. Banned from e-liquid in the UK and EU since 2016 — and not banned in the US, so where your liquid was made genuinely matters.",
      alsoIn: "sweet and buttery flavourings"
    },
    {
      formula: "C₁₀H₁₄N₂",
      name: "Nicotine",
      what: "The reason the device is still in your pocket. Salt formulations let far more of it go down without the harshness that used to stop people — which is why the modern ones are harder to put down than the old ones were.",
      alsoIn: "the entire commercial point of the product"
    },
    {
      formula: "NNAL",
      name: "What is NOT in it",
      what: "This matters for trusting the rest of the page. Measured in real people, exclusive vapers carried 98% less NNAL — a tobacco-specific carcinogen marker — than smokers. That gap is real and it is enormous. Vaping is not smoking.",
      alsoIn: "the strongest argument in vaping's favour, stated plainly"
    },
    {
      formula: "n = 0",
      name: "And what nobody found",
      what: "There has never been a confirmed case of popcorn lung caused by vaping. Cancer Research UK says so flatly. If someone told you otherwise, they were repeating a claim the evidence does not support — and that is exactly why the rest of this page sticks to what does.",
      alsoIn: "the myth that discredits everyone who repeats it"
    }
  ],

  /* ---- 03 · Dependence -------------------------------------------------- */
  headFacts: [
    {
      title: "It got harder to stop because it was redesigned to be",
      body: "Nicotine salts were the change. They cut the harshness that used to make high doses unpleasant, so a much larger dose goes down smoothly. The device that is hard to put down isn't a failure of willpower — it is a product that works.",
      evidence: "high",
      source: "NASEM, Public Health Consequences of E-Cigarettes",
      sourceUrl: "https://nap.nationalacademies.org/catalog/24952/public-health-consequences-of-e-cigarettes"
    },
    {
      title: "Half of young vapers now report strong daily urges",
      body: "Among US young people who vape, the share reporting strong cravings every day rose from 31.6% to 50.3%. Fewer teenagers vape than in 2019 — but the ones who still do are markedly more hooked than the ones who came before them.",
      evidence: "high",
      source: "Nicotine & Tobacco Research, PMID 38531767",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/38531767/"
    },
    {
      title: "Trying hard, alone, mostly does not work — and that is not your fault",
      body: "In a randomised trial of 261 people aged 16–25 who vaped daily and wanted to stop, those given counselling plus a placebo hit 14% abstinence. Referral to a text-support programme alone: 6%. Add varenicline and it was 51%. The gap is the medication, not the motivation.",
      evidence: "high",
      source: "Evins et al., JAMA 2025;333(21):1876–1886",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/40266580/"
    }
  ],

  /* ---- 04 · Near-term, visible ----------------------------------------- */
  visibleFacts: [
    {
      title: "Your sleep, on the nights you vape",
      body: "Tracked day by day in young adults, the days they vaped nicotine carried 40% higher adjusted odds of getting under seven hours that night. Their <em>rated</em> sleep quality didn't change — so this is a thing that happens to you without you noticing it happening.",
      evidence: "medium",
      source: "PMID 42637626 — within-person study, association not proof of cause",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/42637626/"
    },
    {
      title: "The anxiety it settles is mostly the anxiety it caused",
      body: "The calm is real. It is also, in a dependent user, largely withdrawal being switched off — you are topping up to get back to baseline, not rising above it. Pooled across 102 studies and 169,500 people, stopping nicotine was associated with <strong>less</strong> anxiety and depression afterwards, not more.",
      evidence: "high",
      source: "Cochrane review, PMID 33687070",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/33687070/"
    },
    {
      title: "Your heart rate, within minutes, every time",
      body: "A single nicotine vaping session raised heart rate by 18 bpm and blood pressure by 12/10 mmHg. In the same trial the nicotine-free version and the sham did nothing measurable. This one is not disputed by anybody.",
      evidence: "high",
      source: "Randomised crossover trial, PMID 29991814",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/29991814/"
    },
    {
      title: "What nobody has actually measured",
      body: "You have probably seen the wrinkles-and-grey-skin warnings. No study has measured skin ageing, collagen or wrinkles in vapers — every one of those images comes from cigarette research. The one controlled study that tested vapers' taste and smell found no loss at all. We are telling you this because it is true, and because a page that only tells you the bad half isn't worth reading.",
      evidence: "low",
      source: "Stated as an evidence gap, not a finding",
      sourceUrl: ""
    },
    {
      title: "If you are ever pregnant, or might be",
      body: "Women who vaped during pregnancy and did not smoke at all had 1.88 times the rate of low birth weight, with a dose-response. Safer than smoking is not the same as safe, and this is the one place where the distinction stops being academic.",
      evidence: "medium",
      source: "PMID 34259468 — observational, exclusive vapers vs non-users",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/34259468/"
    },
    {
      title: "The bit that lands on other people",
      body: "In one year, US poison centres logged 7,043 e-cigarette exposure cases. 6,074 of them — 87.8% — were children under five. Sweet-smelling liquid, bright device, low shelf. This is the harm that isn't yours to accept on anyone's behalf.",
      evidence: "high",
      source: "CDC MMWR 2023;72(25):694–695",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/37347709/"
    }
  ],

  /* ---- 05 · Lungs and heart -------------------------------------------- */
  bodyFacts: [
    {
      title: "Established: the acute effects",
      body: "The American Heart Association's position is that nicotine e-cigarettes cause acute changes in blood pressure and heart rate, and that flavouring agents carry independent risks — while long-term cardiovascular effects remain genuinely unknown, because the products have only existed for about fifteen years.",
      evidence: "high",
      source: "American Heart Association scientific statement",
      sourceUrl: "https://newsroom.heart.org/news/current-evidence-identifies-health-risks-of-e-cigarette-use-long-term-research-needed"
    },
    {
      title: "Not established: blood-vessel damage",
      body: "You may have read that vapers have smoker-level artery damage. Pooled across studies, the difference in flow-mediated dilation between vapers and non-users was −1.47% with a confidence interval from −3.96 to +1.02 — which crosses zero. That is a finding of \"not shown\", and we are not going to dress it up as anything else.",
      evidence: "high",
      source: "Meta-analysis, PMID 38779295",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/38779295/"
    },
    {
      title: "Conclusive: it emits toxic substances",
      body: "The US National Academies reviewed the field and reached two conclusions at once — there is conclusive evidence that e-cigarettes emit numerous potentially toxic substances, and substantial evidence that exposure is far lower than from cigarettes. Both halves are true. Only quoting one of them is how this argument usually goes wrong.",
      evidence: "high",
      source: "National Academies of Sciences, Engineering, and Medicine, 2018",
      sourceUrl: "https://nap.nationalacademies.org/catalog/24952/public-health-consequences-of-e-cigarettes"
    }
  ],

  /* ---- Comparison bars -------------------------------------------------- */
  nicotineChart: {
    title: "How much lower than smoking, by marker",
    unit: "lower",
    source: "OHID",
    points: [
      { label: "NNN (nitrosamine)", value: 90, display: "90%", tone: "jade" },
      { label: "NAT (nitrosamine)", value: 94, display: "94%", tone: "jade" },
      { label: "NAB (nitrosamine)", value: 87, display: "87%", tone: "jade" },
      { label: "NNAL (nitrosamine)", value: 58, display: "58%", tone: "jade" },
      { label: "Acrylonitrile (CNEMA)", value: 94, display: "94%", tone: "jade" },
      { label: "1,3-Butadiene (MHBMA)", value: 83, display: "83%", tone: "jade" },
      { label: "Acrolein (3-HPMA)", value: 71, display: "71%", tone: "jade" }
    ]
  },

  /* ---- 07 · Myths ------------------------------------------------------- */
  myths: [
    {
      myth: "Vaping gives you popcorn lung",
      verdict: "False",
      reality:
        "This one is wrong, and we are putting it first because the people who repeat it are usually on our side. Cancer Research UK states it plainly: <strong>there have been no confirmed cases of popcorn lung linked to e-cigarettes.</strong> Diacetyl, the chemical behind it, was banned from UK and EU e-liquid in 2016. It is still legal in US e-liquid, and a Harvard analysis found it in 39 of 51 flavours — so it is a real reason to care where your liquid comes from. It is not a reason to believe you have a factory-worker lung disease.",
      source: "Cancer Research UK",
      sourceUrl: "https://www.cancerresearchuk.org/about-cancer/causes-of-cancer/does-vaping-cause-popcorn-lung"
    },
    {
      myth: "It's just water vapour",
      verdict: "False",
      reality:
        "There is no water in it. It is an aerosol of propylene glycol and glycerine droplets carrying nicotine, flavour chemicals, aldehydes made by heating the solvent, and metal shed from the coil. The metals are the tell: in 56 devices taken from daily users, median nickel in the aerosol was 68.4 µg/kg against 2.03 in the bottle it came from. It picked that up on the way out.",
      source: "Olmedo et al., Environmental Health Perspectives 2018",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/29467105/"
    },
    {
      myth: "Vapes have more formaldehyde than cigarettes",
      verdict: "False",
      reality:
        "This came from a 2015 experiment running a coil at 5.0 V — a setting experienced users reject immediately because it tastes burnt. Drop to a realistic 4.0 V and formaldehyde fell from 718 to 20 µg per 10 puffs. <strong>But do not over-correct.</strong> The same replication put a realistic day's formaldehyde only about a third below a 20-a-day smoker. Not worse than cigarettes. Not nothing either.",
      source: "Farsalinos replication, PMID 28864295",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/28864295/"
    },
    {
      myth: "It's 95% safer than smoking, so it's basically safe",
      verdict: "Partly true",
      reality:
        "The comparison is real and it is favourable. Measured in people, exclusive vapers carried 98% less NNAL than smokers; the UK's own review found nitrosamine and volatile-organic markers 58–94% lower. But \"safer than the most lethal consumer product ever sold\" is a low bar, and it is the wrong bar if you never smoked. Those numbers compare vaping to <em>smoking</em>. They say nothing about vaping compared to nothing.",
      source: "OHID, Nicotine vaping in England evidence review",
      sourceUrl: "https://www.gov.uk/government/publications/nicotine-vaping-in-england-2022-evidence-update/nicotine-vaping-in-england-2022-evidence-update-summary"
    },
    {
      myth: "Doctors recommend it, so it must be fine",
      verdict: "Partly true",
      reality:
        "For <em>smokers</em>, yes — and the evidence is strong. Cochrane rates it high-certainty that nicotine e-cigarettes beat patches and gum for quitting smoking, with a rate ratio of 1.55 (95% CI 1.28–1.88). Every participant in those trials was already a smoker. On the other question, the same UK government review is unambiguous: its findings \"reinforce the need to discourage people who have never smoked from taking up vaping.\" Two different questions. Two different answers.",
      source: "Cochrane review PMID 41212103; OHID evidence review",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/41212103/"
    },
    {
      myth: "60 mg of nicotine will kill you, so a bottle is a lethal dose",
      verdict: "False",
      reality:
        "The 60 mg figure traces back to dubious self-experiments from the nineteenth century, as a 2014 toxicology paper laid out in detail. The real lethal dose is far higher. This does not make e-liquid safe to leave lying around — 7,043 US poison-centre cases in one year, 87.8% of them children under five, settles that — but repeating a number that is demonstrably wrong just teaches people to stop listening.",
      source: "Mayer, Archives of Toxicology 2014, PMID 24091634",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/24091634/"
    },
    {
      myth: "Everyone's doing it",
      verdict: "False",
      reality:
        "Fewer people every year, actually. In the US, 5.2% of middle and high school students currently vape — down from a 2019 high-school peak of 27.5%. In Great Britain, 6% of 11–17s currently vape. The crowd is thinning out. What's left is a smaller group vaping much harder: 38% of young British vapers now do it daily.",
      source: "FDA / NYTS 2025; ASH Smokefree GB Youth Survey 2026",
      sourceUrl: "https://www.fda.gov/tobacco-products/ctp-newsroom/national-youth-tobacco-survey-fda-publishes-peer-reviewed-journal-article-releases-2025-findings"
    },
    {
      myth: "I could stop whenever I wanted",
      verdict: "False",
      reality:
        "Maybe. The trial numbers suggest otherwise: among 16–25 year olds who vaped daily and <em>wanted to quit</em>, weekly counselling plus a placebo got 14% there. A text-support referral on its own got 6%. The people in that study were motivated, supported, and being watched by researchers — and it still mostly didn't work without medication. If it turns out to be hard, that is the normal result, not a character flaw.",
      source: "Evins et al., JAMA 2025",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/40266580/"
    }
  ],

  /* ---- 08 · What happens after ----------------------------------------- */
  recovery: [
    {
      when: "Straight away",
      what: "The spike stops happening",
      note: "Every session was pushing your heart rate up around 18 bpm and your blood pressure up 12/10. That is an acute effect of the nicotine — no nicotine, no spike. It is the fastest thing on this list and it starts with the one you don't have.",
      tone: "alarm",
      source: "Randomised crossover trial, PMID 29991814",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/29991814/"
    },
    {
      when: "Day one",
      what: "The money stops leaving",
      note: "Whatever the calculator told you. This is the only item here that is arithmetic rather than biology, and it is the only one that starts at full strength immediately.",
      tone: "jade",
      source: "",
      sourceUrl: ""
    },
    {
      when: "The first week",
      what: "This is the worst of it — and it is the shortest part",
      note: "Cravings, irritability, trouble sleeping and trouble concentrating are strongest in the first few days to a couple of weeks. The US government's own quit service is blunt that the first week carries the highest relapse risk. Knowing the shape of the curve in advance is genuinely protective: this is the bit that ends.",
      tone: "alarm",
      source: "smokefree.gov, US National Cancer Institute",
      sourceUrl: "https://smokefree.gov/challenges-when-quitting/withdrawal/understanding-withdrawal"
    },
    {
      when: "Weeks two to four",
      what: "The symptoms get weaker and further apart",
      note: "Not gone on a fixed date — they fade, and they stop arriving as often. Anyone who gives you an exact day is making it up.",
      tone: "amber",
      source: "smokefree.gov",
      sourceUrl: "https://smokefree.gov/challenges-when-quitting/withdrawal/understanding-withdrawal"
    },
    {
      when: "After that",
      what: "Mood goes up, not down",
      note: "This is the finding that surprises people most. Across 102 studies and more than 169,500 people, stopping nicotine was associated with reduced anxiety (SMD −0.28) and reduced depression (SMD −0.30) compared with carrying on. The thing you think is holding your mood together is, on the evidence, sitting on it.",
      tone: "jade",
      source: "Cochrane review, PMID 33687070",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/33687070/"
    },
    {
      when: "An honest gap",
      what: "Nobody has run the famous chart for vaping",
      note: "You have seen the \"20 minutes / 12 hours / 1 year\" recovery graphic. Every number on it comes from cigarette research. There is no equivalent timeline for someone who only ever vaped, because the studies have not been done. We would rather tell you that than hand you a graphic that isn't about you.",
      tone: "amber",
      source: "Stated as an evidence gap",
      sourceUrl: ""
    }
  ],

  /* ---- 10 · Where to actually get help --------------------------------- */
  resources: [
    {
      where: "United States",
      name: "This is Quitting",
      what: "Free, anonymous text programme built with and for people aged 13–24 who vape. It is the one the JAMA trial used as its baseline support.",
      how: "Text DITCHVAPE to 88709",
      url: "https://truthinitiative.org/research-resources/quitting-smoking-vaping/quitting-e-cigarettes"
    },
    {
      where: "United States",
      name: "1-800-QUIT-NOW",
      what: "Free coaching from your state quitline. Also on 1-800-DEJÉLO-YA (Spanish), and lines in Mandarin, Cantonese, Korean and Vietnamese.",
      how: "1-800-784-8669 · smokefree.gov",
      url: "https://smokefree.gov/"
    },
    {
      where: "United Kingdom",
      name: "NHS stop smoking services",
      what: "Free, local, and they now advise on stopping vaping too — including nicotine replacement to taper with. Up to 12 weeks of support.",
      how: "nhs.uk/better-health/quit-smoking",
      url: "https://www.nhs.uk/better-health/quit-smoking/"
    },
    {
      where: "Australia",
      name: "Quitline",
      what: "Free confidential counselling for quitting smoking or vaping, with callbacks you can book for a time that suits you.",
      how: "13 7848 · quit.org.au",
      url: "https://www.quit.org.au/"
    },
    {
      where: "Canada",
      name: "Pan-Canadian quitline",
      what: "Free coaching, plus every provincial service — AlbertaQuits, QuitNow BC, Smokers' Helpline, iQuitnow and the rest.",
      how: "1-866-366-3667",
      url: "https://www.canada.ca/en/health-canada/services/smoking-tobacco/quit-smoking/provincial-territorial-services.html"
    },
    {
      where: "Ask about this one",
      name: "Varenicline",
      what: "A prescription tablet. In the trial above it took abstinence from 14% to 51% in daily vapers aged 16–25 who had never regularly smoked. Worth raising with a doctor rather than waiting to white-knuckle it.",
      how: "Talk to a GP or clinician",
      url: "https://pubmed.ncbi.nlm.nih.gov/40266580/"
    }
  ],

  /* ---- 11 · Sources ----------------------------------------------------- */
  sources: [
    { title: "OHID — Nicotine vaping in England: 2022 evidence update", url: "https://www.gov.uk/government/publications/nicotine-vaping-in-england-2022-evidence-update/nicotine-vaping-in-england-2022-evidence-update-summary", note: "biomarker reductions; the advice to never-smokers" },
    { title: "Cochrane — Electronic cigarettes for smoking cessation (PMID 41212103)", url: "https://pubmed.ncbi.nlm.nih.gov/41212103/", note: "RR 1.55 vs NRT, high certainty, in smokers" },
    { title: "NASEM — Public Health Consequences of E-Cigarettes (2018)", url: "https://nap.nationalacademies.org/catalog/24952/public-health-consequences-of-e-cigarettes", note: "conclusive evidence of toxic emissions; substantially lower exposure than smoking" },
    { title: "Cancer Research UK — Does vaping cause popcorn lung?", url: "https://www.cancerresearchuk.org/about-cancer/causes-of-cancer/does-vaping-cause-popcorn-lung", note: "no confirmed cases; diacetyl banned UK/EU 2016" },
    { title: "Olmedo et al. — Metal concentrations in e-cigarette liquid and aerosol (PMID 29467105)", url: "https://pubmed.ncbi.nlm.nih.gov/29467105/", note: "56 users' devices; nickel 68.4 vs 2.03 µg/kg; limits exceeded in ~half or more" },
    { title: "Farsalinos et al. — formaldehyde and the dry-puff artefact (PMID 28864295)", url: "https://pubmed.ncbi.nlm.nih.gov/28864295/", note: "718 µg at 5.0 V vs 20 µg at 4.0 V; realistic day ~32% below 20 cigarettes" },
    { title: "Allen et al. — Flavouring chemicals in e-cigarettes (PMID 26642857)", url: "https://pubmed.ncbi.nlm.nih.gov/26642857/", note: "diacetyl in 39 of 51 flavours, up to 239 µg" },
    { title: "Goniewicz et al. — Biomarkers in exclusive vapers (PMID 30646298)", url: "https://pubmed.ncbi.nlm.nih.gov/30646298/", note: "98% less NNAL than smokers; lead no different" },
    { title: "Acute cardiovascular effects of e-cigarettes (PMID 29991814)", url: "https://pubmed.ncbi.nlm.nih.gov/29991814/", note: "+18 bpm, +12/10 mmHg; nicotine-free arm null" },
    { title: "Flow-mediated dilation meta-analysis (PMID 38779295)", url: "https://pubmed.ncbi.nlm.nih.gov/38779295/", note: "−1.47% (95% CI −3.96 to 1.02) — not significant" },
    { title: "American Heart Association — e-cigarettes scientific statement", url: "https://newsroom.heart.org/news/current-evidence-identifies-health-risks-of-e-cigarette-use-long-term-research-needed", note: "acute effects established; long-term unknown" },
    { title: "Evins et al. — Varenicline for youth vaping cessation, JAMA 2025 (PMID 40266580)", url: "https://pubmed.ncbi.nlm.nih.gov/40266580/", note: "51% vs 14% vs 6%; n=261, ages 16–25" },
    { title: "Youth vaping dependence trends (PMID 38531767)", url: "https://pubmed.ncbi.nlm.nih.gov/38531767/", note: "strong daily urges 31.6% → 50.3%" },
    { title: "Cochrane — Mental health change after smoking cessation (PMID 33687070)", url: "https://pubmed.ncbi.nlm.nih.gov/33687070/", note: "anxiety SMD −0.28, depression SMD −0.30; 102 studies, 169,500 people" },
    { title: "Vaping and short sleep, within-person (PMID 42637626)", url: "https://pubmed.ncbi.nlm.nih.gov/42637626/", note: "adjusted OR 1.40 for <7 hours on vaping days" },
    { title: "Vaping in pregnancy and low birth weight (PMID 34259468)", url: "https://pubmed.ncbi.nlm.nih.gov/34259468/", note: "1.88× in exclusive vapers" },
    { title: "CDC MMWR — E-cigarette cases reported to poison centers (PMID 37347709)", url: "https://pubmed.ncbi.nlm.nih.gov/37347709/", note: "7,043 cases; 6,074 (87.8%) aged under 5" },
    { title: "Mayer — How much nicotine kills a human? (PMID 24091634)", url: "https://pubmed.ncbi.nlm.nih.gov/24091634/", note: "the 60 mg figure traces to 19th-century self-experiments" },
    { title: "Jackson, Shahab & Brown — Vaping expenditure in Great Britain, Tobacco Control 2026 (PMID 41922172)", url: "https://pubmed.ncbi.nlm.nih.gov/41922172/", note: "£6.13 → £8.39/week, +37.0%; disposables +42.6%; n=4,072" },
    { title: "US disposable vape prices, 2020–2022 (PMID 37536928)", url: "https://pubmed.ncbi.nlm.nih.gov/37536928/", note: "$8.49 → $14.07 per device; price per mL down 69.2%" },
    { title: "ASH — Use of vapes among young people in Great Britain, 2026", url: "https://ash.org.uk/uploads/youth-vaping-fact-sheet-2026-FINAL.pdf", note: "6% current, 19% ever, 38% of vapers daily, 62% harm misperception" },
    { title: "FDA — National Youth Tobacco Survey, 2025 findings", url: "https://www.fda.gov/tobacco-products/ctp-newsroom/national-youth-tobacco-survey-fda-publishes-peer-reviewed-journal-article-releases-2025-findings", note: "5.2% of US middle and high school students" },
    { title: "smokefree.gov — Understanding withdrawal", url: "https://smokefree.gov/challenges-when-quitting/withdrawal/understanding-withdrawal", note: "withdrawal peaks in the first days to a couple of weeks" },
    { title: "CDC — Vaping and quitting", url: "https://www.cdc.gov/tobacco/e-cigarettes/quitting.html", note: "quitline numbers and text programmes" }
  ],

  imageCredits: [
    { title: "E-cigarette device types", url: "https://commons.wikimedia.org/wiki/File:Disposable_and_rechargeable_e-cigarette_devices_and_common_chargers_2.jpg", credit: "US Food and Drug Administration — public domain" },
    { title: "Human lungs illustration", url: "https://commons.wikimedia.org/wiki/File:Human_Lungs_(NIH_BioArt_231_-_630887).png", credit: "NIH BioArt, Ryan Kissinger / NIAID — public domain" }
  ],

  /* ---- 09 · Quiz -------------------------------------------------------- */
  quiz: {
    questions: [
      {
        question: "Has vaping ever been confirmed to cause popcorn lung?",
        options: [
          "Yes — thousands of cases",
          "Yes, but only in heavy users",
          "No — not one confirmed case",
          "Only from black-market devices"
        ],
        correctIndex: 2,
        explanation: "Cancer Research UK states there have been no confirmed cases of popcorn lung linked to e-cigarettes. Diacetyl, the chemical behind the disease in factory workers, was banned from UK and EU e-liquid in 2016 — though it is still legal in the US, where a Harvard analysis found it in 39 of 51 flavours tested. It is a real reason to care where your liquid is made. It is not proof of a disease nobody has documented.",
        source: "Cancer Research UK",
        sourceUrl: "https://www.cancerresearchuk.org/about-cancer/causes-of-cancer/does-vaping-cause-popcorn-lung"
      },
      {
        question: "In devices taken from real daily users, where did most of the metal in the aerosol come from?",
        options: [
          "It was already in the e-liquid you bought",
          "The heating coil, on the way out",
          "The plastic mouthpiece",
          "There isn't measurable metal in the aerosol"
        ],
        correctIndex: 1,
        explanation: "In 56 devices sampled from daily users, median nickel measured 68.4 µg/kg in the aerosol against just 2.03 µg/kg in the refill bottle it came from. The metal is picked up in transit. Across those devices, aerosol levels exceeded health-based limits in close to half the samples or more for chromium, manganese, nickel and lead.",
        source: "Olmedo et al., Environmental Health Perspectives 2018",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/29467105/"
      },
      {
        question: "Compared with smokers, how much less NNAL — a tobacco-specific carcinogen marker — do people who only vape carry?",
        options: ["About 20% less", "About 50% less", "About 98% less", "The same amount"],
        correctIndex: 2,
        explanation: "98% less. This is the strongest fact in vaping's favour and it is not in dispute — measured in real people, not modelled. It is exactly why this page does not claim vaping is as bad as smoking. The catch is that the comparison is to smoking. Against using nothing, the UK's own review found vapers' toxicant exposure higher.",
        source: "Goniewicz et al., PMID 30646298; OHID evidence review",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/30646298/"
      },
      {
        question: "In a randomised trial, what share of motivated 16–25 year old daily vapers quit on counselling plus a placebo?",
        options: ["14%", "38%", "51%", "72%"],
        correctIndex: 0,
        explanation: "14% — and just 6% for those referred only to a text-support programme. Add varenicline and it jumped to 51%. Everyone in that trial wanted to stop and was getting weekly support. If quitting has been harder than you expected, that is the normal result rather than a personal failing, and medication is the thing that moved the number.",
        source: "Evins et al., JAMA 2025;333(21):1876–1886",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/40266580/"
      },
      {
        question: "Across 102 studies of more than 169,500 people, what happened to anxiety and depression after people stopped using nicotine?",
        options: [
          "Both got significantly worse",
          "No measurable change either way",
          "Both improved",
          "Anxiety improved, depression worsened"
        ],
        correctIndex: 2,
        explanation: "Both improved — anxiety SMD −0.28, depression SMD −0.30, compared with people who carried on. This runs directly against how it feels. The relief a vape gives a dependent user is largely withdrawal being switched off, so you are topping up to get back to baseline rather than rising above it.",
        source: "Cochrane review, PMID 33687070",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/33687070/"
      },
      {
        question: "US poison centres logged 7,043 e-cigarette exposure cases in a single year. What share involved children under five?",
        options: ["About 12%", "About 40%", "About 65%", "About 88%"],
        correctIndex: 3,
        explanation: "6,074 of the 7,043 cases — 87.8% — were children under five. Sweet smell, bright colours, left within reach. Whatever you decide about your own risk, this part of it isn't yours to accept on someone else's behalf.",
        source: "CDC MMWR 2023;72(25):694–695",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/37347709/"
      },
      {
        question: "What does the UK government's own evidence review say about people who have never smoked taking up vaping?",
        options: [
          "It encourages it as a safer alternative",
          "It says they should be discouraged from starting",
          "It takes no position",
          "It says the risk is identical to smoking"
        ],
        correctIndex: 1,
        explanation: "Its exact words: findings of higher absolute exposure from vaping compared with not using any nicotine products \"reinforce the need to discourage people who have never smoked from taking up vaping (or smoking).\" This is from the health authority most supportive of vaping anywhere in the world. For smokers switching, they are strongly in favour. For never-smokers starting, they are not.",
        source: "OHID, Nicotine vaping in England evidence review",
        sourceUrl: "https://www.gov.uk/government/publications/nicotine-vaping-in-england-2022-evidence-update/nicotine-vaping-in-england-2022-evidence-update-summary"
      },
      {
        question: "Where does the widely-repeated claim that 60 mg of nicotine kills an adult come from?",
        options: [
          "Modern clinical toxicology data",
          "WHO safety limits",
          "Self-experiments from the 1800s",
          "Animal studies from the 1970s"
        ],
        correctIndex: 2,
        explanation: "A 2014 paper in Archives of Toxicology traced the figure back to dubious nineteenth-century self-experiments. The real lethal dose is far higher. That does not make e-liquid safe around small children — the poison-centre numbers settle that — but repeating a figure that is demonstrably wrong is how people learn to tune out everything else you say.",
        source: "Mayer, Archives of Toxicology 2014, PMID 24091634",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/24091634/"
      },
      {
        question: "Roughly what did the average person who vapes in Great Britain report spending per week by April 2025?",
        options: ["About £2.50", "About £8.40", "About £19", "About £31"],
        correctIndex: 1,
        explanation: "£8.39 a week, up 37% in real terms since 2021 — about £436 a year. Spending rose fastest among people using disposables (+42.6%) and among the youngest vapers: modelled spend for 16-year-olds rose 143.5% to a peak in mid-2023. Based on 4,072 people in a representative survey.",
        source: "Jackson, Shahab & Brown, Tobacco Control 2026",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/41922172/"
      },
      {
        question: "Between 2020 and 2022, US disposable vapes got more expensive per device. What happened to the price of the liquid inside?",
        options: [
          "It rose even faster",
          "It stayed flat",
          "It fell by about 69%",
          "It fell by about 10%"
        ],
        correctIndex: 2,
        explanation: "The device price rose from $8.49 to $14.07 while the price per millilitre fell from $7.96 to $2.45 — down 69.2%. The devices got much bigger and much stronger. That is why it never feels like it is costing more: each purchase buys dramatically more nicotine than it used to.",
        source: "Tobacco Control, PMID 37536928",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/37536928/"
      },
      {
        question: "Does a well-designed study show that vaping damages your blood vessels the way smoking does?",
        options: [
          "Yes, the damage is identical",
          "No — the pooled difference wasn't statistically significant",
          "Yes, but only after ten years",
          "Nobody has ever looked"
        ],
        correctIndex: 1,
        explanation: "Pooled across studies, the flow-mediated dilation difference between vapers and non-users was −1.47%, with a confidence interval from −3.96 to +1.02 — it crosses zero. That is a finding of \"not shown\", and we would rather tell you than inflate it. Acute heart-rate and blood-pressure spikes are a different matter: those are well established.",
        source: "Meta-analysis, PMID 38779295",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/38779295/"
      },
      {
        question: "How many 11–17 year olds in Great Britain currently vape?",
        options: ["About 6%", "About 19%", "About 34%", "About 52%"],
        correctIndex: 0,
        explanation: "6% — around 370,000 — while 19% have ever tried it. So most young people don't, and most who tried it don't continue. What has changed is intensity: 38% of those who do vape now do it daily. Meanwhile 62% of young people wrongly believe vaping is as harmful as smoking or worse, up from 41% in 2022.",
        source: "ASH Smokefree GB Youth Survey 2026",
        sourceUrl: "https://ash.org.uk/uploads/youth-vaping-fact-sheet-2026-FINAL.pdf"
      }
    ],

    bands: [
      {
        min: 0.85,
        title: "You already knew most of this.",
        note: "Which means the gap was never information. If you want to stop and haven't, that is not an argument you lost with yourself — the trial data says willpower alone gets about 14% of motivated people there. The resources below are the part that actually moves the number."
      },
      {
        min: 0.6,
        title: "Better than most people manage.",
        note: "You got the honest ones right, including the questions where the answer was 'that's overstated'. Worth sitting with the money section again — of everything here, it's the number people find hardest to argue with."
      },
      {
        min: 0.35,
        title: "About half — which is roughly where everyone starts.",
        note: "Most of what circulates about vaping is either scare-copy or industry-copy, and both are wrong in opposite directions. The ones you missed are worth a second read; every answer above links to the study it came from."
      },
      {
        min: 0,
        title: "Almost none of that landed the way you expected.",
        note: "That is genuinely the most useful outcome here — it means what you'd been told was mostly wrong, in both directions. Scroll back through the myths section. Every claim on this page links to its source, so you don't have to take our word for any of it."
      }
    ]
  }
};
