/* ==========================================================================
   PB-CARe 2.0 — ECOSYSTEM SOURCE OF TRUTH (data layer)

   Unica fonte strutturata per entità, ruoli, relazioni, palette, asset,
   link legacy e destinazioni future. Il rendering non deve duplicare
   queste informazioni altrove: legge sempre da qui.

   Convenzioni:
   - palette in hex; `rgb*` = stringa "r,g,b" pronta per canvas rgba()
   - status: "current" (superficie attiva) | "legacy" (da chiarire)
             | "target" (prossima superficie) | "future" (prevista)
   - currentUrl = link esistente; urlStatus marca i link NON verificati
   - futureUrl = destinazione prevista nel master model
   - layer = livello di profondità nella narrativa del sistema
     (NON satelliti equivalenti — vedi docs/SCENE_BLUEPRINT.md)
   - narrative: false = l'entità NON entra nel racconto principale
     della home (resta documentata, non rappresentata)
   - docs di riferimento: docs/ECOSYSTEM_MAP.md, docs/BRAND_ROLES.md
   ========================================================================== */

(function () {
  "use strict";

  const hex2rgb = h => {
    const n = parseInt(h.slice(1), 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  };
  const pal = (primary, secondary, accent, atmosphere) => ({
    primary, secondary, accent, atmosphere,
    rgbPrimary: hex2rgb(primary),
    rgbSecondary: hex2rgb(secondary),
    rgbAccent: hex2rgb(accent),
    rgbAtmosphere: hex2rgb(atmosphere),
  });

  /* Livelli di profondità del sistema — ordine narrativo.
     Le entità si collocano su un layer, mai come satelliti equivalenti. */
  const LAYERS = [
    { id: "identita",   label: "identità",   hint: "chi sei" },
    { id: "clinica",    label: "clinica",    hint: "cosa accade nella cura" },
    { id: "conoscenza", label: "conoscenza", hint: "ciò che si condivide" },
    { id: "ricerca",    label: "ricerca",    hint: "ciò che trasforma" },
    { id: "esterna",    label: "esterna",    hint: "società connesse" },
  ];

  const ENTITIES = [
    {
      id: "pbcare",
      name: "PB-CARe",
      type: "orchestrator",
      role: "Orchestrazione, coordinamento e accesso pubblico dell'ecosistema",
      relation: "Grammatica madre — il coordinamento è uno solo",
      palette: pal("#155e75", "#0b3a4a", "#9fd8c9", "#071b24"),
      logo: "assets/brand/pbcare/logo.png",
      status: "target",
      currentUrl: "https://pbcare.it/",
      futureUrl: null, // questo sito
      layer: null, // è il sistema stesso, non un livello
      narrative: false,
      footerLink: false,
      notes: "Non una holding con loghi: sistema di relazioni, accessi, continuità, misura, conoscenza, ricerca.",
    },
    {
      id: "careprogram",
      name: "CareProgram",
      type: "platform",
      role: "Livello identità/economia: persona, nucleo, acquisti, beneficiari, fatturazione, diritti, accesso rete",
      relation: "Sa CHI sei — separato strutturalmente dalla clinica",
      palette: pal("#3f9d63", "#e58a3a", "#5abf78", "#0a2418"), // CARE verde + PROGRAM arancione — non cambiare
      logo: "assets/brand/careprogram/logo.png",
      status: "current",
      currentUrl: "https://careprogram.it/",
      futureUrl: null, // superficie dedicata futura
      layer: "identita",
      layerMeta: "identità · economia · diritti",
      narrative: true,
      footerLink: false,
      notes: "NON contiene la storia clinica completa. Flusso documentato: CareProgram → FarmaCOmm (RS256 v2).",
    },
    {
      id: "articolo-32",
      name: "Articolo 32",
      type: "service",
      role: "Tutela legale del paziente",
      relation: "Servizio specifico di tutela legale; distinto dal meccanismo di accesso alle prestazioni",
      palette: pal("#9fd8c9", "#5f7a72", "#f1c847", "#0a1f1b"),
      logo: null,
      status: "current",
      currentUrl: "https://pbcare.it/articolo-32/", // verificato sul sito PB-CARe
      urlStatus: "da verificare",
      futureUrl: null,
      layer: "tutela",
      layerMeta: "servizio di tutela legale",
      layerAnchor: "#tutela",
      narrative: true,
      footerLink: false,
      notes: "Non è il fondamento tecnico del token CareProgram/FarmaCOmm.",
    },
    {
      id: "farmacomm",
      name: "FarmaCOmm",
      type: "platform",
      role: "Livello clinico/tecnico-operativo: cartella pseudonimizzata, diario, aderenza, eventi, esiti — ambiente della conoscenza",
      relation: "Sa COSA accade nella cura — identità pseudonimizzate",
      palette: pal("#2e86c1", "#123c5a", "#4fd8e0", "#071b2b"),
      logo: "assets/brand/farmacomm/logo.png",
      status: "current",
      currentUrl: "https://www.farmacomm.com/",
      futureUrl: "hub conoscenza: eventiscientifici.farmacomm.com · pubblicazioni.farmacomm.com",
      layer: "clinica",
      layerMeta: "ambiente clinico · conoscenza",
      narrative: true,
      footerLink: true,
      notes: "NON conosce nome/email in chiaro nella cartella. Flusso inverso → CareProgram NON chiarito: non rappresentare.",
    },
    {
      id: "camit",
      name: "Cannabis Medica Italia",
      short: "CAMIT",
      type: "surface",
      role: "Esperienza clinica pubblica del percorso cannabis medica",
      relation: "Percorso clinico dentro il sistema — non satellite",
      palette: pal("#2fae8f", "#9fb3ad", "#5fd4b4", "#0a2420"),
      logo: "assets/brand/camit/logo.png",
      status: "current",
      currentUrl: "https://cannabismedicaitalia.it/",
      futureUrl: null,
      layer: "clinica",
      layerMeta: "percorso clinico pubblico",
      narrative: true,
      footerLink: true,
      notes: "Superficie da rifare dopo PB-CARe 2.0. Niente cliché visivi cannabis.",
    },
    {
      id: "eventi-scientifici",
      name: "Eventi Scientifici",
      type: "surface",
      role: "Formazione e conoscenza scientifica collegata all'ambiente FarmaCOmm",
      relation: "Superficie che emerge DALL'ambiente conoscenza FarmaCOmm",
      palette: pal("#3f9fe0", "#6fd0ff", "#a8e4ff", "#0a1f30"),
      logo: "assets/brand/eventi-scientifici/logo.png", // SOLO versione fluida
      status: "current",
      currentUrl: null, // dominio storico eventiscientifici.com: 502 alla verifica
      urlStatus: "da verificare", // .com vs .it non confermato nel materiale
      futureUrl: "eventiscientifici.farmacomm.com",
      layer: "conoscenza",
      layerMeta: "conoscenza condivisa",
      narrative: true,
      footerLink: true,
      notes: "Usare solo 'Logo fluido EventiScientifici.png'.",
    },
    {
      id: "enzima",
      name: "Enzima",
      type: "department",
      role: "Dipartimento Ricerca & Sviluppo di PB-CARe: osservazione → ricerca → progetto → applicazione → impatto",
      relation: "Dipartimento interno — NON società separata, NON Prosperya",
      palette: pal("#2bb8c9", "#4fd8b0", "#7fe8e0", "#06222a"),
      logo: "assets/brand/enzima/logo.png",
      status: "current",
      currentUrl: null, // enzimamilano.it NON verificato — nessun link finché non confermato
      urlStatus: "da verificare",
      futureUrl: null,
      layer: "ricerca",
      layerMeta: "dipartimento R&S · PB-CARe",
      layerAnchor: "#research",
      narrative: true,
      footerLink: false,
      notes: "Ciclo: osservazione, ricerca, progetto, applicazione, impatto/feedback. Nessun claim commerciale/finanza agevolata finché non confermato.",
    },
    {
      id: "prosperya",
      name: "Prosperya",
      type: "company",
      role: "Società distinta e autonoma — business advisory",
      relation: "Relazione esterna — NON satellite interno, NON dipartimento",
      palette: pal("#d4a94f", "#5a8ac0", "#e07a5f", "#221c12"),
      multicolor: true, // anello di cerchi colorati — mai ridurre a un colore
      logo: "assets/brand/prosperya/logo.png",
      status: "current",
      currentUrl: "https://www.prosperya.it/",
      futureUrl: null,
      layer: "esterna",
      layerMeta: "società autonoma · advisory",
      external: true, // connessione tratteggiata, non appartiene all'anello
      narrative: true,
      footerLink: false,
      notes: "Marchio non reinventabile: anello + PROSPERYA + BUSINESS ADVISORY + IDEE·OPPORTUNITÀ·CRESCITA.",
    },
  ];

  const byId = {};
  ENTITIES.forEach(e => (byId[e.id] = e));

  // entità della narrativa, raggruppate per layer nell'ordine definito
  const NARRATIVE = LAYERS.map(l => ({
    ...l,
    entities: ENTITIES.filter(e => e.narrative && e.layer === l.id),
  })).filter(l => l.entities.length);

  const FOOTER_LINKS = ENTITIES.filter(e => e.footerLink && e.currentUrl);

  window.PBCARE_ECOSYSTEM = { ENTITIES, LAYERS, NARRATIVE, FOOTER_LINKS, byId };
})();
