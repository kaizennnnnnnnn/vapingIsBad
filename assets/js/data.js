/* PLACEHOLDER-DATA — design harness only. Replaced by verified research. */
window.VB = {
  money: {
    defaultCurrency: "USD",
    investmentReturn: 0.07,
    nicotineMgPerCigaretteEquivalent: 2,
    nicotineNote: "PLACEHOLDER nicotine equivalence note.",
    regionToCurrency: { US: "USD", GB: "GBP", CA: "CAD", AU: "AUD", IE: "EUR", DE: "EUR", PH: "PHP" },
    currencies: {
      USD: { symbol: "$", label: "US dollar ($)" },
      GBP: { symbol: "£", label: "Pound sterling (£)" },
      EUR: { symbol: "€", label: "Euro (€)" },
      CAD: { symbol: "CA$", label: "Canadian dollar (CA$)" },
      AUD: { symbol: "A$", label: "Australian dollar (A$)" },
      PHP: { symbol: "₱", label: "Philippine peso (₱)" }
    },
    modes: {
      disposable: { unitQuestion: "Disposables a week", unitSingular: "device", unitPlural: "devices", priceQuestion: "Price each", min: 1, max: 21, step: 1, defaultUnits: 5, mlQuestion: "Liquid per device", ml: { USD: 10, GBP: 2, EUR: 2, CAD: 10, AUD: 2, PHP: 10 }, price: { USD: 15, GBP: 5.5, EUR: 6, CAD: 18, AUD: 25, PHP: 450 } },
      pod: { unitQuestion: "Pods a week", unitSingular: "pod", unitPlural: "pods", priceQuestion: "Price per pod", min: 1, max: 35, step: 1, defaultUnits: 7, mlQuestion: "Liquid per pod", ml: { USD: 2, GBP: 2, EUR: 2, CAD: 2, AUD: 2, PHP: 2 }, price: { USD: 6.87, GBP: 3, EUR: 3.5, CAD: 7, AUD: 9, PHP: 200 } },
      bottle: { unitQuestion: "Bottles a week", unitSingular: "bottle", unitPlural: "bottles", priceQuestion: "Price per bottle", min: 1, max: 14, step: 1, defaultUnits: 2, mlQuestion: "Bottle size", ml: { USD: 30, GBP: 10, EUR: 10, CAD: 30, AUD: 30, PHP: 30 }, price: { USD: 12, GBP: 4, EUR: 5, CAD: 15, AUD: 16, PHP: 300 } }
    },
    swaps: [
      { label: "PLACEHOLDER swap", price: { USD: 100, GBP: 80, EUR: 90, CAD: 130, AUD: 150, PHP: 5000 } },
      { label: "PLACEHOLDER swap two", price: { USD: 900, GBP: 750, EUR: 850, CAD: 1200, AUD: 1400, PHP: 50000 } }
    ]
  },
  chemicals: [
    { formula: "CH2O", name: "Formaldehyde", what: "PLACEHOLDER description of the compound and what it does.", alsoIn: "embalming fluid" },
    { formula: "C3H4O", name: "Acrolein", what: "PLACEHOLDER description.", alsoIn: "weedkiller" },
    { formula: "Ni", name: "Nickel", what: "PLACEHOLDER description.", alsoIn: "coil metal" },
    { formula: "Pb", name: "Lead", what: "PLACEHOLDER description.", alsoIn: "solder joints" }
  ],
  headFacts: [
    { title: "PLACEHOLDER fact", body: "PLACEHOLDER body copy for a fact card so the grid can be measured.", evidence: "high", source: "Source name", sourceUrl: "" },
    { title: "PLACEHOLDER fact two", body: "PLACEHOLDER body copy.", evidence: "medium", source: "Source name", sourceUrl: "" },
    { title: "PLACEHOLDER fact three", body: "PLACEHOLDER body copy.", evidence: "high", source: "Source name", sourceUrl: "" }
  ],
  visibleFacts: [
    { title: "PLACEHOLDER visible", body: "PLACEHOLDER body copy.", evidence: "high", source: "Source", sourceUrl: "" },
    { title: "PLACEHOLDER visible two", body: "PLACEHOLDER body copy.", evidence: "medium", source: "Source", sourceUrl: "" },
    { title: "PLACEHOLDER visible three", body: "PLACEHOLDER body copy.", evidence: "high", source: "Source", sourceUrl: "" }
  ],
  bodyFacts: [
    { title: "PLACEHOLDER body fact", body: "PLACEHOLDER body copy.", evidence: "high", source: "Source", sourceUrl: "" },
    { title: "PLACEHOLDER body fact two", body: "PLACEHOLDER body copy.", evidence: "medium", source: "Source", sourceUrl: "" },
    { title: "PLACEHOLDER body fact three", body: "PLACEHOLDER body copy.", evidence: "low", source: "Source", sourceUrl: "" }
  ],
  nicotineChart: { title: "Nicotine", unit: "mg", source: "", points: [
    { label: "One cigarette", value: 12, tone: "muted" },
    { label: "One pod", value: 40 },
    { label: "One big disposable", value: 300 }
  ]},
  myths: [
    { myth: "It's just water vapour", verdict: "False", reality: "PLACEHOLDER correction text.", source: "Source", sourceUrl: "" },
    { myth: "It's 95% safer, so it's safe", verdict: "Partly true", reality: "PLACEHOLDER correction text.", source: "Source", sourceUrl: "" }
  ],
  recovery: [
    { when: "20 minutes", what: "PLACEHOLDER milestone", note: "PLACEHOLDER note.", tone: "alarm", source: "Source", sourceUrl: "" },
    { when: "72 hours", what: "PLACEHOLDER milestone", note: "PLACEHOLDER note.", tone: "amber", source: "Source", sourceUrl: "" },
    { when: "3 months", what: "PLACEHOLDER milestone", note: "PLACEHOLDER note.", tone: "jade", source: "Source", sourceUrl: "" }
  ],
  resources: [
    { where: "Worldwide", name: "PLACEHOLDER resource", what: "PLACEHOLDER description.", how: "example.org", url: "https://example.org" },
    { where: "US", name: "PLACEHOLDER resource", what: "PLACEHOLDER description.", how: "Text QUIT", url: "https://example.org" }
  ],
  sources: [
    { title: "PLACEHOLDER source", url: "https://example.org", note: "what it supports" }
  ],
  imageCredits: [],
  quiz: {
    questions: [
      { question: "PLACEHOLDER question one?", options: ["A", "B", "C", "D"], correctIndex: 1, explanation: "PLACEHOLDER explanation.", source: "Source", sourceUrl: "" },
      { question: "PLACEHOLDER question two?", options: ["A", "B", "C", "D"], correctIndex: 0, explanation: "PLACEHOLDER explanation.", source: "Source", sourceUrl: "" }
    ],
    bands: [
      { min: 0.8, title: "PLACEHOLDER band", note: "PLACEHOLDER note." },
      { min: 0.5, title: "PLACEHOLDER band", note: "PLACEHOLDER note." },
      { min: 0, title: "PLACEHOLDER band", note: "PLACEHOLDER note." }
    ]
  }
};
