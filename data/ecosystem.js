/* ==========================================================================
   PB-CARe 2.0 — ECOSYSTEM SOURCE OF TRUTH (data layer)

   Unica fonte strutturata per entità, ruoli, relazioni, palette, asset,
   link legacy e destinazioni future. Il rendering non deve duplicare
   queste informazioni altrove: legge sempre da qui.

   Convenzioni:
   - palette in hex; `rgb` = stringa "r,g,b" pronta per canvas rgba()
   - status: "current" (superficie attiva legacy) | "legacy" (da chiarire)
             | "target" (prossima superficie) | "future" (prevista)
   - currentUrl = link legacy esistente; futureUrl = destinazione prevista
   - constellation = presenza nella scena ecosistema attuale (angolo);
     null = non rappresentata come satellite (es. Prosperya è autonoma)
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
    rgbAccent: hex2rgb(accent),
    rgbAtmosphere: hex2rgb(atmosphere),
  });

  const ENTITIES = [
    {
      id: "pbcare",
      name: "PB-CARe",
      type: "orchestrator",
      role: "Orchestrazione, coordinamento e accesso pubblico dell'ecosistema",
      relation: "Grammatica madre — il coordinamento è uno solo",
      palette: pal("#155e75", "#0b3a4a", "#9fd8c9", "#071b24"),
      logo: "public/assets/brand/pbcare/logo.png",
      status: "target",
      currentUrl: "https://pbcare.it/",
      futureUrl: null, // questo sito
      constellation: null, // è l'hub, non un satellite
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
      logo: "public/assets/brand/careprogram/logo.png",
      status: "current",
      currentUrl: "https://careprogram.it/",
      futureUrl: null, // superficie dedicata futura
      constellation: { angle: 197, meta: "per le persone · careprogram.it" },
      footerLink: false,
      notes: "NON contiene la storia clinica completa. Flusso documentato: CareProgram → FarmaCOmm (RS256 v2).",
    },
    {
      id: "camit",
      name: "Cannabis Medica Italia",
      short: "CAMIT",
      type: "surface",
      role: "Esperienza clinica pubblica del percorso cannabis medica",
      relation: "Percorso clinico pubblico — metodo CAMIT",
      palette: pal("#2fae8f", "#9fb3ad", "#5fd4b4", "#0a2420"),
      logo: "public/assets/brand/camit/logo.png",
      status: "current",
      currentUrl: "https://cannabismedicaitalia.it/",
      futureUrl: null,
      constellation: { angle: 241, meta: "per le persone · metodo camit" },
      footerLink: true,
      notes: "Superficie da rifare dopo PB-CARe 2.0.",
    },
    {
      id: "articolo-32",
      name: "Articolo 32",
      type: "service",
      role: "Tutela legale del paziente",
      relation: "Il diritto dentro il sistema",
      palette: pal("#9fd8c9", "#5f7a72", "#f1c847", "#0a1f1b"),
      logo: null,
      status: "current",
      currentUrl: "https://articolo32.it/",
      futureUrl: null,
      constellation: { angle: 288, meta: "per le persone · tutela legale", anchor: "#s3" },
      footerLink: false,
      notes: "Peso narrativo da collocare nel master model — non eliminare automaticamente.",
    },
    {
      id: "farmacomm",
      name: "FarmaCOmm",
      type: "platform",
      role: "Livello clinico/tecnico-operativo: cartella pseudonimizzata, diario, aderenza, eventi, esiti, conoscenza",
      relation: "Sa COSA accade nella cura — identità pseudonimizzate",
      palette: pal("#2e86c1", "#123c5a", "#4fd8e0", "#071b2b"),
      logo: "public/assets/brand/farmacomm/logo.png",
      status: "current",
      currentUrl: "https://www.farmacomm.com/",
      futureUrl: "hub conoscenza: eventiscientifici.farmacomm.com · pubblicazioni.farmacomm.com",
      constellation: { angle: 335, meta: "la piattaforma · arte galenica" },
      footerLink: true,
      notes: "NON conosce nome/email in chiaro nella cartella. Flusso inverso → CareProgram NON chiarito: non rappresentare.",
    },
    {
      id: "enzima",
      name: "Enzima",
      type: "department",
      role: "Dipartimento Ricerca & Sviluppo di PB-CARe: ricerca, progettualità, osservazione → progetto",
      relation: "Dipartimento interno — NON società separata",
      palette: pal("#2bb8c9", "#4fd8b0", "#7fe8e0", "#06222a"),
      logo: "public/assets/brand/enzima/logo.png",
      status: "current",
      currentUrl: "https://enzimamilano.it/",
      futureUrl: null,
      constellation: { angle: 20, meta: "ricerca & sviluppo", anchor: "#s4" },
      footerLink: false,
      notes: "Le parti commerciali/finanza agevolata del prototipo NON sono automaticamente corrette. Non sovrapporre a Prosperya.",
    },
    {
      id: "eventi-scientifici",
      name: "Eventi Scientifici",
      type: "surface",
      role: "Formazione e conoscenza scientifica collegata all'ambiente FarmaCOmm",
      relation: "Superficie della conoscenza — non entità orbitante casuale",
      palette: pal("#3f9fe0", "#6fd0ff", "#a8e4ff", "#0a1f30"),
      logo: "public/assets/brand/eventi-scientifici/logo.png", // SOLO versione fluida
      status: "current",
      currentUrl: "https://eventiscientifici.com/",
      futureUrl: "eventiscientifici.farmacomm.com",
      constellation: { angle: 62, meta: "per le aziende · formazione" },
      footerLink: true,
      notes: "Usare solo 'Logo fluido EventiScientifici.png'.",
    },
    {
      id: "prosperya",
      name: "Prosperya",
      type: "company",
      role: "Società distinta e autonoma — business advisory",
      relation: "Relazione con l'ecosistema, identità propria — NON satellite interno",
      palette: pal("#d4a94f", "#5a8ac0", "#e07a5f", "#221c12"),
      multicolor: true, // anello di cerchi colorati — mai ridurre a un colore
      logo: "public/assets/brand/prosperya/logo.png",
      status: "current",
      currentUrl: "https://prosperya.it/",
      futureUrl: null,
      constellation: null, // autonoma: non orbita come satellite
      footerLink: false,
      notes: "Marchio non reinventabile: anello + PROSPERYA + BUSINESS ADVISORY + IDEE·OPPORTUNITÀ·CRESCITA.",
    },
    {
      id: "integralinea",
      name: "Integralinea",
      type: "shop",
      role: "Superficie/shop distinta — ruolo da definire",
      relation: "Da collocare nel master model",
      palette: pal("#8a9a94", "#5f6f6a", "#aec3bb", "#101a17"), // placeholder neutro — ridefinire con l'asset
      logo: null, // asset mancante — vedi docs/ASSET_MANIFEST.md
      status: "future",
      currentUrl: "https://integralinea.it/",
      futureUrl: null,
      constellation: null,
      footerLink: false,
      notes: "Non inventare il ruolo oltre i materiali disponibili. Asset logo mancante.",
    },
    {
      id: "gruppo-trua",
      name: "Gruppo Trua",
      type: "company",
      role: "Finanza agevolata — posizione nel master model da chiarire",
      relation: "LEGACY — in attesa di definizione",
      palette: pal("#c9a86a", "#8a7a58", "#e0c078", "#1c1810"),
      logo: null,
      status: "legacy",
      currentUrl: "https://www.gruppotrua.it/",
      futureUrl: null,
      constellation: { angle: 112, meta: "per le aziende · finanza agevolata" },
      footerLink: true,
      notes: "⚠ Presente nel prototipo ma non definito nel master model. Mantenuto come legacy fino a chiarimento.",
    },
  ];

  // ordine di attivazione nella costellazione = ordine del manifest
  const byId = {};
  ENTITIES.forEach(e => (byId[e.id] = e));
  const CONSTELLATION = ENTITIES.filter(e => e.constellation);
  const FOOTER_LINKS = ENTITIES.filter(e => e.footerLink && e.currentUrl);

  window.PBCARE_ECOSYSTEM = { ENTITIES, CONSTELLATION, FOOTER_LINKS, byId };
})();
