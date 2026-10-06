> Complete-site v01 update: see [COMPLETE_SITE_V01.md](COMPLETE_SITE_V01.md). The product reframe supersedes the long-film scene durations. Articolo 32 is a legal protection service, not the technical origin of CareProgram/FarmaCOmm tokens; Prosperya is autonomous.

# PB-CARe 2.0 — SOURCE OF TRUTH

Questo documento è la fonte di verità progettuale del nuovo ecosistema digitale.
In caso di conflitto tra codice esistente e questo documento, il codice va
allineato a questo documento (o la contraddizione va segnalata, mai risolta
inventando).

## Missione del sito

PB-CARe 2.0 NON è un restyling di pbcare.it.

È il punto di ingresso e la **grammatica madre** di un nuovo ecosistema
digitale. Le altre superfici (CareProgram, FarmaCOmm, CAMIT,
EventiScientifici, ecc.) verranno ricostruite separatamente DOPO PB-CARe.

## Regola progettuale madre

> **PARENTI, NON GEMELLI.**

- ogni superficie avrà una propria identità (fenotipo);
- condivideranno grammatica, qualità, movimento, sistema;
- NON copie dello stesso template con colori diversi;
- i nuovi siti sostituiranno progressivamente le superfici legacy.

## Formato esperienziale (acquisito, da proteggere)

- one-page scrollytelling cinematografico;
- scene sticky/pinned, progresso normalizzato 0→1 per scena;
- Canvas 2D per materia/atmosfera/motion, DOM reale per testo e a11y;
- Lenis per smooth wheel;
- trasformazioni visibili durante lo scroll, profondità, grana, luce;
- responsive reale, non desktop ristretto;
- `prefers-reduced-motion` rispettato.

Il sito è un sistema che si trasforma davanti all'utente, NON una
presentazione a slide. NON regredire a hero→cards→servizi→footer.

## Principi funzionali non negoziabili

1. **CareProgram sa CHI sei. FarmaCOmm sa COSA accade nella cura.**
   Mai fusi nello stesso database, narrativamente o visivamente.

2. **La misura al posto della dichiarazione.** Eventi strutturati, tempo,
   aderenza, misure ed esiti reali — non claim.

3. **La persona controlla la connessione col professionista.** Nessun
   soggetto terzo può riattivare arbitrariamente una relazione revocata.

4. **Il welfare aziendale paga senza vedere la clinica.** L'azienda non
   vede storia clinica, utilizzo, dettagli sanitari.

5. **Nessuna "AI magica".** Evidenze/ipotesi con controllo umano. Mai
   algoritmi onniscienti o decisioni terapeutiche automatiche.

6. **Ricerca e aggregazione: k ≥ 5.** Mai visualizzare gruppi inferiori
   come insight aggregati significativi.

7. **Sicurezza senza claim assoluti.** Vietato: "impossibile da violare",
   "anonimo al 100%", "nessuno può accedere".

## Flussi tecnici — stato della conoscenza

- Direzione documentata: **CareProgram → FarmaCOmm** (server-to-server
  firmato, schema RS256 v2, anti-replay).
- **AMBIGUITÀ APERTA**: possibile flusso inverso FarmaCOmm → CareProgram
  per richieste di correzione — NON CHIARITO.
- Finché non chiarito: NON rappresentare graficamente come certo alcun
  flusso FarmaCOmm → CareProgram. Rappresentare solo ciò che è corretto.

## Regola visiva: codice prima delle immagini AI

Vietati come fondali decorativi: wallpaper generativi, persone
sintetiche, reti luminose generiche fotografiche, particelle senza
significato, DNA 3D, medical stock, estetica "AI obvious".

Privilegiati: Canvas, SVG, CSS, tipografia, composizione, spazio,
texture procedurali, grana, luce, motion, maschere, dati generati dal
codice. Gli asset grafici servono come IDENTITÀ REALE dei brand.

## Separazione CareProgram ↔ FarmaCOmm

Principio strutturale fondamentale del progetto:

- **CareProgram** conosce: persona, identità, nucleo, acquisti,
  beneficiari, fatturazione/economia, diritto a prestazioni,
  amministrazione/accesso alla rete. NON la storia clinica completa.
- **FarmaCOmm** lavora con identità pseudonimizzate: codice, nickname,
  età, sesso, provincia, diario, aderenza, eventi, esiti, dati
  longitudinali. NON nome/email in chiaro nella cartella clinica.

Esperienza già realizzata: scena "Il nome resta fuori" —
**"Il diritto attraversa il confine. L'identità no."**
Da proteggere, da rifinire in un pass successivo.
